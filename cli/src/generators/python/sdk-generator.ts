import { ContractGraph } from '../../types/model';
import { GeneratorContext } from '../base';
import { ConfigGenerator } from './config-generator';
import { SDKGenerationConfig } from '../../types/config';

export class SdkGenerator {
    private outDir: string;

    constructor(outDir: string, _options: any) {
        this.outDir = outDir;
    }

    async generateSdk(
        _graph: ContractGraph,
        context: GeneratorContext,
        _configGenerator: ConfigGenerator,
        sdkConfig: SDKGenerationConfig
    ): Promise<void> {
        const className = sdkConfig.className || 'ContractSDK';
        const fileName = sdkConfig.fileName || 'sdk';
        const lazyLoad = sdkConfig.lazyLoad !== false;
        const skipZeroAddresses = sdkConfig.skipZeroAddresses !== false;

        this.log(`Generating Python SDK class: ${className}`);

        // Build contract aliases and addresses from networks
        const contractAliases = new Map<string, string>();
        const contractAddresses = new Map<string, string>();

        const networks = context.networks || {};
        Object.entries(networks).forEach(([_networkName, networkConfig]) => {
            const contracts = (networkConfig as any)?.contracts || {};
            Object.entries(contracts).forEach(([key, value]) => {
                if (typeof value === 'string') {
                    contractAliases.set(key, key);
                    contractAddresses.set(key, value);
                } else {
                    const contractName = (value as any).name || key;
                    contractAliases.set(key, contractName);
                    contractAddresses.set(key, (value as any).address || '');
                }
            });
        });

        // Filter out zero addresses if enabled
        const filteredAliases = new Map<string, string>();
        if (skipZeroAddresses) {
            contractAliases.forEach((contractClass, alias) => {
                const address = contractAddresses.get(alias);
                if (address && address !== '0x0000000000000000000000000000000000000000') {
                    filteredAliases.set(alias, contractClass);
                }
            });
        } else {
            contractAliases.forEach((contractClass, alias) => {
                filteredAliases.set(alias, contractClass);
            });
        }

        // Generate the SDK file
        const sdkContent = this.generateSdkContent(className, filteredAliases, lazyLoad);
        this.writeFile(`src/${fileName}.py`, sdkContent);

        this.logSuccess(`Generated Python SDK class: ${className}`);
    }

    private generateSdkContent(className: string, contractAliases: Map<string, string>, lazyLoad: boolean): string {
        const imports = this.generateImports(contractAliases);
        const interfaceContent = this.generateInterface(className);
        const classContent = this.generateClass(className, contractAliases, lazyLoad);

        return `${imports}

${interfaceContent}

${classContent}`;
    }

    private generateImports(contractAliases: Map<string, string>): string {
        const uniqueClasses = Array.from(new Set(contractAliases.values()));
        const contractImports = uniqueClasses.map(className =>
            `from .contracts.${this.toSnakeCase(className)}.${this.toSnakeCase(className)} import ${className}`
        ).join('\n');

        return `"""Auto-generated SDK class for smart contracts"""
from typing import Optional, Dict, Any
from web3 import Web3
from .config.addresses import get_network_contracts

${contractImports}`;
    }

    private generateInterface(className: string): string {
        return `class ${className}Config:
    """Configuration for ${className}"""
    
    def __init__(
        self,
        web3: Web3,
        network: str = 'anvil',
        force_sdk_load: bool = False
    ):
        self.web3 = web3
        self.network = network
        self.force_sdk_load = force_sdk_load`;
    }

    private generateClass(className: string, contractAliases: Map<string, string>, lazyLoad: boolean): string {
        const getters = this.generateGetters(contractAliases, lazyLoad);
        const helperMethods = this.generateHelperMethods(className, contractAliases);

        return `class ${className}:
    """Unified SDK class for smart contracts"""
    
    def __init__(self, config: ${className}Config):
        self.web3 = config.web3
        self.network = config.network
        self.addresses = get_network_contracts(self.network)
        
        # Lazy-loaded instances
${Array.from(contractAliases.keys()).map(alias => `        self._${this.toSnakeCase(alias)}: Optional[${contractAliases.get(alias)}] = None`).join('\n')}
        
        if config.force_sdk_load:
            self._load_all_contracts()
    
    def _load_all_contracts(self) -> None:
        """Force instantiation of all contracts"""
${Array.from(contractAliases.keys()).map(alias => `        self.${this.toSnakeCase(alias)}`).join('\n')}

${getters}

${helperMethods}`;
    }


    private generateGetters(contractAliases: Map<string, string>, lazyLoad: boolean): string {
        return Array.from(contractAliases.entries()).map(([alias, contractClass]) => {
            const propertyName = this.toSnakeCase(alias);

            if (lazyLoad) {
                return `    @property
    def ${propertyName}(self) -> ${contractClass}:
        """Get ${alias} contract instance"""
        if self._${propertyName} is None:
            address = self.addresses.get('${alias}')
            if not address:
                raise ValueError(f"Contract address not found for: ${alias}")
            self._${propertyName} = ${contractClass}(self.web3, address)
        return self._${propertyName}`;
            } else {
                return `    @property
    def ${propertyName}(self) -> ${contractClass}:
        """Get ${alias} contract instance"""
        address = self.addresses.get('${alias}')
        if not address:
            raise ValueError(f"Contract address not found for: ${alias}")
        return ${contractClass}(self.web3, address)`;
            }
        }).join('\n\n');
    }

    private generateHelperMethods(_className: string, contractAliases: Map<string, string>): string {
        return `    def get_contract_address(self, contract_name: str) -> str:
        """Get contract address by name"""
        address = self.addresses.get(contract_name)
        if not address:
            raise ValueError(f"Contract address not found for: {contract_name}")
        return address
    
    def get_available_contracts(self) -> list[str]:
        """Get list of available contract names"""
        return list(self.addresses.keys())
    
    def set_web3(self, web3: Web3) -> None:
        """Update Web3 instance and reset contract instances"""
        self.web3 = web3
        # Reset instances to pick up new Web3 instance
${Array.from(contractAliases.keys()).map(alias => `        self._${this.toSnakeCase(alias)} = None`).join('\n')}`;
    }

    private toSnakeCase(str: string): string {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    }

    private log(message: string): void {
        console.log(`  ${message}`);
    }

    private logSuccess(message: string): void {
        console.log(`  ✓ ${message}`);
    }

    private writeFile(relativePath: string, content: string): void {
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.join(this.outDir, relativePath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, content);
    }
}

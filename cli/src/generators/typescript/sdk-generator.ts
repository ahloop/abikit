/**
 * SDK generator for unified contract access
 */

import { ContractGraph } from '../../types/model';
import { GeneratorContext } from '../base';
import { SDKGenerationConfig, TypeScriptTargetOptions } from '../../types/config';
import { ConfigGenerator } from './config-generator';

export class SdkGenerator {
    private outDir: string;

    constructor(outDir: string, _options: TypeScriptTargetOptions) {
        this.outDir = outDir;
    }

    async generateSdk(
        graph: ContractGraph,
        context: GeneratorContext,
        configGenerator: ConfigGenerator,
        sdkConfig: SDKGenerationConfig
    ): Promise<void> {
        const className = sdkConfig.className || 'ContractSDK';
        const fileName = sdkConfig.fileName || 'sdk';
        const lazyLoad = sdkConfig.lazyLoad !== false;
        const skipZeroAddresses = sdkConfig.skipZeroAddresses !== false;

        // Get contract mappings from config generator (for future use)
        configGenerator.getContractMappings();

        // Build contract list from networks
        const networks = context.networks || {};
        const networkNames = Object.keys(networks);

        // Collect contracts with their mappings
        const contractAliases = new Map<string, string>(); // alias -> contract class
        const contractAddresses = new Map<string, string>(); // alias -> address

        networkNames.forEach(network => {
            const networkConfig = networks[network];
            const contracts = (networkConfig as any)?.contracts || {};

            Object.entries(contracts).forEach(([alias, value]) => {
                let address: string;
                let contractClass: string;

                if (typeof value === 'string') {
                    address = value;
                    contractClass = alias;
                } else {
                    address = (value as any).address || '0x0000000000000000000000000000000000000000';
                    contractClass = (value as any).name || alias;
                }

                // Skip zero addresses if configured
                if (skipZeroAddresses && address === '0x0000000000000000000000000000000000000000') {
                    return;
                }

                // Only include if contract class exists in graph
                if (graph.contracts.has(contractClass) && !graph.contracts.get(contractClass)?.isInterface) {
                    contractAliases.set(alias, contractClass);
                    contractAddresses.set(alias, address);
                }
            });
        });

        // Generate imports
        const imports = this.generateImports(contractAliases);

        // Generate interface
        const interfaceContent = this.generateInterface(className);

        // Generate class
        const classContent = this.generateClass(
            className,
            contractAliases,
            contractAddresses,
            lazyLoad
        );

        const content = `${imports}

${interfaceContent}

${classContent}
`;

        this.writeFile(`src/${fileName}.ts`, content);
    }

    private generateImports(contractAliases: Map<string, string>): string {
        const uniqueContractClasses = new Set(contractAliases.values());

        const viemImports = `import type { PublicClient, WalletClient, Address } from 'viem';`;
        const configImports = `import { NETWORK_CONTRACTS, getNetworkAddresses } from './config/addresses';`;

        const contractImports = Array.from(uniqueContractClasses)
            .map(contractClass => `import { ${contractClass} } from './contracts/${contractClass}';`)
            .join('\n');

        return `${viemImports}
${configImports}
${contractImports}`;
    }

    private generateInterface(className: string): string {
        return `export interface ${className}Config {
  publicClient?: PublicClient | any;
  walletClient?: WalletClient | any;
  network?: string;
  forceSDKLoad?: boolean;
}`;
    }

    private generateClass(
        className: string,
        contractAliases: Map<string, string>,
        _contractAddresses: Map<string, string>,
        lazyLoad: boolean
    ): string {
        const privateFields = Array.from(contractAliases.entries())
            .map(([alias, contractClass]) => `  private _${this.toCamelCase(alias)}?: ${contractClass};`)
            .join('\n');

        const constructor = this.generateConstructor(className, contractAliases);

        const getters = Array.from(contractAliases.entries())
            .map(([alias, contractClass]) => this.generateGetter(alias, contractClass, lazyLoad))
            .join('\n\n');

        const helperMethods = this.generateHelperMethods(className, contractAliases);

        return `export class ${className} {
  private publicClient?: PublicClient | any;
  private walletClient?: WalletClient | any;
  private network: string;
  private addresses: any;
  
  // Lazy-loaded instances
${privateFields}
  
${constructor}
  
${getters}
  
${helperMethods}
}`;
    }

    private generateConstructor(className: string, contractAliases: Map<string, string>): string {
        const loadAllContracts = Array.from(contractAliases.keys())
            .map(alias => `    this.${this.toCamelCase(alias)};`)
            .join('\n');

        return `  constructor(config: ${className}Config) {
    this.network = config.network || 'anvil';
    this.publicClient = config.publicClient;
    this.walletClient = config.walletClient;
    this.addresses = getNetworkAddresses(this.network);
    
    if (config.forceSDKLoad) {
      this.loadAllContracts();
    }
  }
  
  private loadAllContracts(): void {
    // Access all getters to force instantiation
${loadAllContracts}
  }`;
    }

    private generateGetter(alias: string, contractClass: string, lazyLoad: boolean): string {
        const camelCaseAlias = this.toCamelCase(alias);
        const privateField = `_${camelCaseAlias}`;

        if (lazyLoad) {
            return `  get ${camelCaseAlias}(): ${contractClass} {
    if (!this.${privateField}) {
      this.${privateField} = new ${contractClass}({
        address: this.addresses['${alias}'] as Address,
        publicClient: this.publicClient,
        walletClient: this.walletClient,
      });
    }
    return this.${privateField};
  }`;
        } else {
            return `  get ${camelCaseAlias}(): ${contractClass} {
    return new ${contractClass}({
      address: this.addresses['${alias}'] as Address,
      publicClient: this.publicClient,
      walletClient: this.walletClient,
    });
  }`;
        }
    }

    private generateHelperMethods(_className: string, contractAliases: Map<string, string>): string {
        const resetInstances = Array.from(contractAliases.keys())
            .map(alias => `    this._${this.toCamelCase(alias)} = undefined;`)
            .join('\n');

        return `  setClients(publicClient?: PublicClient | any, walletClient?: WalletClient | any): void {
    this.publicClient = publicClient;
    this.walletClient = walletClient;
    // Reset instances to pick up new clients
${resetInstances}
  }
  
  getContractAddress(contractName: string): string {
    const address = this.addresses[contractName];
    if (!address) {
      throw new Error(\`Contract address not found for: \${contractName}\`);
    }
    return address;
  }
  
  getAvailableContracts(): string[] {
    return Object.keys(this.addresses);
  }`;
    }

    private toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    private writeFile(filePath: string, content: string): void {
        const fs = require('fs');
        const path = require('path');

        const fullPath = path.join(this.outDir, filePath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, content);
    }
}

/**
 * Python SDK generator (web3.py + Pydantic)
 */

import { BaseGenerator, GeneratorContext } from '../base';
import { ContractGraph, ContractModel } from '../../types/model';
import { TargetConfig, PythonTargetOptions } from '../../types/config';
import { ContractGenerator } from './contract-generator';
import { InterfaceGenerator } from './interface-generator';
import { TypesGenerator } from './types-generator';
import { ConfigGenerator } from './config-generator';
import { SignaturesGenerator } from './signatures-generator';
import { SdkGenerator } from './sdk-generator';
import { EventsGenerator } from './events-generator';
import { SelectorsGenerator } from './selectors-generator';
import { ErrorsGenerator } from './errors-generator';
import { PythonUtils } from './utils';

export class PythonGenerator extends BaseGenerator {
    protected options: PythonTargetOptions;
    private contractGenerator: ContractGenerator;
    private interfaceGenerator: InterfaceGenerator;
    private typesGenerator: TypesGenerator;
    private configGenerator: ConfigGenerator;
    private signaturesGenerator: SignaturesGenerator;
    private sdkGenerator: SdkGenerator;
    private eventsGenerator: EventsGenerator;
    private selectorsGenerator: SelectorsGenerator;
    private errorsGenerator: ErrorsGenerator;

    constructor(outDir: string, options: PythonTargetOptions = {}) {
        super(outDir, options);
        this.options = {
            emitAsync: false,
            pydanticVersion: 2,
            strictTypes: true,
            packageName: 'contract_sdk',
            format: 'black',
            lint: 'ruff',
            ...options,
        };

        // Initialize sub-generators
        this.contractGenerator = new ContractGenerator(outDir, this.options);
        this.interfaceGenerator = new InterfaceGenerator(outDir, this.options);
        this.typesGenerator = new TypesGenerator(outDir, this.options);
        this.configGenerator = new ConfigGenerator(outDir, this.options);
        this.signaturesGenerator = new SignaturesGenerator(outDir, this.options);
        this.sdkGenerator = new SdkGenerator(outDir, this.options);
        this.eventsGenerator = new EventsGenerator(outDir, this.options);
        this.selectorsGenerator = new SelectorsGenerator(outDir, this.options);
        this.errorsGenerator = new ErrorsGenerator(outDir, this.options);
    }

    getName(): string {
        return 'Python Generator (web3.py + Pydantic)';
    }

    validateOptions(options: any): void {
        if (options.pydanticVersion && options.pydanticVersion !== 2) {
            throw new Error('Only Pydantic v2 is supported');
        }
    }

    async generate(graph: ContractGraph, _config: TargetConfig, context: GeneratorContext): Promise<void> {
        this.ensureOutDir();
        this.log('Generating Python SDK with web3.py + Pydantic...');

        // Separate contracts from interfaces
        const contracts: ContractModel[] = [];
        const interfaces: ContractModel[] = [];

        for (const [_contractName, contract] of graph.contracts.entries()) {
            if (contract.isInterface) {
                interfaces.push(contract);
            } else {
                contracts.push(contract);
            }
        }

        // Generate contracts
        for (const contract of contracts) {
            await this.contractGenerator.generateContract(contract);

            // Generate events, selectors, and errors for contracts
            await this.eventsGenerator.generateEvents(contract);
            await this.selectorsGenerator.generateSelectors(contract);
            await this.errorsGenerator.generateErrors(contract);
        }

        // Generate interfaces
        for (const interface_ of interfaces) {
            await this.interfaceGenerator.generateInterface(interface_);
        }

        // Generate centralized error registry
        await this.errorsGenerator.generateCentralizedErrors(contracts);

        // Generate centralized types
        await this.typesGenerator.generateTypes(graph);

        // Generate config package
        await this.configGenerator.generateConfig(graph, context);

        // Generate SDK if enabled
        if (this.options.sdk?.enabled) {
            this.log('Generating unified SDK class...');
            await this.sdkGenerator.generateSdk(graph, context, this.configGenerator, this.options.sdk);
        }

        // Generate signatures if enabled
        if (context.signatures?.enabled && context.signatures.items?.length) {
            await this.signaturesGenerator.generateSignatures(context.signatures.items, graph);
        }

        // Generate pyproject.toml
        this.generatePyprojectToml();

        // Generate main __init__.py
        this.generateMainInit(graph);

        this.logSuccess(`Generated Python SDK to ${this.outDir}`);
    }

    /**
     * Generate pyproject.toml
     */
    private generatePyprojectToml(): void {
        const content = `[tool.poetry]
name = "${this.options.packageName || 'contract-sdk'}"
version = "${this.options.packageVersion || '1.0.0'}"
description = "Auto-generated SDK for smart contracts"
authors = []

[tool.poetry.dependencies]
python = "^3.9"
web3 = "^6.0.0"
pydantic = "^2.0.0"

[tool.poetry.dev-dependencies]
pytest = "^7.0.0"
black = "^23.0.0"
ruff = "^0.1.0"
mypy = "^1.0.0"

[build-system]
requires = ["poetry-core"]
build-backend = "poetry.core.masonry.api"
`;
        this.writeFile('pyproject.toml', content);
    }

    /**
     * Generate main __init__.py
     */
    private generateMainInit(graph: ContractGraph): void {
        // Generate package __init__.py files
        this.contractGenerator.generatePackageInit(graph);
        this.interfaceGenerator.generatePackageInit(graph);

        // Generate main __init__.py
        const contractImports = Array.from(graph.contracts.entries())
            .filter(([_name, contract]) => !contract.isInterface)
            .map(([name, _contract]) => {
                const moduleName = PythonUtils.toSnakeCase(name);
                return `from .contracts.${moduleName} import ${name}`;
            })
            .join('\n');

        const interfaceImports = Array.from(graph.contracts.entries())
            .filter(([_name, contract]) => contract.isInterface)
            .map(([name, _contract]) => {
                const moduleName = PythonUtils.toSnakeCase(name);
                return `from .interfaces.${moduleName} import ${name}`;
            })
            .join('\n');

        const content = `"""Contract SDK"""

# Contract classes
${contractImports}

# Interface classes
${interfaceImports}

# Types
from .types import *

# Config utilities
from .config import *
`;

        this.writeFile('__init__.py', content);
    }
}

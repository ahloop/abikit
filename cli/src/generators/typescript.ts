/**
 * TypeScript SDK generator (viem-first)
 */

import { BaseGenerator, GeneratorContext } from './base';
import { ContractGraph } from '../types/model';
import { TargetConfig, TypeScriptTargetOptions } from '../types/config';
import { TypesGenerator } from './typescript/types-generator';
import { ContractGenerator } from './typescript/contract-generator';
import { InterfaceGenerator } from './typescript/interface-generator';
import { ConfigGenerator } from './typescript/config-generator';
import { SignaturesGenerator } from './typescript/signatures-generator';

export class TypeScriptGenerator extends BaseGenerator {
    protected options: TypeScriptTargetOptions;

    constructor(outDir: string, options: TypeScriptTargetOptions = {}) {
        super(outDir, options);
        this.options = {
            transport: 'viem',
            emitHooks: false,
            bigintStyle: 'native',
            emitStructsOnly: true,
            packageName: 'contract-sdk',
            ...options,
        };
    }

    getName(): string {
        return 'TypeScript Generator (viem)';
    }

    validateOptions(options: any): void {
        if (options.transport && !['viem', 'ethers'].includes(options.transport)) {
            throw new Error('transport must be "viem" or "ethers"');
        }
        if (options.bigintStyle && !['native', 'bn.js'].includes(options.bigintStyle)) {
            throw new Error('bigintStyle must be "native" or "bn.js"');
        }
    }

    async generate(graph: ContractGraph, _config: TargetConfig, context: GeneratorContext): Promise<void> {
        this.ensureOutDir();
        this.log(`Generating TypeScript SDK with ${this.options.transport}...`);

        // Initialize generators
        const typesGenerator = new TypesGenerator(this.outDir, this.options);
        const contractGenerator = new ContractGenerator(this.outDir, this.options);
        const interfaceGenerator = new InterfaceGenerator(this.outDir, this.options);
        const configGenerator = new ConfigGenerator(this.outDir, this.options);
        const signaturesGenerator = new SignaturesGenerator(this.outDir, this.options);

        // Generate shared types FIRST to avoid duplicates
        await typesGenerator.generateSharedTypesFile(Array.from(graph.contracts.values()));

        // Generate contracts and interfaces
        for (const [_contractName, contract] of graph.contracts.entries()) {
            if (contract.isInterface) {
                await interfaceGenerator.generateInterface(contract);
            } else {
                await contractGenerator.generateContract(contract);
            }
        }

        // Generate config files
        await configGenerator.generateConfig(graph, context);

        // Generate signatures if enabled
        if (context.signatures?.enabled && context.signatures.items?.length) {
            this.log('Generating EIP-712 signature utilities...');
            await signaturesGenerator.generateSignatures(context.signatures.items, graph);
        }

        // Generate package.json with exports
        this.generatePackageJson(graph);

        // Generate root index
        this.generateIndex(graph);

        // Generate comprehensive index
        this.generateComprehensiveIndex(graph);

        // Generate hooks if enabled
        if (this.options.emitHooks) {
            this.generateHooks(graph);
        }

        this.logSuccess(`Generated TypeScript SDK to ${this.outDir}`);
    }

    /**
     * Generate package.json with subpath exports
     */
    private generatePackageJson(graph?: ContractGraph): void {
        const exports: Record<string, string> = {
            '.': './dist/index.js',
            './types': './dist/types/index.js',
            './all': './dist/all.js',
        };

        // Add per-contract exports
        if (graph) {
            for (const [contractName, contract] of graph.contracts.entries()) {
                const folderPrefix = contract.isInterface ? 'interfaces' : 'contracts';
                exports[`./${contractName}`] = `./dist/${folderPrefix}/${contractName}/index.js`;
            }
        }

        const packageJson = {
            name: this.options.packageName || 'contract-sdk',
            version: this.options.packageVersion || '1.0.0',
            main: 'dist/index.js',
            types: 'dist/index.d.ts',
            exports,
            scripts: {
                build: 'tsc',
                test: 'vitest',
            },
            dependencies: {
                viem: '^2.21.0',
            },
            devDependencies: {
                typescript: '^5.0.0',
                vitest: '^1.0.0',
            },
        };

        this.writeFile('package.json', JSON.stringify(packageJson, null, 2));
    }

    /**
     * Generate root barrel index
     */
    private generateIndex(graph: ContractGraph): void {
        const contracts = Array.from(graph.contracts.values());

        const contractExports = contracts
            .filter(c => !c.isInterface)
            .map(c => `export * from './contracts/${c.name}';`)
            .join('\n');

        const interfaceExports = contracts
            .filter(c => c.isInterface)
            .map(c => `export * from './interfaces/${c.name}';`)
            .join('\n');

        // Export types
        const typeExports = `export * from './types';`;

        const exports = [contractExports, interfaceExports, typeExports].filter(Boolean).join('\n\n');

        this.writeFile('src/index.ts', `// Auto-generated root barrel\n// Consumers should import from specific contracts: '@yourpackage/contracts/<ContractName>'\n\n${exports}\n`);
    }

    /**
     * Generate comprehensive index with all exports
     */
    private generateComprehensiveIndex(graph: ContractGraph): void {
        const contracts = Array.from(graph.contracts.values());

        // All contract classes
        const contractClasses = contracts
            .filter(c => !c.isInterface)
            .map(c => c.name);

        // All interface classes  
        const interfaceClasses = contracts
            .filter(c => c.isInterface)
            .map(c => c.name);

        // All contract configs
        const contractConfigs = contracts
            .filter(c => !c.isInterface)
            .map(c => `${c.name}Config`);

        // All interface configs
        const interfaceConfigs = contracts
            .filter(c => c.isInterface)
            .map(c => `${c.name}Config`);

        // All ABIs
        const abis = contracts
            .map(c => `${c.name.toUpperCase()}_ABI`);

        const content = `// Comprehensive index - exports everything
// Generated by contract-sdk-gen

// ===== CONTRACT CLASSES =====
${contractClasses.map(name => `export { ${name} } from './contracts/${name}';`).join('\n')}

// ===== INTERFACE CLASSES =====
${interfaceClasses.map(name => `export { ${name} } from './interfaces/${name}';`).join('\n')}

// ===== CONTRACT CONFIGS =====
${contractConfigs.map(name => `export type { ${name} } from './contracts/${name.replace('Config', '')}';`).join('\n')}

// ===== INTERFACE CONFIGS =====
${interfaceConfigs.map(name => `export type { ${name} } from './interfaces/${name.replace('Config', '')}';`).join('\n')}

// ===== ABIs =====
${abis.map(abi => {
            const contractName = abi.replace('_ABI', '');
            const contract = contracts.find(c => c.name.toUpperCase() === contractName);
            if (!contract) return '';
            const folder = contract.isInterface ? 'interfaces' : 'contracts';
            return `export { ${abi} } from './${folder}/${contract.name}';`;
        }).filter(Boolean).join('\n')}

// ===== SHARED TYPES =====
export * from './types';

// ===== UTILITIES =====
// TODO: Add utility exports when implemented

// ===== CONVENIENCE EXPORTS =====
// Import all contracts for convenience objects
${contractClasses.map(name => `import { ${name} } from './contracts/${name}';`).join('\n')}
${interfaceClasses.map(name => `import { ${name} } from './interfaces/${name}';`).join('\n')}
${abis.map(abi => {
            const contractName = abi.replace('_ABI', '');
            const contract = contracts.find(c => c.name.toUpperCase() === contractName);
            if (!contract) return '';
            const folder = contract.isInterface ? 'interfaces' : 'contracts';
            return `import { ${abi} } from './${folder}/${contract.name}';`;
        }).filter(Boolean).join('\n')}

// All contracts as a single object
export const CONTRACTS = {
${contractClasses.map(name => `  ${name},`).join('\n')}
} as const;

// All interfaces as a single object  
export const INTERFACES = {
${interfaceClasses.map(name => `  ${name},`).join('\n')}
} as const;

// All ABIs as a single object
export const ABIS = {
${abis.map(abi => `  ${abi},`).join('\n')}
} as const;

// Type helpers
export type ContractName = keyof typeof CONTRACTS;
export type InterfaceName = keyof typeof INTERFACES;
export type ContractClass = typeof CONTRACTS[ContractName];
export type InterfaceClass = typeof INTERFACES[InterfaceName];
`;

        this.writeFile('src/all.ts', content);
    }

    /**
     * Generate wagmi hooks
     */
    private generateHooks(_graph: ContractGraph): void {
        if (!this.options.emitHooks) return;
        this.log('Generating wagmi hooks...');
        // TODO: Implement hooks generation
    }
}
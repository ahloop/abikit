/**
 * Configuration loader and validator
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import { ContractsConfig } from '../types/config';

const schemaPath = path.join(__dirname, '../../schema/contracts-config.schema.json');

export class ConfigLoader {
    private ajv: Ajv;
    private schema: any;

    constructor() {
        this.ajv = new Ajv({ allErrors: true });
        this.schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
        this.ajv.addSchema(this.schema);
    }

    /**
     * Load and validate contracts.yaml configuration
     */
    loadConfig(configPath: string): ContractsConfig {
        if (!fs.existsSync(configPath)) {
            throw new Error(`Configuration file not found: ${configPath}`);
        }

        try {
            const fileContents = fs.readFileSync(configPath, 'utf8');
            const config = yaml.load(fileContents) as ContractsConfig;

            this.validateConfig(config);
            this.normalizeConfig(config);

            return config;
        } catch (error) {
            if (error instanceof yaml.YAMLException) {
                throw new Error(`Invalid YAML in ${configPath}: ${error.message}`);
            }
            throw error;
        }
    }

    /**
     * Validate configuration against JSON Schema
     */
    validateConfig(config: ContractsConfig): void {
        const validate = this.ajv.compile(this.schema);
        const valid = validate(config);

        if (!valid) {
            const errors = validate.errors
                ?.map(err => `  - ${err.instancePath || '/'}: ${err.message}`)
                .join('\n');
            throw new Error(`Configuration validation failed:\n${errors}`);
        }
    }

    /**
     * Normalize configuration with defaults
     */
    private normalizeConfig(config: ContractsConfig): void {
        // Support artifactSources as alias for artifactPaths (prefer artifactSources if present)
        if ((config.generation as any).artifactSources && !config.generation.artifactPaths) {
            config.generation.artifactPaths = (config.generation as any).artifactSources;
        }

        // Also move artifactSources to root level for CLI compatibility
        if ((config.generation as any).artifactSources && !config.artifactSources) {
            config.artifactSources = (config.generation as any).artifactSources;
        }

        // Set defaults for artifact paths
        if (!config.generation.artifactPaths) {
            config.generation.artifactPaths = {};
        }
        if (!config.generation.artifactPaths.foundryOut) {
            config.generation.artifactPaths.foundryOut = './out';
        }

        // Set defaults for types
        if (!config.generation.types) {
            config.generation.types = {};
        }
        if (config.generation.types.structsOnly === undefined) {
            config.generation.types.structsOnly = true;
        }

        // Set defaults for ignoreFunctions
        if (!config.generation.ignoreFunctions) {
            config.generation.ignoreFunctions = { global: [], contracts: {} };
        }
        if (!config.generation.ignoreFunctions.global) {
            config.generation.ignoreFunctions.global = [];
        }
        if (!config.generation.ignoreFunctions.contracts) {
            config.generation.ignoreFunctions.contracts = {};
        }

        // Set defaults for interface relationships
        if (!config.generation.interfaceRelationships) {
            config.generation.interfaceRelationships = {};
        }

        // Set defaults for signatures
        if (!config.signatures) {
            config.signatures = { enabled: false, items: [] };
        }
        if (config.signatures.enabled === undefined) {
            config.signatures.enabled = false;
        }
        if (!config.signatures.items) {
            config.signatures.items = [];
        }
    }

    /**
     * Get all contract names from configuration
     */
    getAllContractNames(config: ContractsConfig): string[] {
        const names: string[] = [];

        // Contracts field (array or object format)
        if (config.contracts) {
            if (Array.isArray(config.contracts)) {
                // Simple array format
                names.push(...config.contracts);
            } else {
                // Object format with metadata
                names.push(...Object.keys(config.contracts));
            }
        }

        // Always include interfaces
        if (config.interfaces) {
            names.push(...config.interfaces);
        }

        return [...new Set(names)]; // Deduplicate
    }

    /**
     * Check if a contract is an interface (by name convention or explicit type)
     */
    isInterface(contractName: string, config: ContractsConfig): boolean {
        // Check explicit interfaces array
        if (config.interfaces?.includes(contractName)) {
            return true;
        }

        // Check contracts object metadata
        if (config.contracts && typeof config.contracts === 'object' && !Array.isArray(config.contracts)) {
            const contractDef = config.contracts[contractName];
            if (contractDef?.type === 'interface') {
                return true;
            }
        }

        // Auto-detect by I-prefix naming convention
        return contractName.startsWith('I') && contractName.length > 1 && contractName[1] === contractName[1].toUpperCase();
    }

    /**
     * Get interfaces that a contract implements
     */
    getContractInterfaces(contractName: string, config: ContractsConfig): string[] {
        // Check inline definition first (preferred)
        if (config.contracts && typeof config.contracts === 'object' && !Array.isArray(config.contracts)) {
            const def = config.contracts[contractName];
            if (def?.implements) {
                return def.implements;
            }
        }

        // Fallback to generation.interfaceRelationships (for compatibility)
        return config.generation.interfaceRelationships?.[contractName] || [];
    }
}


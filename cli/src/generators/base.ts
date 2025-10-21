/**
 * Base generator interface and abstract classes
 */

import { ContractGraph } from '../types/model';
import { TargetConfig, ContractsConfig, NetworkConfig, SignaturesConfig, ArtifactSources } from '../types/config';

/**
 * Context object passed to generators containing shared configuration
 * and resources that generators may need beyond their target-specific config
 */
export interface GeneratorContext {
    /** Network configurations for chain IDs, RPC URLs, etc. */
    networks?: Record<string, NetworkConfig>;
    /** EIP-712 signature configurations */
    signatures?: SignaturesConfig;
    /** Artifact source configurations */
    artifactSources?: ArtifactSources;
    /** Full contracts configuration (for advanced use cases) */
    fullConfig?: ContractsConfig;
}

export interface Generator {
    /**
     * Generate SDK for the target language
     */
    generate(graph: ContractGraph, config: TargetConfig, context: GeneratorContext): Promise<void>;

    /**
     * Get generator name
     */
    getName(): string;

    /**
     * Validate generator-specific options
     */
    validateOptions(options: any): void;
}

export abstract class BaseGenerator implements Generator {
    protected outDir: string;
    protected options: any;

    constructor(outDir: string, options: any = {}) {
        this.outDir = outDir;
        this.options = options;
    }

    abstract generate(graph: ContractGraph, config: TargetConfig, context: GeneratorContext): Promise<void>;
    abstract getName(): string;
    abstract validateOptions(options: any): void;

    /**
     * Ensure output directory exists
     */
    protected ensureOutDir(): void {
        const fs = require('fs');
        if (!fs.existsSync(this.outDir)) {
            fs.mkdirSync(this.outDir, { recursive: true });
        }
    }

    /**
     * Write file to output directory
     */
    protected writeFile(relativePath: string, content: string): void {
        const fs = require('fs');
        const path = require('path');
        const fullPath = path.join(this.outDir, relativePath);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(fullPath, content, 'utf8');
    }

    /**
     * Log generation progress
     */
    protected log(message: string): void {
        const chalk = require('chalk');
        console.log(chalk.dim(`  ${message}`));
    }

    /**
     * Log success
     */
    protected logSuccess(message: string): void {
        const chalk = require('chalk');
        console.log(chalk.green(`  ✓ ${message}`));
    }

    /**
     * Log error
     */
    protected logError(message: string): void {
        const chalk = require('chalk');
        console.error(chalk.red(`  ✗ ${message}`));
    }

    /**
     * Create generator context from full config
     */
    protected createContext(fullConfig?: ContractsConfig): GeneratorContext {
        return {
            networks: fullConfig?.networks,
            signatures: fullConfig?.signatures,
            artifactSources: fullConfig?.artifactSources,
            fullConfig,
        };
    }
}


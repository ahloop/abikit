/**
 * Artifact loader for Foundry and Hardhat
 * Supports dynamic artifact resolution with per-contract overrides
 */

import * as fs from 'fs';
import * as path from 'path';
import type { ContractsConfig, ContractDefinition } from '../types/config';
import { ArtifactCacheManager } from './cache-manager';

export interface ContractArtifact {
    contractName: string;
    abi: any[];
    bytecode?: string;
    deployedBytecode?: string;
    metadata?: any;
}

export class ArtifactLoader {
    private foundryOutDir: string;
    private hardhatOutDir?: string;
    private config?: ContractsConfig;
    private resolvedPaths: Map<string, string> = new Map();
    private cacheManager?: ArtifactCacheManager;

    constructor(foundryOutDir: string, hardhatOutDir?: string, config?: ContractsConfig, configDir?: string) {
        const baseDir = configDir || process.cwd();
        this.foundryOutDir = path.isAbsolute(foundryOutDir) ? foundryOutDir : path.resolve(baseDir, foundryOutDir);
        this.hardhatOutDir = hardhatOutDir
            ? (path.isAbsolute(hardhatOutDir) ? hardhatOutDir : path.resolve(baseDir, hardhatOutDir))
            : undefined;
        this.config = config;

        // Initialize cache manager if caching is enabled
        if (config?.artifactSources?.cache?.mode === 'copy') {
            const cacheDir = config.artifactSources.cache.dir || 'artifacts';
            this.cacheManager = new ArtifactCacheManager(
                config,
                cacheDir,
                configDir || baseDir
            );
        }
    }

    /**
     * Copy artifacts to cache directory if caching is enabled
     */
    async copyArtifactsToCache(contractNames: string[], force: boolean = false): Promise<void> {
        if (!this.cacheManager) return;

        const sourceDir = this.foundryOutDir;
        await this.cacheManager.copyArtifacts(sourceDir, contractNames, force);
    }

    /**
     * Get cache manager instance
     */
    getCacheManager(): ArtifactCacheManager | undefined {
        return this.cacheManager;
    }

    /**
     * Resolve artifact path for a contract using defaults + overrides
     */
    resolveArtifactPath(contractName: string): string | null {
        // Get per-contract override if exists
        const contractDef = this.getContractDefinition(contractName);
        const artifactOverride = contractDef?.artifact;
        const defaults = this.config?.artifactSources?.defaults;

        // Determine project type and outDir
        let outDir: string;
        let project: 'foundry' | 'hardhat';

        if (artifactOverride) {
            // Use override
            project = artifactOverride.project || 'foundry';
            outDir = artifactOverride.outDir || (project === 'foundry' ? this.foundryOutDir : this.hardhatOutDir || './artifacts');

            // If custom file specified, use it directly
            if (artifactOverride.file) {
                const fullPath = path.join(outDir, artifactOverride.file);
                return fs.existsSync(fullPath) ? fullPath : null;
            }
        } else {
            // Use defaults from artifactSources or constructor params
            outDir = defaults?.foundryOut || this.foundryOutDir;
            project = 'foundry'; // Default to foundry
        }

        // Try foundry convention
        if (project === 'foundry') {
            // If foundryOut doesn't exist, fall back to cache directory if available
            if (!fs.existsSync(outDir) && this.cacheManager) {
                const cacheDir = this.cacheManager.getCacheDir();
                const cachePath = path.join(cacheDir, `${contractName}.json`);
                if (fs.existsSync(cachePath)) {
                    return cachePath;
                }
            }

            const foundryPath = path.join(outDir, `${contractName}.sol`, `${contractName}.json`);
            if (fs.existsSync(foundryPath)) {
                return foundryPath;
            }
        }

        // Try hardhat conventions
        if (project === 'hardhat' || !fs.existsSync(path.join(outDir, `${contractName}.sol`))) {
            const hardhatDir = this.hardhatOutDir || defaults?.hardhatOut || outDir;
            const paths = [
                path.join(hardhatDir, 'contracts', `${contractName}.sol`, `${contractName}.json`),
                path.join(hardhatDir, `${contractName}.json`),
            ];

            for (const p of paths) {
                if (fs.existsSync(p)) {
                    return p;
                }
            }
        }

        // Fallback to cached artifacts if available
        if (this.cacheManager?.isArtifactCached(contractName)) {
            const cachedPath = this.cacheManager.getCachedArtifactPath(contractName);
            if (cachedPath) {
                return cachedPath;
            }
        }

        return null;
    }

    /**
     * Load contract artifact by name
     */
    loadArtifact(contractName: string): ContractArtifact {
        // Check cache first if available
        if (this.cacheManager?.isArtifactCached(contractName)) {
            const cachedPath = this.cacheManager.getCachedArtifactPath(contractName);
            if (cachedPath) {
                this.resolvedPaths.set(contractName, cachedPath);
                try {
                    const artifact = JSON.parse(fs.readFileSync(cachedPath, 'utf8'));
                    return {
                        contractName,
                        abi: artifact.abi || [],
                        bytecode: artifact.bytecode?.object || artifact.bytecode,
                        deployedBytecode: artifact.deployedBytecode?.object || artifact.deployedBytecode,
                        metadata: artifact.metadata,
                    };
                } catch (error) {
                    console.warn(`Failed to load cached artifact from ${cachedPath}:`, error);
                }
            }
        }

        // If cache map is stale (absolute paths changed), fall back to cache dir lookup
        if (this.cacheManager) {
            const cacheDir = this.cacheManager.getCacheDir();
            const cachePath = path.join(cacheDir, `${contractName}.json`);
            if (fs.existsSync(cachePath)) {
                this.resolvedPaths.set(contractName, cachePath);
                try {
                    const artifact = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
                    return {
                        contractName,
                        abi: artifact.abi || [],
                        bytecode: artifact.bytecode?.object || artifact.bytecode,
                        deployedBytecode: artifact.deployedBytecode?.object || artifact.deployedBytecode,
                        metadata: artifact.metadata,
                    };
                } catch (error) {
                    console.warn(`Failed to load cached artifact from ${cachePath}:`, error);
                }
            }
        }

        // Resolve path using config-based resolution
        const resolvedPath = this.resolveArtifactPath(contractName);

        if (resolvedPath) {
            this.resolvedPaths.set(contractName, resolvedPath);

            try {
                const artifact = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
                return {
                    contractName,
                    abi: artifact.abi || [],
                    bytecode: artifact.bytecode?.object || artifact.bytecode,
                    deployedBytecode: artifact.deployedBytecode?.object || artifact.deployedBytecode,
                    metadata: artifact.metadata,
                };
            } catch (error) {
                console.warn(`Failed to load artifact from ${resolvedPath}:`, error);
            }
        }

        // Fallback to legacy method
        const foundryArtifact = this.tryLoadFromFoundry(contractName);
        if (foundryArtifact) {
            return foundryArtifact;
        }

        if (this.hardhatOutDir) {
            const hardhatArtifact = this.tryLoadFromHardhat(contractName);
            if (hardhatArtifact) {
                return hardhatArtifact;
            }
        }

        throw new Error(`Artifact not found for contract: ${contractName}`);
    }

    /**
     * Get contract definition from config
     */
    private getContractDefinition(contractName: string): ContractDefinition | undefined {
        if (!this.config?.contracts || typeof this.config.contracts !== 'object' || Array.isArray(this.config.contracts)) {
            return undefined;
        }
        return this.config.contracts[contractName];
    }

    /**
     * Try to load artifact from Foundry out directory
     */
    private tryLoadFromFoundry(contractName: string): ContractArtifact | null {
        if (!fs.existsSync(this.foundryOutDir)) {
            return null;
        }

        const artifactDir = path.join(this.foundryOutDir, `${contractName}.sol`);
        const artifactPath = path.join(artifactDir, `${contractName}.json`);

        if (!fs.existsSync(artifactPath)) {
            return null;
        }

        try {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

            return {
                contractName,
                abi: artifact.abi || [],
                bytecode: artifact.bytecode?.object,
                deployedBytecode: artifact.deployedBytecode?.object,
                metadata: artifact.metadata,
            };
        } catch (error) {
            console.warn(`Failed to load Foundry artifact for ${contractName}:`, error);
            return null;
        }
    }

    /**
     * Try to load artifact from Hardhat artifacts directory
     */
    private tryLoadFromHardhat(contractName: string): ContractArtifact | null {
        if (!this.hardhatOutDir) {
            return null;
        }

        // Hardhat structure: artifacts/contracts/Contract.sol/Contract.json
        const possiblePaths = [
            path.join(this.hardhatOutDir, 'contracts', `${contractName}.sol`, `${contractName}.json`),
            path.join(this.hardhatOutDir, `${contractName}.json`),
        ];

        for (const artifactPath of possiblePaths) {
            if (fs.existsSync(artifactPath)) {
                try {
                    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

                    return {
                        contractName,
                        abi: artifact.abi || [],
                        bytecode: artifact.bytecode,
                        deployedBytecode: artifact.deployedBytecode,
                        metadata: artifact.metadata,
                    };
                } catch (error) {
                    console.warn(`Failed to load Hardhat artifact from ${artifactPath}:`, error);
                }
            }
        }

        return null;
    }

    /**
     * Check if artifact exists
     */
    artifactExists(contractName: string): boolean {
        try {
            this.loadArtifact(contractName);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get all resolved artifact paths
     */
    getResolvedPaths(): Map<string, string> {
        return new Map(this.resolvedPaths);
    }

    /**
     * List resolved artifacts for all contracts in config
     */
    listResolvedArtifacts(contractNames: string[]): Record<string, string> {
        const resolved: Record<string, string> = {};

        for (const contractName of contractNames) {
            const resolvedPath = this.resolveArtifactPath(contractName);
            if (resolvedPath) {
                resolved[contractName] = resolvedPath;
            }
        }

        return resolved;
    }

    /**
     * List all available contracts in artifact directories
     */
    listAvailableContracts(): string[] {
        const contracts: string[] = [];

        // List from Foundry
        if (fs.existsSync(this.foundryOutDir)) {
            const entries = fs.readdirSync(this.foundryOutDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isDirectory() && entry.name.endsWith('.sol')) {
                    const contractName = entry.name.replace('.sol', '');
                    const jsonPath = path.join(this.foundryOutDir, entry.name, `${contractName}.json`);
                    if (fs.existsSync(jsonPath)) {
                        contracts.push(contractName);
                    }
                }
            }
        }

        // List from Hardhat (if configured)
        if (this.hardhatOutDir && fs.existsSync(this.hardhatOutDir)) {
            const contractsDir = path.join(this.hardhatOutDir, 'contracts');
            if (fs.existsSync(contractsDir)) {
                const entries = fs.readdirSync(contractsDir);
                for (const entry of entries) {
                    if (entry.endsWith('.sol')) {
                        const contractName = entry.replace('.sol', '');
                        const jsonPath = path.join(contractsDir, entry, `${contractName}.json`);
                        if (fs.existsSync(jsonPath)) {
                            contracts.push(contractName);
                        }
                    }
                }
            }
        }

        return [...new Set(contracts)]; // Deduplicate
    }
}


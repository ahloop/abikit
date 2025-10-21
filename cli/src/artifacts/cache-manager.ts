/**
 * Artifact Cache Manager
 * Handles copying and caching of contract artifacts for local use
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import type { ContractsConfig } from '../types/config';

export interface ArtifactCacheData {
    artifactsHash?: string;
    lastCacheTime?: number;
    cachedArtifacts?: Record<string, string>; // contractName -> cachedPath
}

export class ArtifactCacheManager {
    private cacheFile: string;
    private cacheDir: string;
    private config: ContractsConfig;
    private cache: ArtifactCacheData;

    constructor(config: ContractsConfig, cacheDir: string = 'artifacts') {
        this.config = config;
        this.cacheDir = path.resolve(cacheDir);
        this.cacheFile = path.join(this.cacheDir, '.artifact-cache.json');
        this.cache = this.loadCache();
    }

    /**
     * Check if artifacts need to be copied based on configuration
     */
    shouldCopyArtifacts(): boolean {
        const cacheConfig = this.config.artifactSources?.cache;
        return cacheConfig?.copyOnBuild === true;
    }

    /**
     * Get the cache directory path
     */
    getCacheDir(): string {
        return this.cacheDir;
    }

    /**
     * Ensure cache directory exists
     */
    ensureCacheDir(): void {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
    }

    /**
     * Copy artifacts from source to cache directory
     */
    async copyArtifacts(sourceDir: string, contractNames: string[]): Promise<void> {
        if (!this.shouldCopyArtifacts()) {
            return;
        }

        this.ensureCacheDir();

        const sourceHash = this.getDirectoryHash(sourceDir);
        const cacheConfig = this.config.artifactSources?.cache;

        // Check if we need to update cache
        if (this.cache.artifactsHash === sourceHash && !cacheConfig?.copyOnBuild) {
            return; // Cache is up to date
        }

        console.log(`📦 Copying artifacts to ${this.cacheDir}...`);

        for (const contractName of contractNames) {
            const sourcePath = this.findArtifactPath(sourceDir, contractName);
            if (sourcePath && fs.existsSync(sourcePath)) {
                const cachedPath = path.join(this.cacheDir, `${contractName}.json`);

                try {
                    fs.copyFileSync(sourcePath, cachedPath);
                    this.cache.cachedArtifacts = this.cache.cachedArtifacts || {};
                    this.cache.cachedArtifacts[contractName] = cachedPath;
                    console.log(`  ✓ Copied ${contractName}.json`);
                } catch (error) {
                    console.warn(`  ⚠️  Failed to copy ${contractName}: ${error}`);
                }
            }
        }

        // Update cache metadata
        this.cache.artifactsHash = sourceHash || undefined;
        this.cache.lastCacheTime = Date.now();
        this.saveCache();

        console.log(`✅ Artifacts cached successfully`);
    }

    /**
     * Get cached artifact path for a contract
     */
    getCachedArtifactPath(contractName: string): string | null {
        const cachedPath = this.cache.cachedArtifacts?.[contractName];
        if (cachedPath && fs.existsSync(cachedPath)) {
            return cachedPath;
        }
        return null;
    }

    /**
     * Check if artifact is cached and up to date
     */
    isArtifactCached(contractName: string): boolean {
        const cachedPath = this.getCachedArtifactPath(contractName);
        return cachedPath !== null;
    }

    /**
     * Clear all cached artifacts
     */
    clearCache(): void {
        if (fs.existsSync(this.cacheDir)) {
            const files = fs.readdirSync(this.cacheDir);
            for (const file of files) {
                if (file !== '.artifact-cache.json') {
                    fs.unlinkSync(path.join(this.cacheDir, file));
                }
            }
        }
        this.cache = {};
        this.saveCache();
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { cachedCount: number; cacheDir: string; lastCacheTime?: number } {
        const cachedCount = Object.keys(this.cache.cachedArtifacts || {}).length;
        return {
            cachedCount,
            cacheDir: this.cacheDir,
            lastCacheTime: this.cache.lastCacheTime
        };
    }

    private findArtifactPath(sourceDir: string, contractName: string): string | null {
        // Try different possible artifact locations
        const possiblePaths = [
            path.join(sourceDir, `${contractName}.sol`, `${contractName}.json`),
            path.join(sourceDir, `${contractName}.json`),
            path.join(sourceDir, 'contracts', `${contractName}.sol`, `${contractName}.json`),
            path.join(sourceDir, 'artifacts', `${contractName}.sol`, `${contractName}.json`)
        ];

        for (const possiblePath of possiblePaths) {
            if (fs.existsSync(possiblePath)) {
                return possiblePath;
            }
        }

        return null;
    }

    private getDirectoryHash(dirPath: string): string | null {
        if (!fs.existsSync(dirPath)) return null;

        try {
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            const hashes: string[] = [];

            for (const file of files) {
                const filePath = path.join(dirPath, file.name);

                if (file.isDirectory()) {
                    const subHash = this.getDirectoryHash(filePath);
                    if (subHash) hashes.push(subHash);
                } else if (file.name.endsWith('.json')) {
                    const fileHash = this.getFileHash(filePath);
                    if (fileHash) hashes.push(fileHash);
                }
            }

            if (hashes.length === 0) return null;

            hashes.sort();
            const combined = hashes.join('');
            return crypto.createHash('sha256').update(combined).digest('hex');
        } catch (error) {
            return null;
        }
    }

    private getFileHash(filePath: string): string | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (error) {
            return null;
        }
    }

    private loadCache(): ArtifactCacheData {
        if (!fs.existsSync(this.cacheFile)) {
            return {};
        }

        try {
            const content = fs.readFileSync(this.cacheFile, 'utf8');
            return JSON.parse(content);
        } catch (error) {
            return {};
        }
    }

    private saveCache(): void {
        try {
            const content = JSON.stringify(this.cache, null, 2);
            fs.writeFileSync(this.cacheFile, content);
        } catch (error) {
            console.warn(`Failed to save artifact cache: ${error}`);
        }
    }
}

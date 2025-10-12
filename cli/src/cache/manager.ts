import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CacheData {
    configHash?: string;
    artifactsHash?: string;
    targetsHash?: string;
    lastBuildTime?: number;
    generatedFiles?: Record<string, string>; // targetDir -> hash
}

export class CacheManager {
    private cacheFile: string;
    private cache: CacheData;

    constructor(cacheFile: string = '.abikit-cache.json') {
        this.cacheFile = path.resolve(cacheFile);
        this.cache = this.loadCache();
    }

    /**
     * Calculate SHA-256 hash of a file
     */
    getFileHash(filePath: string): string | null {
        if (!fs.existsSync(filePath)) return null;
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            return crypto.createHash('sha256').update(content).digest('hex');
        } catch (e) {
            return null;
        }
    }

    /**
     * Calculate SHA-256 hash of a directory (recursively)
     */
    getDirectoryHash(dirPath: string, extensions: string[] = ['.json']): string | null {
        if (!fs.existsSync(dirPath)) return null;

        try {
            const files = fs.readdirSync(dirPath, { withFileTypes: true });
            const hashes: string[] = [];

            for (const file of files) {
                const filePath = path.join(dirPath, file.name);

                // Skip hidden files and node_modules
                if (file.name.startsWith('.') || file.name === 'node_modules') {
                    continue;
                }

                if (file.isDirectory()) {
                    const dirHash = this.getDirectoryHash(filePath, extensions);
                    if (dirHash) hashes.push(dirHash);
                } else {
                    // Check if file matches any extension
                    const matchesExtension = extensions.length === 0 ||
                        extensions.some(ext => file.name.endsWith(ext));

                    if (matchesExtension) {
                        const fileHash = this.getFileHash(filePath);
                        if (fileHash) hashes.push(fileHash);
                    }
                }
            }

            if (hashes.length === 0) return null;
            return crypto.createHash('sha256').update(hashes.sort().join('')).digest('hex');
        } catch (e) {
            return null;
        }
    }

    /**
     * Load cache from disk
     */
    private loadCache(): CacheData {
        if (!fs.existsSync(this.cacheFile)) {
            return {};
        }

        try {
            const content = fs.readFileSync(this.cacheFile, 'utf8');
            return JSON.parse(content);
        } catch (e) {
            return {};
        }
    }

    /**
     * Save cache to disk
     */
    saveCache(): void {
        try {
            fs.writeFileSync(this.cacheFile, JSON.stringify(this.cache, null, 2));
        } catch (e) {
            // Silently fail - caching is optional
        }
    }

    /**
     * Get current cache data
     */
    getCache(): CacheData {
        return { ...this.cache };
    }

    /**
     * Update cache data
     */
    updateCache(updates: Partial<CacheData>): void {
        this.cache = { ...this.cache, ...updates };
    }

    /**
     * Clear all cache data
     */
    clearCache(): void {
        this.cache = {};
        if (fs.existsSync(this.cacheFile)) {
            fs.unlinkSync(this.cacheFile);
        }
    }

    /**
     * Check if generation is needed based on cache
     */
    needsRegeneration(params: {
        configPath: string;
        artifactPaths: string[];
        targetDirs: string[];
    }): { needed: boolean; reason?: string } {
        // Hash config file
        const configHash = this.getFileHash(params.configPath);
        if (!configHash) {
            return { needed: true, reason: 'Config file not found or unreadable' };
        }

        if (this.cache.configHash !== configHash) {
            return { needed: true, reason: 'Config file changed' };
        }

        // Hash artifact sources
        const artifactHashes: string[] = [];
        for (const artifactPath of params.artifactPaths) {
            if (fs.existsSync(artifactPath)) {
                if (fs.statSync(artifactPath).isDirectory()) {
                    const dirHash = this.getDirectoryHash(artifactPath);
                    if (dirHash) artifactHashes.push(dirHash);
                } else {
                    const fileHash = this.getFileHash(artifactPath);
                    if (fileHash) artifactHashes.push(fileHash);
                }
            }
        }

        const artifactsHash = crypto.createHash('sha256')
            .update(artifactHashes.sort().join(''))
            .digest('hex');

        if (this.cache.artifactsHash !== artifactsHash) {
            return { needed: true, reason: 'Artifact files changed' };
        }

        // Check if target directories exist
        for (const targetDir of params.targetDirs) {
            if (!fs.existsSync(targetDir)) {
                return { needed: true, reason: `Target directory missing: ${targetDir}` };
            }
        }

        // Check targets hash (to detect target config changes)
        const targetsHash = crypto.createHash('sha256')
            .update(JSON.stringify(params.targetDirs.sort()))
            .digest('hex');

        if (this.cache.targetsHash !== targetsHash) {
            return { needed: true, reason: 'Target configuration changed' };
        }

        return { needed: false };
    }

    /**
     * Record successful build
     */
    recordBuild(params: {
        configPath: string;
        artifactPaths: string[];
        targetDirs: string[];
    }): void {
        const configHash = this.getFileHash(params.configPath);

        const artifactHashes: string[] = [];
        for (const artifactPath of params.artifactPaths) {
            if (fs.existsSync(artifactPath)) {
                if (fs.statSync(artifactPath).isDirectory()) {
                    const dirHash = this.getDirectoryHash(artifactPath);
                    if (dirHash) artifactHashes.push(dirHash);
                } else {
                    const fileHash = this.getFileHash(artifactPath);
                    if (fileHash) artifactHashes.push(fileHash);
                }
            }
        }

        const artifactsHash = crypto.createHash('sha256')
            .update(artifactHashes.sort().join(''))
            .digest('hex');

        const targetsHash = crypto.createHash('sha256')
            .update(JSON.stringify(params.targetDirs.sort()))
            .digest('hex');

        this.updateCache({
            configHash: configHash || undefined,
            artifactsHash,
            targetsHash,
            lastBuildTime: Date.now(),
        });

        this.saveCache();
    }
}


/**
 * TypeScript types for contracts.yaml configuration
 */

export type Language = 'ts' | 'python';

export interface TargetConfig {
    language: Language;
    outDir: string;
    options?: TargetOptions;
}

export interface CommonTargetOptions {
    packageName?: string;
    packageVersion?: string;
    emitFactories?: boolean;
    emitCreate2Helpers?: boolean;
    decodeCustomErrors?: boolean;
    emitAddressBook?: boolean;
}

export interface TypeScriptTargetOptions extends CommonTargetOptions {
    transport?: 'viem' | 'ethers';
    emitHooks?: boolean;
    bigintStyle?: 'native' | 'bn.js';
    emitStructsOnly?: boolean;
}

export interface PythonTargetOptions extends CommonTargetOptions {
    emitAsync?: boolean;
    pydanticVersion?: 2;
    strictTypes?: boolean;
    eventStreaming?: {
        websocket?: boolean;
        defaultBatchSize?: number;
    };
    runtimeDependency?: string;
    format?: 'black';
    lint?: 'ruff';
}

export type TargetOptions = TypeScriptTargetOptions | PythonTargetOptions;

export interface GenerationConfig {
    targets: TargetConfig[];
    ignoreFunctions?: {
        global?: string[];
        contracts?: Record<string, string[]>;
    };
    interfaceRelationships?: Record<string, string[]>;
    types?: {
        structsOnly?: boolean;
    };
    artifactPaths?: {
        foundryOut?: string;
        hardhatOut?: string;
    };
}

export interface NetworkConfig {
    chainId: number;
    name: string;
    rpc: string;
    explorer?: string;
    contracts: Record<string, string>;
}

export interface ArtifactDefaults {
    foundryOut?: string;
    hardhatOut?: string;
}

export interface ArtifactCache {
    mode?: 'none' | 'copy' | 'link';
    dir?: string;
}

export interface ArtifactWatch {
    enabled?: boolean;
    debounceMs?: number;
}

export interface ArtifactSources {
    defaults?: ArtifactDefaults;
    cache?: ArtifactCache;
    watch?: ArtifactWatch;
}

export interface ContractArtifactOverride {
    project?: 'foundry' | 'hardhat';
    outDir?: string;
    file?: string;
}

export interface ContractDefinition {
    type?: 'implementation' | 'interface';
    implements?: string[];
    tags?: string[];
    artifact?: ContractArtifactOverride;
}

export interface ContractsConfig {
    contracts?: string[] | Record<string, ContractDefinition>;
    interfaces?: string[];
    generation: GenerationConfig;
    artifactSources?: ArtifactSources;
    networks?: Record<string, NetworkConfig>;
}

export interface CacheData {
    configHash?: string;
    artifactsHash?: string;
    targetsHash?: string;
    lastBuildTime?: number;
    generatedFiles?: Record<string, string>;
}


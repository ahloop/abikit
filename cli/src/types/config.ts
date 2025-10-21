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

export interface SDKGenerationConfig {
    enabled?: boolean;
    className?: string;  // Default: "ContractSDK"
    fileName?: string;   // Default: "sdk"
    lazyLoad?: boolean;  // Default: true
    skipZeroAddresses?: boolean;  // Default: true
}

export interface TypeScriptTargetOptions extends CommonTargetOptions {
    transport?: 'viem' | 'ethers';
    emitHooks?: boolean;
    bigintStyle?: 'native' | 'bn.js';
    emitStructsOnly?: boolean;
    sdk?: SDKGenerationConfig;
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
    sdk?: SDKGenerationConfig;
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

export interface NetworkContractConfig {
    name?: string;  // Contract class name, defaults to key
    address: string;
}

export interface NetworkConfig {
    chainId: number;
    name: string;
    rpc: string;
    explorer?: string;
    contracts: Record<string, string | NetworkContractConfig>;
}

export interface ArtifactDefaults {
    foundryOut?: string;
    hardhatOut?: string;
}

export interface ArtifactCache {
    mode?: 'none' | 'copy' | 'link';
    dir?: string;
    copyOnBuild?: boolean; // Default: false - copy artifacts to cache dir on each build
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

export interface CacheData {
    configHash?: string;
    artifactsHash?: string;
    targetsHash?: string;
    lastBuildTime?: number;
    generatedFiles?: Record<string, string>;
}

export interface Eip712Field {
    name: string;
    type: string;
}

export interface Eip712Type {
    [typeName: string]: Eip712Field[];
}

export interface Eip712Domain {
    name: string;
    version: string;
}

export interface SignatureItem {
    contract: string;
    primaryType: string;
    domain: Eip712Domain;
}

export interface SignaturesConfig {
    enabled?: boolean;
    items?: SignatureItem[];
}

export interface ContractsConfig {
    contracts?: string[] | Record<string, ContractDefinition>;
    interfaces?: string[];
    generation: GenerationConfig;
    artifactSources?: ArtifactSources;
    networks?: Record<string, NetworkConfig>;
    signatures?: SignaturesConfig;
}


/**
 * Model graph builder - constructs contract graph from artifacts and config
 */

import { ContractsConfig } from '../types/config';
import { ContractGraph, ContractModel, NetworkModel } from '../types/model';
import { ArtifactLoader } from '../artifacts/loader';
import { AbiNormalizer } from '../artifacts/normalizer';
import { ConfigLoader } from '../config/loader';

export class ModelBuilder {
    private configLoader: ConfigLoader;
    private abiNormalizer: AbiNormalizer;

    constructor() {
        this.configLoader = new ConfigLoader();
        this.abiNormalizer = new AbiNormalizer();
    }

    /**
     * Build contract graph from configuration
     */
    buildGraph(config: ContractsConfig): ContractGraph {
        const contracts = new Map<string, ContractModel>();
        const networks = new Map<string, NetworkModel>();
        const relationships = new Map<string, string[]>();

        // Load artifact loader with config for dynamic resolution
        const foundryOut = config.artifactSources?.defaults?.foundryOut || config.generation.artifactPaths?.foundryOut || './out';
        const hardhatOut = config.artifactSources?.defaults?.hardhatOut || config.generation.artifactPaths?.hardhatOut;
        const artifactLoader = new ArtifactLoader(foundryOut, hardhatOut, config);

        // Get all contract names
        const contractNames = this.configLoader.getAllContractNames(config);

        // Load and normalize each contract
        for (const contractName of contractNames) {
            try {
                const artifact = artifactLoader.loadArtifact(contractName);
                const isInterface = this.configLoader.isInterface(contractName, config);
                const contractModel = this.abiNormalizer.normalizeContract(artifact, isInterface);

                contracts.set(contractName, contractModel);
            } catch (error) {
                console.warn(`Skipping contract ${contractName}: ${error}`);
            }
        }

        // Apply interface relationships (from inline definitions or interfaceRelationships)
        for (const contractName of contractNames) {
            const interfaces = this.configLoader.getContractInterfaces(contractName, config);
            if (interfaces.length > 0) {
                relationships.set(contractName, interfaces);

                // Mark interfaces in contract models
                for (const interfaceName of interfaces) {
                    const interfaceModel = contracts.get(interfaceName);
                    if (interfaceModel) {
                        const implModel = contracts.get(contractName);
                        if (implModel && !implModel.implementationOf) {
                            implModel.implementationOf = [];
                        }
                        if (implModel) {
                            implModel.implementationOf!.push(interfaceName);
                        }
                    }
                }
            }
        }

        // Build networks
        if (config.networks) {
            for (const [networkName, networkConfig] of Object.entries(config.networks)) {
                networks.set(networkName, {
                    name: networkConfig.name,
                    chainId: networkConfig.chainId,
                    rpc: networkConfig.rpc,
                    explorer: networkConfig.explorer,
                    contracts: networkConfig.contracts,
                });
            }
        }

        return {
            contracts,
            networks,
            relationships,
        };
    }

    /**
     * Filter contracts based on ignore rules
     */
    applyIgnoreRules(
        graph: ContractGraph,
        ignoreRules?: { global?: string[]; contracts?: Record<string, string[]> }
    ): void {
        if (!ignoreRules) return;

        const globalIgnores = new Set(ignoreRules.global || []);

        for (const [contractName, contract] of graph.contracts.entries()) {
            const contractIgnores = new Set(ignoreRules.contracts?.[contractName] || []);

            // Filter functions
            contract.functions = contract.functions.filter(
                func => !globalIgnores.has(func.name) && !contractIgnores.has(func.name)
            );
        }
    }
}


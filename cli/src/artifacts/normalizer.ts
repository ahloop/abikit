/**
 * ABI normalizer - converts raw ABIs into normalized model structure
 */

import {
    ContractModel,
    FunctionModel,
    EventModel,
    ErrorModel,
    StructModel,
    Parameter,
    NatspecDocs,
} from '../types/model';
import { ContractArtifact } from './loader';

export class AbiNormalizer {
    /**
     * Normalize contract artifact into model
     */
    normalizeContract(artifact: ContractArtifact, isInterface: boolean = false): ContractModel {
        const functions: FunctionModel[] = [];
        const events: EventModel[] = [];
        const errors: ErrorModel[] = [];
        const structs: StructModel[] = [];
        let constructor: FunctionModel | undefined;

        // Extract functions, events, and errors from ABI
        for (const item of artifact.abi) {
            switch (item.type) {
                case 'function':
                    functions.push(this.normalizeFunction(item));
                    break;
                case 'event':
                    events.push(this.normalizeEvent(item));
                    break;
                case 'error':
                    errors.push(this.normalizeError(item));
                    break;
                case 'constructor':
                    constructor = this.normalizeFunction({ ...item, name: 'constructor' });
                    break;
            }
        }

        // Extract structs from function parameters
        this.extractStructs(artifact.abi, structs);

        // Extract Natspec if available
        const natspec = this.extractNatspec(artifact.metadata);

        return {
            name: artifact.contractName,
            abi: artifact.abi,
            bytecode: artifact.bytecode,
            functions,
            events,
            errors,
            structs,
            enums: [], // TODO: Extract enums
            constructor,
            natspec,
            isInterface,
            implementationOf: [],
        };
    }

    /**
     * Normalize function definition
     */
    private normalizeFunction(item: any): FunctionModel {
        return {
            name: item.name,
            inputs: (item.inputs || []).map((input: any) => this.normalizeParameter(input)),
            outputs: (item.outputs || []).map((output: any) => this.normalizeParameter(output)),
            stateMutability: item.stateMutability || 'nonpayable',
        };
    }

    /**
     * Normalize event definition
     */
    private normalizeEvent(item: any): EventModel {
        return {
            name: item.name,
            inputs: (item.inputs || []).map((input: any) => this.normalizeParameter(input, true)),
            anonymous: item.anonymous || false,
        };
    }

    /**
     * Normalize error definition
     */
    private normalizeError(item: any): ErrorModel {
        return {
            name: item.name,
            inputs: (item.inputs || []).map((input: any) => this.normalizeParameter(input)),
        };
    }

    /**
     * Normalize parameter
     */
    private normalizeParameter(param: any, isEvent: boolean = false): Parameter {
        const result: Parameter = {
            name: param.name || '',
            type: param.type,
            internalType: param.internalType,
        };

        if (isEvent && param.indexed !== undefined) {
            result.indexed = param.indexed;
        }

        if (param.components) {
            result.components = param.components.map((comp: any) => this.normalizeParameter(comp));
        }

        return result;
    }

    /**
     * Extract struct definitions from ABI
     */
    private extractStructs(abi: any[], structs: StructModel[]): void {
        const structMap = new Map<string, Parameter[]>();

        // Helper to extract struct name from internalType
        const getStructName = (internalType: string): string | null => {
            if (!internalType || !internalType.includes('struct ')) {
                return null;
            }
            const match = internalType.match(/struct\s+([^\s\[\]]+)/);
            if (match) {
                const fullName = match[1];
                return fullName.includes('.') ? fullName.split('.').pop()! : fullName;
            }
            return null;
        };

        // Scan all functions and events for struct types
        for (const item of abi) {
            if (item.type === 'function' || item.type === 'event' || item.type === 'error') {
                const allParams = [...(item.inputs || []), ...(item.outputs || [])];

                for (const param of allParams) {
                    if ((param.type === 'tuple' || param.type === 'tuple[]') && param.components) {
                        const structName = getStructName(param.internalType);
                        if (structName && !structMap.has(structName)) {
                            structMap.set(structName, param.components.map((c: any) => this.normalizeParameter(c)));
                        }
                    }
                }
            }
        }

        // Convert map to array
        for (const [name, fields] of structMap.entries()) {
            structs.push({ name, fields });
        }
    }

    /**
     * Extract Natspec documentation from metadata
     */
    private extractNatspec(metadata: any): NatspecDocs | undefined {
        if (!metadata) return undefined;

        try {
            if (typeof metadata === 'string') {
                metadata = JSON.parse(metadata);
            }

            const output = metadata.output;
            if (!output) return undefined;

            const userDoc = output.userdoc;
            const devDoc = output.devdoc;

            if (!userDoc && !devDoc) return undefined;

            return {
                notice: userDoc?.notice,
                dev: devDoc?.details,
                params: devDoc?.methods ? this.extractParamDocs(devDoc.methods) : undefined,
                returns: devDoc?.methods ? this.extractReturnDocs(devDoc.methods) : undefined,
            };
        } catch (error) {
            console.warn('Failed to extract Natspec:', error);
            return undefined;
        }
    }

    /**
     * Extract parameter documentation from methods
     */
    private extractParamDocs(methods: any): Record<string, string> {
        const params: Record<string, string> = {};

        for (const [_methodSig, methodDoc] of Object.entries(methods)) {
            if ((methodDoc as any).params) {
                Object.assign(params, (methodDoc as any).params);
            }
        }

        return params;
    }

    /**
     * Extract return documentation from methods
     */
    private extractReturnDocs(methods: any): Record<string, string> {
        const returns: Record<string, string> = {};

        for (const [_methodSig, methodDoc] of Object.entries(methods)) {
            if ((methodDoc as any).returns) {
                Object.assign(returns, (methodDoc as any).returns);
            }
        }

        return returns;
    }
}


/**
 * Model types representing normalized contract structure
 */

export type SolidityType =
    | 'address'
    | 'bool'
    | 'string'
    | 'bytes'
    | 'bytes32'
    | 'uint8' | 'uint16' | 'uint32' | 'uint48' | 'uint64' | 'uint128' | 'uint160' | 'uint256'
    | 'int8' | 'int16' | 'int32' | 'int64' | 'int128' | 'int256'
    | string; // For arrays, tuples, and custom types

export interface Parameter {
    name: string;
    type: SolidityType;
    internalType?: string;
    components?: Parameter[]; // For struct/tuple types
    indexed?: boolean; // For events
}

export interface FunctionModel {
    name: string;
    inputs: Parameter[];
    outputs: Parameter[];
    stateMutability: 'pure' | 'view' | 'nonpayable' | 'payable';
    natspec?: NatspecDocs;
}

export namespace FunctionModel {
    /**
     * Get canonical function signature for selector computation
     */
    export function getCanonicalSignature(func: FunctionModel): string {
        const paramTypes = func.inputs.map(input => normalizeTypeForSignature(input.type));
        return `${func.name}(${paramTypes.join(',')})`;
    }

    /**
     * Check if function should have a selector generated (public/external functions)
     */
    export function shouldGenerateSelector(func: FunctionModel): boolean {
        return ['pure', 'view', 'nonpayable', 'payable'].includes(func.stateMutability);
    }
}

export interface EventModel {
    name: string;
    inputs: Parameter[];
    anonymous: boolean;
    natspec?: NatspecDocs;
}

export namespace EventModel {
    /**
     * Get canonical event signature for keccak256 computation
     */
    export function getCanonicalSignature(event: EventModel): string {
        const paramTypes = event.inputs.map(input => normalizeTypeForSignature(input.type));
        return `${event.name}(${paramTypes.join(',')})`;
    }
}

export interface ErrorModel {
    name: string;
    inputs: Parameter[];
}

export namespace ErrorModel {
    /**
     * Get canonical error signature for selector computation
     */
    export function getCanonicalSignature(error: ErrorModel): string {
        const paramTypes = error.inputs.map(input => normalizeTypeForSignature(input.type));
        return `${error.name}(${paramTypes.join(',')})`;
    }
}

export interface StructModel {
    name: string;
    fields: Parameter[];
}

export interface EnumModel {
    name: string;
    values: string[];
}

export interface NatspecDocs {
    notice?: string;
    dev?: string;
    params?: Record<string, string>;
    returns?: Record<string, string>;
}

export interface ContractModel {
    name: string;
    abi: any[]; // Raw ABI
    bytecode?: string;
    functions: FunctionModel[];
    events: EventModel[];
    errors: ErrorModel[];
    structs: StructModel[];
    enums: EnumModel[];
    constructor?: FunctionModel;
    natspec?: NatspecDocs;
    isInterface?: boolean;
    implementationOf?: string[]; // Interface names this implements
}

export interface NetworkModel {
    name: string;
    chainId: number;
    rpc: string;
    explorer?: string;
    contracts: Record<string, string | { name?: string; address: string }>; // contractName -> address or {name, address}
}

export interface ContractGraph {
    contracts: Map<string, ContractModel>;
    networks: Map<string, NetworkModel>;
    relationships: Map<string, string[]>; // implementation -> interfaces
}

/**
 * Normalize Solidity type for signature computation
 * This ensures consistent type representation in function/event signatures
 */
function normalizeTypeForSignature(type: SolidityType): string {
    // Handle basic types
    if (type === 'uint') return 'uint256';
    if (type === 'int') return 'int256';
    if (type === 'byte') return 'bytes1';

    // Handle arrays
    if (type.endsWith('[]')) {
        const baseType = type.slice(0, -2);
        return `${normalizeTypeForSignature(baseType)}[]`;
    }

    // Handle fixed-size arrays
    const fixedArrayMatch = type.match(/^(.+)\[(\d+)\]$/);
    if (fixedArrayMatch) {
        const [, baseType, size] = fixedArrayMatch;
        return `${normalizeTypeForSignature(baseType)}[${size}]`;
    }

    // Handle tuples
    if (type.startsWith('tuple')) {
        return type; // Keep tuple as-is for now
    }

    return type;
}


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

export interface EventModel {
    name: string;
    inputs: Parameter[];
    anonymous: boolean;
    natspec?: NatspecDocs;
}

export interface ErrorModel {
    name: string;
    inputs: Parameter[];
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
    contracts: Record<string, string>; // contractName -> address
}

export interface ContractGraph {
    contracts: Map<string, ContractModel>;
    networks: Map<string, NetworkModel>;
    relationships: Map<string, string[]>; // implementation -> interfaces
}


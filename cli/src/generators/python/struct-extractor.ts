/**
 * Utility for extracting struct types from ABI files (Python version)
 */

import { ContractModel, StructModel } from '../../types/model';

export interface StructTypeField {
    name: string;
    type: string;
}

export interface StructTypeDefinition {
    [structName: string]: StructTypeField[];
}

export class PythonStructExtractor {
    /**
     * Extract struct types from contract ABI
     */
    static extractStructTypes(contract: ContractModel, primaryType: string): StructTypeDefinition | null {
        const structTypes: StructTypeDefinition = {};

        // First, try to find the struct in the contract's structs
        const targetStruct = contract.structs.find(s => s.name === primaryType);
        if (targetStruct) {
            structTypes[primaryType] = this.convertStructToTypeFields(targetStruct);

            // Also extract any nested structs
            this.extractNestedStructs(targetStruct, contract.structs, structTypes);
        }

        // If not found in structs, try to extract from ABI functions/events
        if (!structTypes[primaryType]) {
            const extractedFromABI = this.extractFromABI(contract, primaryType);
            if (extractedFromABI) {
                Object.assign(structTypes, extractedFromABI);
            }
        }

        return Object.keys(structTypes).length > 0 ? structTypes : null;
    }

    /**
     * Convert a StructModel to type fields
     */
    private static convertStructToTypeFields(struct: StructModel): StructTypeField[] {
        return struct.fields.map(field => ({
            name: field.name,
            type: this.normalizeTypeForEIP712(field.type)
        }));
    }

    /**
     * Extract nested structs recursively
     */
    private static extractNestedStructs(
        struct: StructModel,
        allStructs: StructModel[],
        result: StructTypeDefinition
    ): void {
        for (const field of struct.fields) {
            const fieldType = this.extractStructNameFromType(field.type);
            if (fieldType && !result[fieldType]) {
                const nestedStruct = allStructs.find(s => s.name === fieldType);
                if (nestedStruct) {
                    result[fieldType] = this.convertStructToTypeFields(nestedStruct);
                    this.extractNestedStructs(nestedStruct, allStructs, result);
                }
            }
        }
    }

    /**
     * Extract struct types from ABI functions and events
     */
    private static extractFromABI(contract: ContractModel, primaryType: string): StructTypeDefinition | null {
        const structTypes: StructTypeDefinition = {};

        // Look through all functions and events for tuple types
        for (const func of contract.functions) {
            this.extractFromParameters(func.inputs, structTypes, contract.structs);
            this.extractFromParameters(func.outputs, structTypes, contract.structs);
        }

        for (const event of contract.events) {
            this.extractFromParameters(event.inputs, structTypes, contract.structs);
        }

        // Check if we found the primary type
        if (structTypes[primaryType]) {
            return structTypes;
        }

        return null;
    }

    /**
     * Extract struct types from parameter list
     */
    private static extractFromParameters(
        params: any[],
        result: StructTypeDefinition,
        allStructs: StructModel[]
    ): void {
        for (const param of params) {
            if (param.type === 'tuple' && param.components) {
                const structName = this.extractStructNameFromInternalType(param.internalType);
                if (structName && !result[structName]) {
                    result[structName] = param.components.map((comp: any) => ({
                        name: comp.name,
                        type: this.normalizeTypeForEIP712(comp.type)
                    }));

                    // Recursively extract nested structs
                    this.extractFromParameters(param.components, result, allStructs);
                }
            }
        }
    }

    /**
     * Extract struct name from internal type
     */
    private static extractStructNameFromInternalType(internalType?: string): string | null {
        if (!internalType || !internalType.includes('struct ')) {
            return null;
        }
        const match = internalType.match(/struct\s+([^\s\[\]]+)/);
        if (match) {
            const fullName = match[1];
            return fullName.includes('.') ? fullName.split('.').pop()! : fullName;
        }
        return null;
    }

    /**
     * Extract struct name from type string
     */
    private static extractStructNameFromType(type: string): string | null {
        // Handle array types
        if (type.endsWith('[]')) {
            return this.extractStructNameFromType(type.slice(0, -2));
        }

        // Handle fixed-size arrays
        const fixedArrayMatch = type.match(/^(.+)\[(\d+)\]$/);
        if (fixedArrayMatch) {
            return this.extractStructNameFromType(fixedArrayMatch[1]);
        }

        // Check if it's a custom type (not a primitive)
        const primitiveTypes = [
            'address', 'bool', 'string', 'bytes', 'bytes32', 'bytes16', 'bytes8', 'bytes4',
            'uint8', 'uint16', 'uint32', 'uint64', 'uint128', 'uint256',
            'int8', 'int16', 'int32', 'int64', 'int128', 'int256'
        ];

        if (!primitiveTypes.includes(type) && !type.startsWith('uint') && !type.startsWith('int') && !type.startsWith('bytes')) {
            return type;
        }

        return null;
    }

    /**
     * Normalize type for EIP-712 signature
     */
    private static normalizeTypeForEIP712(type: string): string {
        // Handle arrays
        if (type.endsWith('[]')) {
            const baseType = type.slice(0, -2);
            return `${this.normalizeTypeForEIP712(baseType)}[]`;
        }

        // Handle fixed-size arrays
        const fixedArrayMatch = type.match(/^(.+)\[(\d+)\]$/);
        if (fixedArrayMatch) {
            const [, baseType, size] = fixedArrayMatch;
            return `${this.normalizeTypeForEIP712(baseType)}[${size}]`;
        }

        // Normalize basic types
        switch (type) {
            case 'uint': return 'uint256';
            case 'int': return 'int256';
            case 'byte': return 'bytes1';
            default: return type;
        }
    }
}

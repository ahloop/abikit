/**
 * TypeScript-specific utilities
 */

import { Parameter, ContractModel } from '../../types/model';

export class TypeScriptUtils {
    /**
     * Convert string to camelCase
     */
    static toCamelCase(str: string): string {
        return str.charAt(0).toLowerCase() + str.slice(1);
    }

    /**
     * Convert string to PascalCase
     */
    static toPascalCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Map Solidity type to TypeScript type
     */
    static mapSolidityTypeToTS(param: Parameter, contract: ContractModel): string {
        const { type, internalType, components } = param;

        // Handle arrays
        if (type.endsWith('[]')) {
            const baseType = type.slice(0, -2);
            const baseParam = { ...param, type: baseType as any };
            return `${this.mapSolidityTypeToTS(baseParam, contract)}[]`;
        }

        // Handle tuples (structs)
        if (type === 'tuple' && components) {
            const structName = this.extractStructName(internalType);
            if (structName) {
                return structName;
            }
            return `{ ${components.map(c => `${c.name}: ${this.mapSolidityTypeToTS(c, contract)}`).join('; ')} }`;
        }

        // Basic type mapping
        const typeMap: Record<string, string> = {
            'address': 'Address',
            'bool': 'boolean',
            'string': 'string',
            'bytes': 'Hex',
            'bytes32': 'Hash',
            'uint8': 'number',
            'uint16': 'number',
            'uint32': 'number',
            'uint48': 'number',
            'uint64': 'bigint',
            'uint128': 'bigint',
            'uint160': 'bigint',
            'uint256': 'bigint',
            'int256': 'bigint',
        };

        return typeMap[type] || 'unknown';
    }

    /**
     * Extract struct name from internalType
     */
    static extractStructName(internalType?: string): string | null {
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
     * Check if contract uses a specific type
     */
    static contractUsesType(contract: ContractModel, type: string): boolean {
        const checkParam = (param: Parameter): boolean => {
            // Strip array suffix for comparison
            const baseType = param.type.replace(/\[\]$/, '');
            if (baseType === type) return true;
            if (param.components) {
                return param.components.some(checkParam);
            }
            return false;
        };

        return contract.functions.some(func =>
            func.inputs.some(checkParam) || func.outputs.some(checkParam)
        ) || contract.events.some(event =>
            event.inputs.some(checkParam)
        );
    }

    /**
     * Map Solidity type to TypeScript type for signature generation
     */
    static mapSolidityTypeToTypeScript(solidityType: string): string {
        // Handle arrays
        if (solidityType.endsWith('[]')) {
            const baseType = solidityType.slice(0, -2);
            return `${this.mapSolidityTypeToTypeScript(baseType)}[]`;
        }

        // Handle basic types
        switch (solidityType) {
            case 'bool':
                return 'boolean';
            case 'uint8':
            case 'uint16':
            case 'uint32':
            case 'uint64':
            case 'uint128':
            case 'uint256':
            case 'int8':
            case 'int16':
            case 'int32':
            case 'int64':
            case 'int128':
            case 'int256':
                return 'bigint';
            case 'address':
                return 'Address';
            case 'bytes':
            case 'bytes32':
                return 'Hex';
            case 'string':
                return 'string';
            default:
                // Assume it's a custom type (struct)
                return this.toPascalCase(solidityType);
        }
    }
}

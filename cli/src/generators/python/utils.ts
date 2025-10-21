/**
 * Python-specific utilities
 */

import { Parameter } from '../../types/model';

export class PythonUtils {
    /**
     * Convert to snake_case
     */
    static toSnakeCase(str: string): string {
        return str.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
    }

    /**
     * Convert string to PascalCase
     */
    static toPascalCase(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Make parameter name Python-safe (avoid reserved keywords)
     */
    static makePythonSafeParamName(name: string): string {
        const reservedKeywords = new Set([
            'from', 'import', 'class', 'def', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally',
            'with', 'as', 'pass', 'break', 'continue', 'return', 'yield', 'lambda', 'and', 'or', 'not', 'in',
            'is', 'global', 'nonlocal', 'assert', 'del', 'exec', 'print', 'raise', 'True', 'False', 'None'
        ]);

        if (reservedKeywords.has(name)) {
            return `${name}_param`;
        }
        return name;
    }

    /**
     * Map Solidity type to Python type
     */
    static mapSolidityTypeToPython(param: Parameter): string {
        const { type } = param;

        if (type.endsWith('[]')) {
            const baseType = type.slice(0, -2);
            return `list[${this.mapSolidityTypeToPython({ ...param, type: baseType })}]`;
        }

        if (type === 'tuple') {
            const structName = this.extractStructName(param.internalType);
            if (structName) {
                // Use string annotation for forward reference
                return `'${structName}'`;
            }
            return 'dict';
        }

        const typeMap: Record<string, string> = {
            'address': 'str',
            'bool': 'bool',
            'string': 'str',
            'bytes': 'bytes',
            'bytes32': 'bytes',
            'uint8': 'int',
            'uint16': 'int',
            'uint32': 'int',
            'uint48': 'int',
            'uint64': 'int',
            'uint128': 'int',
            'uint160': 'int',
            'uint256': 'int',
            'int256': 'int',
        };

        return typeMap[type] || 'any';
    }

    /**
     * Extract struct name
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
     * Map Solidity type to Python type for signature generation
     */
    static mapSolidityTypeToPythonForSignature(solidityType: string): string {
        // Handle arrays
        if (solidityType.endsWith('[]')) {
            const baseType = solidityType.slice(0, -2);
            return `List[${this.mapSolidityTypeToPythonForSignature(baseType)}]`;
        }

        // Handle basic types
        switch (solidityType) {
            case 'bool':
                return 'bool';
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
                return 'int';
            case 'address':
                return 'str';
            case 'bytes':
            case 'bytes32':
                return 'str';
            case 'string':
                return 'str';
            default:
                // Assume it's a custom type (struct)
                return this.toPascalCase(solidityType);
        }
    }
}

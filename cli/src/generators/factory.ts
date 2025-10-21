/**
 * Generator factory - creates appropriate generator for target language
 */

import { Generator } from './base';
import { TypeScriptGenerator } from './typescript/index';
import { PythonGenerator } from './python/index';
import { TargetConfig, Language } from '../types/config';

export class GeneratorFactory {
    /**
     * Create generator for target configuration
     */
    static createGenerator(config: TargetConfig): Generator {
        switch (config.language) {
            case 'ts':
                return new TypeScriptGenerator(config.outDir, config.options);

            case 'python':
                return new PythonGenerator(config.outDir, config.options);

            default:
                throw new Error(`Unsupported language: ${(config as any).language}`);
        }
    }

    /**
     * Get supported languages
     */
    static getSupportedLanguages(): Language[] {
        return ['ts', 'python'];
    }
}


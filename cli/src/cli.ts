#!/usr/bin/env node
/**
 * CLI for contract-sdk-gen
 */

import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import chalk from 'chalk';
import { ConfigLoader } from './config/loader';
import { ModelBuilder } from './model/builder';
import { ArtifactLoader } from './artifacts/loader';
import { GeneratorFactory } from './generators/factory';
import { CacheManager } from './cache/manager';

const program = new Command();

program
    .name('abikit')
    .description('Multi-language SDK generator for smart contracts')
    .version('0.1.0');

/**
 * Init command - scaffold contracts.yaml from artifacts
 */
program
    .command('init')
    .description('Initialize contracts.yaml from existing artifacts')
    .option('-f, --foundry-out <path>', 'Foundry out directory', './out')
    .option('-h, --hardhat-out <path>', 'Hardhat artifacts directory')
    .option('-o, --output <path>', 'Output config file path', './contracts.yaml')
    .action(async (options) => {
        try {
            console.log(chalk.blue('🔍 Scanning artifacts...'));

            const loader = new ArtifactLoader(options.foundryOut, options.hardhatOut);
            const contracts = loader.listAvailableContracts();

            console.log(chalk.green(`✅ Found ${contracts.length} contracts`));

            // Separate contracts and interfaces
            const interfaces = contracts.filter(c => c.startsWith('I'));
            const implementations = contracts.filter(c => !c.startsWith('I'));

            // Create contracts object (use object format for consistency)
            const contractsObject: Record<string, any> = {};
            implementations.forEach(name => {
                contractsObject[name] = {};
            });

            // Create basic config with new schema
            const config = {
                contracts: contractsObject,
                interfaces: interfaces,
                generation: {
                    targets: [
                        {
                            language: 'ts',
                            outDir: './sdk/typescript',
                            options: {
                                transport: 'viem',
                                emitHooks: false,
                                packageName: 'my-contract-sdk',
                            },
                        },
                    ],
                    artifactPaths: {
                        foundryOut: options.foundryOut,
                        ...(options.hardhatOut && { hardhatOut: options.hardhatOut }),
                    },
                },
            };

            fs.writeFileSync(options.output, require('js-yaml').dump(config), 'utf8');
            console.log(chalk.green(`✅ Created ${options.output}`));
            console.log(chalk.dim('   Edit the file to configure targets and options'));

        } catch (error) {
            console.error(chalk.red('❌ Init failed:'), error);
            process.exit(1);
        }
    });

/**
 * Validate command - check contracts.yaml
 */
program
    .command('validate')
    .description('Validate contracts.yaml configuration')
    .argument('[config]', 'Path to contracts.yaml', './contracts.yaml')
    .action(async (configPath: string) => {
        try {
            console.log(chalk.blue('🔍 Validating configuration...'));

            const loader = new ConfigLoader();
            const config = loader.loadConfig(path.resolve(configPath));

            console.log(chalk.green('✅ Configuration is valid'));
            console.log(chalk.dim(`   Targets: ${config.generation.targets.map(t => t.language).join(', ')}`));

        } catch (error) {
            console.error(chalk.red('❌ Validation failed:'), error);
            process.exit(1);
        }
    });

/**
 * Build command - generate SDKs
 */
program
    .command('build')
    .description('Generate SDKs from contracts')
    .argument('[config]', 'Path to contracts.yaml', './contracts.yaml')
    .option('-f, --force', 'Force rebuild, bypassing cache')
    .action(async (configPath: string, options: { force?: boolean }) => {
        try {
            const resolvedConfigPath = path.resolve(configPath);
            console.log(chalk.blue('🔨 Building SDKs...'));

            const loader = new ConfigLoader();
            const config = loader.loadConfig(resolvedConfigPath);

            // Initialize cache manager
            const cacheManager = new CacheManager('.abikit-cache.json');

            // Determine artifact paths
            const foundryOut = config.artifactSources?.defaults?.foundryOut ||
                config.generation.artifactPaths?.foundryOut ||
                './out';
            const artifactPaths = [path.resolve(foundryOut)];

            if (config.artifactSources?.defaults?.hardhatOut || config.generation.artifactPaths?.hardhatOut) {
                const hardhatOut = config.artifactSources?.defaults?.hardhatOut || config.generation.artifactPaths?.hardhatOut;
                if (hardhatOut) {
                    artifactPaths.push(path.resolve(hardhatOut));
                }
            }

            // Determine target directories
            const targetDirs = config.generation.targets.map(t => path.resolve(t.outDir));

            // Check if regeneration is needed (unless --force)
            if (!options.force) {
                const cacheCheck = cacheManager.needsRegeneration({
                    configPath: resolvedConfigPath,
                    artifactPaths,
                    targetDirs,
                });

                if (!cacheCheck.needed) {
                    console.log(chalk.green('✓ Artifacts unchanged, skipping generation (use --force to rebuild)'));
                    return;
                }

                if (cacheCheck.reason) {
                    console.log(chalk.dim(`ℹ️  Rebuilding: ${cacheCheck.reason}`));
                }
            } else {
                console.log(chalk.dim('ℹ️  Force rebuild requested, bypassing cache'));
            }

            const builder = new ModelBuilder();
            const graph = builder.buildGraph(config);

            // Apply ignore rules
            builder.applyIgnoreRules(graph, config.generation.ignoreFunctions);

            console.log(chalk.green(`✅ Built model with ${graph.contracts.size} contracts`));

            // Invoke generators for each target
            for (const target of config.generation.targets) {
                console.log(chalk.blue(`📝 Generating ${target.language} SDK to ${target.outDir}...`));

                const generator = GeneratorFactory.createGenerator(target);
                await generator.generate(graph, target);
            }

            // Record successful build
            cacheManager.recordBuild({
                configPath: resolvedConfigPath,
                artifactPaths,
                targetDirs,
            });

            console.log(chalk.green('🎉 Build complete!'));

        } catch (error) {
            console.error(chalk.red('❌ Build failed:'), error);
            process.exit(1);
        }
    });

/**
 * List command - show available contracts
 */
program
    .command('list')
    .description('List available contracts from artifacts')
    .option('-f, --foundry-out <path>', 'Foundry out directory', './out')
    .option('-h, --hardhat-out <path>', 'Hardhat artifacts directory')
    .action(async (options) => {
        try {
            const loader = new ArtifactLoader(options.foundryOut, options.hardhatOut);
            const contracts = loader.listAvailableContracts();

            console.log(chalk.blue(`📋 Available contracts (${contracts.length}):`));
            contracts.sort().forEach(name => {
                console.log(`   - ${name}`);
            });

        } catch (error) {
            console.error(chalk.red('❌ List failed:'), error);
            process.exit(1);
        }
    });

/**
 * Clean command - remove generated files
 */
program
    .command('clean')
    .description('Remove generated SDK files')
    .argument('[config]', 'Path to contracts.yaml', './contracts.yaml')
    .action(async (configPath: string) => {
        try {
            console.log(chalk.blue('🧹 Cleaning generated files...'));

            const loader = new ConfigLoader();
            const config = loader.loadConfig(path.resolve(configPath));

            for (const target of config.generation.targets) {
                const outDir = path.resolve(target.outDir);
                if (fs.existsSync(outDir)) {
                    fs.rmSync(outDir, { recursive: true, force: true });
                    console.log(chalk.green(`✅ Removed ${target.outDir}`));
                }
            }

            console.log(chalk.green('🎉 Clean complete!'));

        } catch (error) {
            console.error(chalk.red('❌ Clean failed:'), error);
            process.exit(1);
        }
    });

/**
 * Artifacts command group
 */
const artifacts = program.command('artifacts').description('Manage contract artifacts');

/**
 * Artifacts list command
 */
artifacts
    .command('list')
    .description('List resolved artifact paths for all contracts')
    .argument('[config]', 'Path to contracts.yaml', './contracts.yaml')
    .action(async (configPath: string) => {
        try {
            console.log(chalk.blue('📋 Resolving artifact paths...\n'));

            const loader = new ConfigLoader();
            const config = loader.loadConfig(path.resolve(configPath));

            const foundryOut = config.artifactSources?.defaults?.foundryOut || config.generation.artifactPaths?.foundryOut || './out';
            const hardhatOut = config.artifactSources?.defaults?.hardhatOut || config.generation.artifactPaths?.hardhatOut;
            const artifactLoader = new ArtifactLoader(foundryOut, hardhatOut, config);

            const contractNames = loader.getAllContractNames(config);
            const resolved = artifactLoader.listResolvedArtifacts(contractNames);

            console.log(chalk.green(`Found ${Object.keys(resolved).length} of ${contractNames.length} contracts:\n`));

            for (const [name, artifactPath] of Object.entries(resolved)) {
                console.log(`  ${chalk.cyan(name.padEnd(30))} → ${artifactPath}`);
            }

            const missing = contractNames.filter(name => !resolved[name]);
            if (missing.length > 0) {
                console.log(chalk.yellow(`\n⚠️  Missing artifacts for ${missing.length} contracts:`));
                missing.forEach(name => console.log(`  - ${name}`));
            }

        } catch (error) {
            console.error(chalk.red('❌ List failed:'), error);
            process.exit(1);
        }
    });

program.parse(process.argv);


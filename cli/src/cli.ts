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

function getVersion(): string {
    try {
        const pkgPath = path.join(__dirname, '../package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        return pkg.version || 'unknown';
    } catch {
        return 'unknown';
    }
}

program
    .name('abikit')
    .description('Multi-language SDK generator for smart contracts')
    .version(getVersion());

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
 * Cache command - manage artifact cache
 */
const cacheCommand = program
    .command('cache')
    .description('Manage artifact cache');

cacheCommand
    .command('clear')
    .description('Clear artifact cache')
    .argument('[config]', 'Path to contracts.yaml', './contracts.yaml')
    .action(async (configPath: string) => {
        try {
            const resolvedConfigPath = path.resolve(configPath);
            console.log(chalk.blue('🗑️  Clearing artifact cache...'));

            const loader = new ConfigLoader();
            const config = loader.loadConfig(resolvedConfigPath);

            if (config.artifactSources?.cache?.mode === 'copy') {
                const foundryOut = config.artifactSources?.defaults?.foundryOut || './out';
                const artifactLoader = new ArtifactLoader(foundryOut, config.artifactSources?.defaults?.hardhatOut, config);
                const cacheManager = artifactLoader.getCacheManager();

                if (cacheManager) {
                    cacheManager.clearCache();
                    console.log(chalk.green('✅ Artifact cache cleared'));
                } else {
                    console.log(chalk.yellow('⚠️  No cache manager found'));
                }
            } else {
                console.log(chalk.yellow('⚠️  Artifact caching is not enabled'));
            }

        } catch (error) {
            console.error(chalk.red('❌ Failed to clear cache:'), error);
            process.exit(1);
        }
    });

cacheCommand
    .command('stats')
    .description('Show cache statistics')
    .argument('[config]', 'Path to contracts.yaml', './contracts.yaml')
    .action(async (configPath: string) => {
        try {
            const resolvedConfigPath = path.resolve(configPath);
            console.log(chalk.blue('📊 Cache statistics...'));

            const loader = new ConfigLoader();
            const config = loader.loadConfig(resolvedConfigPath);

            if (config.artifactSources?.cache?.mode === 'copy') {
                const foundryOut = config.artifactSources?.defaults?.foundryOut || './out';
                const artifactLoader = new ArtifactLoader(foundryOut, config.artifactSources?.defaults?.hardhatOut, config);
                const cacheManager = artifactLoader.getCacheManager();

                if (cacheManager) {
                    const stats = cacheManager.getCacheStats();
                    console.log(chalk.green(`📦 Cache Directory: ${stats.cacheDir}`));
                    console.log(chalk.green(`📄 Cached Artifacts: ${stats.cachedCount}`));
                    if (stats.lastCacheTime) {
                        console.log(chalk.green(`⏰ Last Cache Time: ${new Date(stats.lastCacheTime).toLocaleString()}`));
                    }
                } else {
                    console.log(chalk.yellow('⚠️  No cache manager found'));
                }
            } else {
                console.log(chalk.yellow('⚠️  Artifact caching is not enabled'));
            }

        } catch (error) {
            console.error(chalk.red('❌ Failed to get cache stats:'), error);
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
            const configDir = path.dirname(resolvedConfigPath);
            const cliVersion = getVersion();
            console.log(chalk.blue(`🔨 Building SDKs (abikit v${cliVersion})...`));
            console.log(chalk.dim(`Config: ${resolvedConfigPath}`));

            const loader = new ConfigLoader();
            const config = loader.loadConfig(resolvedConfigPath);

            // Initialize cache manager
            const cacheManager = new CacheManager('.abikit-cache.json');

            // Determine artifact paths
            const foundryOutRaw = config.artifactSources?.defaults?.foundryOut ||
                config.generation.artifactPaths?.foundryOut ||
                './out';
            const foundryOut = path.isAbsolute(foundryOutRaw)
                ? foundryOutRaw
                : path.resolve(configDir, foundryOutRaw);
            const artifactPaths = [foundryOut];

            if (config.artifactSources?.defaults?.hardhatOut || config.generation.artifactPaths?.hardhatOut) {
                const hardhatOutRaw = config.artifactSources?.defaults?.hardhatOut || config.generation.artifactPaths?.hardhatOut;
                if (hardhatOutRaw) {
                    const hardhatOut = path.isAbsolute(hardhatOutRaw)
                        ? hardhatOutRaw
                        : path.resolve(configDir, hardhatOutRaw);
                    artifactPaths.push(hardhatOut);
                }
            }

            // Determine target directories
            const targetDirs = config.generation.targets.map(t =>
                path.isAbsolute(t.outDir) ? t.outDir : path.resolve(configDir, t.outDir)
            );

            // Handle artifact caching if enabled (run before cache check)
            if (config.artifactSources?.cache?.mode === 'copy') {
                const artifactLoader = new ArtifactLoader(
                    foundryOut,
                    config.artifactSources?.defaults?.hardhatOut,
                    config,
                    configDir
                );
                const contractNames = Object.keys(config.contracts || {});

                console.log(chalk.blue('📦 Caching artifacts...'));
                await artifactLoader.copyArtifactsToCache(contractNames, options.force);

                const cacheManager = artifactLoader.getCacheManager();
                if (cacheManager) {
                    const stats = cacheManager.getCacheStats();
                    console.log(chalk.green(`✅ Cached ${stats.cachedCount} artifacts to ${stats.cacheDir}`));
                }
            }

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
            const graph = builder.buildGraph(config, configDir);

            // Apply ignore rules
            builder.applyIgnoreRules(graph, config.generation.ignoreFunctions);

            console.log(chalk.green(`✅ Built model with ${graph.contracts.size} contracts`));

            // Invoke generators for each target
            for (const target of config.generation.targets) {
                console.log(chalk.blue(`📝 Generating ${target.language} SDK to ${target.outDir}...`));

                const generator = GeneratorFactory.createGenerator(target);
                const context = {
                    networks: config.networks,
                    signatures: config.signatures,
                    artifactSources: config.artifactSources,
                    fullConfig: config,
                };
                await generator.generate(graph, target, context);
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


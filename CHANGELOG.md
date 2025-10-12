# abikit Changelog

## v0.1.0 - Initial Release (2025-10-03)

### Core Features

- **Multi-Language SDK Generation**: Generate TypeScript (viem) and Python (web3.py + Pydantic) SDKs from Solidity contract artifacts
- **Foundry & Hardhat Support**: Works seamlessly with both Foundry and Hardhat build artifacts  
- **Config-Driven**: Simple YAML configuration (`contracts.yaml`) for all generation options
- **CLI Tool**: Complete command-line interface with `init`, `validate`, `build`, `list`, and `clean` commands
- **Type-Safe**: Fully-typed contract wrappers with automatic struct and event type generation

### Installation

- **curl Installer**: Foundryup-style installation via `curl -L https://abikit.ahloop.com/install | bash`
- **npm Package**: Available via `npm install -g abikit`
- **Updater**: Built-in `abikitup` command to update to latest version

### CLI Commands

- `abikit init` - Scaffold contracts.yaml from artifacts
- `abikit validate` - Validate configuration
- `abikit build` - Generate SDKs for all targets
- `abikit list` - List available contracts
- `abikit clean` - Remove generated files

### TypeScript Generator

- Viem-first transport library
- Native BigInt support
- Typed struct interfaces
- Optional wagmi React hooks
- Event watchers
- Read/write method separation

### Python Generator  

- web3.py contract classes
- Pydantic v2 models for structs
- snake_case conventions
- Optional async/await support
- Type-safe parameter validation
- Auto-formatting with Black
- Auto-linting with Ruff

### Configuration Options

- **Simple Schema**: Just list contracts with optional tags for organization
- **Flexible Format**: Use array for simple lists or object with optional tags for metadata
- **Auto-Detection**: Interfaces automatically detected by `I`-prefix naming convention
- Ignore functions (globally or per-contract)
- Interface relationships mapping
- Network configurations with contract addresses
- Language-specific options for TypeScript and Python

### Documentation

- Full documentation website at https://abikit.ahloop.com
- Installation guide
- CLI reference
- Configuration guide
- Example configurations
- Deployment guide

### Repository

- **GitHub**: https://github.com/ahloop/abikit
- **Owner**: ahloop
- **License**: MIT
- **Monorepo Structure**:
  - `cli/` - CLI tool and SDK generator
  - `website/` - Next.js documentation site

### Project Structure

```
abikit/
├── cli/                    # CLI tool
│   ├── src/
│   │   ├── artifacts/     # Foundry/Hardhat artifact loading
│   │   ├── config/        # Configuration management
│   │   ├── generators/    # Language-specific generators
│   │   ├── model/         # Contract graph builder
│   │   └── types/         # TypeScript types
│   ├── scripts/           # Installer scripts
│   └── schema/            # JSON Schema for validation
│
└── website/               # Documentation website
    ├── src/pages/        # Next.js pages
    ├── src/components/   # React components
    └── src/content/docs/ # MDX documentation
```

### Next Steps

- Phase 2: Complete template implementations
- Phase 3: Add plugins (agent tooling, CREATE2 helpers, docs generator)
- Phase 4: Testing & polish
- Phase 5: Release automation and publishing

---

## Future Releases

### Planned Features

- Watch mode for automatic regeneration
- Prebuilt binaries for faster installation
- Additional language targets (Rust, Go)
- Agent tooling plugin for AI integration
- Factory/CREATE2 helpers
- Documentation generator
- React hooks plugin improvements


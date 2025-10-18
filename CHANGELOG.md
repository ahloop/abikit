# abikit Changelog

## v0.2.2 - Modular Generator Refactoring & SDK Modules (2025-10-18)

### 🚀 Major Improvements

#### **Modular Generator Architecture**
- **Reorganized TypeScript Generator**: Split monolithic generator into focused modules:
  - `config-generator.ts` - Network and runtime configuration
  - `contract-generator.ts` - Individual contract modules  
  - `interface-generator.ts` - Interface implementations
  - `types-generator.ts` - Centralized type definitions
  - `signatures-generator.ts` - EIP-712 signature utilities
  - `errors-generator.ts` - Custom error handling
  - `events-generator.ts` - Event type generation
  - `selectors-generator.ts` - Function selector computation
  - `utilities-generator.ts` - Helper utilities
  - `utils-generator.ts` - TypeScript conversion utilities
- **Reorganized Python Generator**: Applied same modular structure for consistency
  - `config-generator.ts` - Network and runtime configuration
  - `contract-generator.ts` - Individual contract modules
  - `interface-generator.ts` - Interface implementations
  - `types-generator.ts` - Centralized type definitions
  - `signatures-generator.ts` - EIP-712 signature utilities
  - `errors-generator.ts` - Custom error handling
  - `events-generator.ts` - Event type generation
  - `selectors-generator.ts` - Function selector computation
  - `sdk-generator.ts` - SDK class generation
  - `utils.ts` - Python conversion utilities

#### **New Generated SDK Modules**
- **TypeScript SDK Output**: Complete structure under `cli/sdk/ts/generated/`
  - Contract modules with full method implementations
  - Interface implementations for abstraction
  - Type definitions with proper typing
  - Configuration modules for network setup
  - Signature modules for EIP-712 operations
  - Utility functions for blockchain operations
- **Python SDK Output**: Complete structure under `cli/sdk/py/generated/`
  - Python contract classes using web3.py
  - Pydantic models for type safety
  - Configuration modules with runtime support
  - Signature modules for EIP-712 signing
  - Type definitions and constants

### 🔧 Technical Improvements

#### **Configuration System**
- Enhanced configuration loader with better validation
- Support for contract artifact overrides
- Improved factory configuration handling
- Better network configuration resolution

#### **Type System**
- Enhanced model types with better interface support
- Improved struct and enum type generation
- Better handling of complex nested types
- Enhanced enum model generation

#### **CLI Enhancements**
- Improved error handling and reporting
- Better progress reporting during generation
- Enhanced validation of configuration files
- Better handling of missing artifacts

#### **Generator Factory**
- Modular generator factory pattern
- Better separation of concerns
- Easier to extend with new generators
- Support for language-specific options

### 📦 SDK Improvements

#### **TypeScript SDK**
- ✅ Complete contract class implementations
- ✅ Full interface implementations  
- ✅ Type-safe configuration system
- ✅ Event watchers and log retrieval
- ✅ Static error decoders
- ✅ Function selector mappings
- ✅ Network configuration support

#### **Python SDK**
- ✅ web3.py contract classes
- ✅ Pydantic v2 models for type safety
- ✅ Complete method implementations
- ✅ Configuration and address management
- ✅ Runtime configuration support
- ✅ Type definitions and constants
- ✅ Signature generation support

### 🛠️ Developer Experience

- **Better Error Messages**: More descriptive and actionable error messages
- **Improved Code Organization**: Single-responsibility modules for easier maintenance
- **Enhanced Documentation**: Better inline documentation and code comments
- **Consistent Patterns**: Both TypeScript and Python follow same architectural patterns
- **Easier Extension**: New language targets can be added more easily

### 🐛 Bug Fixes

- Fixed generator initialization issues
- Improved handling of missing contract artifacts
- Better error recovery in type generation
- Enhanced validation of configuration options

### ✨ New Features

- Modular SDK generation pipeline
- Support for complex type hierarchies
- Enhanced EIP-712 signature support
- Improved factory pattern support

### 🔄 Breaking Changes

- Generator base class interface updated (internal use only)
- Configuration schema expanded to support new options
- Generated code structure reorganized for clarity

### 📋 Migration Notes

- Existing configurations continue to work with new generator
- Generated SDK structure is backward compatible
- Update build scripts to use new modular generators if customized
- New module organization allows for better incremental builds

---

## v0.1.2 - Generator Reorganization & Signature Fixes (2025-10-16)

### 🚀 Major Improvements

#### **Modular Generator Architecture**
- **Reorganized TypeScript Generator**: Split monolithic generator into focused modules:
  - `types-generator.ts` - Centralized type definitions
  - `contract-generator.ts` - Individual contract modules
  - `interface-generator.ts` - Interface implementations
  - `config-generator.ts` - Network and runtime configuration
  - `signatures-generator.ts` - EIP-712 signature utilities
- **Reorganized Python Generator**: Applied same modular structure for consistency
- **Improved Maintainability**: Each generator module has single responsibility
- **Better Code Organization**: Easier to extend and debug individual components

#### **EIP-712 Signature Generation Fixes**
- **Fixed Missing Signature Files**: Resolved issue where individual signature files weren't being generated
- **Hardcoded Type Definitions**: Added fallback type definitions for signature types when contracts aren't found in graph
- **Python Forward References**: Fixed nested type references (e.g., `Tag[]` in `ReputationRecord`)
- **TypeScript Network Names**: Fixed compilation errors for network names with hyphens (e.g., `base-sepolia`)

### 🔧 Technical Fixes

#### **TypeScript Generator**
- Fixed network name quoting for hyphenated networks (`"base-sepolia"` instead of `base-sepolia`)
- Added hardcoded type definitions for `BidAuthorization`, `ReputationRecord`, and nested types
- Improved error handling in signature generation
- Enhanced type safety with proper forward references

#### **Python Generator**
- Added `getHardcodedTypeDefinition()` method for signature types
- Fixed forward reference handling for array types (`Tag[]` → `'List[Tag]'`)
- Improved type model generation with proper Python type annotations
- Enhanced error handling when contracts are missing from graph

#### **Build System**
- Fixed TypeScript compilation errors in generated SDKs
- Improved Python import resolution
- Enhanced error messages for debugging
- Better handling of missing contract artifacts

### 📦 Generated SDK Improvements

#### **TypeScript SDK**
- ✅ All signature files now generated: `bid-authorization.ts`, `reputation-record.ts`, `domain.ts`, `index.ts`
- ✅ Compiles successfully with no TypeScript errors
- ✅ Proper network configuration with quoted hyphenated names
- ✅ Complete type definitions for all signature types

#### **Python SDK**
- ✅ All signature files now generated: `bid_authorization.py`, `reputation_record.py`, `domain.py`, `__init__.py`
- ✅ Imports successfully without Python errors
- ✅ Proper forward references for nested types
- ✅ Complete Pydantic models for all signature types

### 🛠️ Developer Experience

- **Better Error Messages**: More descriptive error messages for debugging
- **Improved Documentation**: Enhanced inline code documentation
- **Consistent Architecture**: Both TypeScript and Python generators follow same modular pattern
- **Easier Extension**: New generator modules can be added more easily

### 🐛 Bug Fixes

- Fixed signature files not being written to disk
- Fixed TypeScript compilation errors for network names with special characters
- Fixed Python import errors for nested type references
- Fixed missing type definitions in signature generation
- Fixed forward reference handling in Python type models

### 🔄 Breaking Changes

- None - this release maintains full backward compatibility

### 📋 Migration Notes

- No migration required - existing configurations continue to work
- Generated SDKs will now include complete signature files
- Network names with hyphens will be properly quoted in TypeScript

---

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


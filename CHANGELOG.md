# abikit Changelog

## v0.2.5 - Automatic EIP-712 Signature Generation (2025-10-21)

### 🚀 New Features
- **Automatic ABI Extraction**: Extracts struct types from contract ABI files
- **Nested Struct Support**: Handles complex struct hierarchies automatically
- **Cross-Platform**: Works for both TypeScript and Python
- **Zero Maintenance**: No more manual struct type definitions

### 🔧 Technical Changes
- Added `StructExtractor` and `PythonStructExtractor` classes
- Enhanced signature generators with automatic type extraction
- Improved ABI processing for nested types
- Added comprehensive documentation and examples

### 🎯 Benefits
- Eliminates manual type definitions
- Automatic sync with contract changes
- Full type safety across all platforms
- Significantly improved developer experience

## v0.2.2 - Modular Generator Architecture (2025-10-18)

### 🚀 New Features
- **Modular Generators**: Split monolithic generators into focused modules
- **Complete SDKs**: Full TypeScript and Python SDK generation
- **Enhanced Configuration**: Better validation and artifact handling
- **Type Safety**: Improved type system with better interface support

### 🔧 Technical Changes
- Reorganized TypeScript and Python generators into focused modules
- Enhanced configuration system with better validation
- Improved CLI with better error handling and progress reporting
- Added modular generator factory pattern

### 📦 Generated SDKs
- **TypeScript**: Complete contract classes with viem integration
- **Python**: web3.py classes with Pydantic v2 models
- **Cross-Platform**: Consistent patterns across both languages

---

## v0.1.2 - Signature Generation Fixes (2025-10-16)

### 🚀 New Features
- **Modular Generators**: Split monolithic generators into focused modules
- **EIP-712 Signatures**: Fixed missing signature file generation
- **Type Safety**: Enhanced type system with proper forward references

### 🔧 Technical Fixes
- Fixed signature files not being written to disk
- Fixed TypeScript compilation errors for network names with special characters
- Fixed Python import errors for nested type references
- Added hardcoded type definitions for signature types

### 📦 Generated SDKs
- **TypeScript**: All signature files now generated with proper type definitions
- **Python**: Complete Pydantic models with proper forward references
- **Cross-Platform**: Consistent signature generation across both languages

---

## v0.1.0 - Initial Release (2025-10-03)

### 🚀 Core Features
- **Multi-Language SDKs**: Generate TypeScript (viem) and Python (web3.py) SDKs from Solidity artifacts
- **Foundry & Hardhat Support**: Works with both build systems
- **Config-Driven**: Simple YAML configuration for all options
- **CLI Tool**: Complete command-line interface with init, validate, build, list, and clean commands
- **Type-Safe**: Fully-typed contract wrappers with automatic struct and event type generation

### 📦 Installation
- **curl Installer**: `curl -L https://abikit.ahloop.com/install | bash`
- **npm Package**: `npm install -g abikit`
- **Updater**: Built-in `abikitup` command

### 🔧 CLI Commands
- `abikit init` - Scaffold contracts.yaml from artifacts
- `abikit validate` - Validate configuration
- `abikit build` - Generate SDKs for all targets
- `abikit list` - List available contracts
- `abikit clean` - Remove generated files

### 📚 Documentation
- Full documentation at https://abikit.ahloop.com
- Installation guide, CLI reference, configuration guide
- Example configurations and deployment guide


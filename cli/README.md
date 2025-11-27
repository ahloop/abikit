# abikit (CLI)

Generate multi-language SDKs (TypeScript, Python) from Solidity artifacts.

## Install

```bash
# Installer (recommended)
curl -L https://abikit.ahloop.com/install | bash

# Or via npm
yarn global add abikit  # or: npm install -g abikit
```

## Usage

```bash
abikit init       # scaffold contracts.yaml from artifacts
abikit validate   # validate configuration
abikit build      # generate SDKs
abikit cache stats    # show artifact cache statistics
abikit cache clear    # clear artifact cache
abikit list       # list available contracts
abikit clean      # remove generated files
```

## Features

- **Multi-language SDKs**: TypeScript (viem/ethers) and Python (web3.py)
- **Prepare Hooks**: Generate `prepare<FunctionName>()` methods for all write functions, returning transaction data (`{ to, data, value }`) for external signer integration (Privy, WalletConnect, etc.)
- **Artifact Caching**: Copy artifacts to local `artifacts/` folder for faster builds
- **Smart Resolution**: Per-contract artifact overrides and global defaults
- **Network Support**: Multi-network contract address management
- **EIP-712 Signatures**: Generate signature utilities for typed data
- **SDK Classes**: Unified SDK classes with lazy loading

Full docs:
- Getting Started: https://abikit.ahloop.com/getting-started
- Installation: https://abikit.ahloop.com/installation
- Configuration: https://abikit.ahloop.com/configuration
- CLI Reference: https://abikit.ahloop.com/cli-reference

## Development

```bash
yarn install
yarn build
node dist/cli.js --help
```

## License
MIT © 2025 ahloop


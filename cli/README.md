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
abikit list       # list available contracts
abikit clean      # remove generated files
```

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


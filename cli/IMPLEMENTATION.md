# Implementation Overview

abikit is a CLI that turns Solidity artifacts into multi-language SDKs.

- Config loader and JSON schema validation
- Artifact loaders for Foundry/Hardhat
- ABI normalizer → contract graph
- Generators: TypeScript (viem), Python (web3.py + Pydantic)

For the detailed architecture, see the website docs:
- Configuration: https://abikit.ahloop.com/configuration
- CLI Reference: https://abikit.ahloop.com/cli-reference
- Getting Started: https://abikit.ahloop.com/getting-started

## Development

```bash
yarn install
yarn build
node dist/cli.js --help
```


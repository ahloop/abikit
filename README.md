# abikit

Multi-language SDK generator for smart contracts. Generate strongly-typed TypeScript (viem) and Python (web3.py + Pydantic) SDKs from Solidity artifacts.

## Install

```bash
# Recommended (installer)
curl -L https://abikit.ahloop.com/install | bash

# Or via npm
yarn global add abikit  # or: npm install -g abikit
```

Verify:
```bash
abikit --help
```

## Quick start

```bash
# In your Foundry/Hardhat project
forge build                 # or: hardhat compile
abikit init                 # creates contracts.yaml
abikit validate             # validate config
abikit build                # generate SDKs
```

## Documentation
- Website: https://abikit.ahloop.com
- Getting Started: https://abikit.ahloop.com/getting-started
- Installation: https://abikit.ahloop.com/installation
- Configuration: https://abikit.ahloop.com/configuration
- CLI Reference: https://abikit.ahloop.com/cli-reference

## Why abikit
- Type-safe, multi-language SDKs from one source of truth (ABIs)
- Foundry and Hardhat artifact resolution (no manual copying)
- Clean, minimal config with sensible defaults

## License
MIT © 2025 ahloop


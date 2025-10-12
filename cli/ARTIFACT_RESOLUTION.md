# Artifact Resolution (Summary)

How abikit finds your contract artifacts.

## Resolution order
1. Per‑contract override (`contracts.<Name>.artifact`)
2. Global defaults (`artifactSources.defaults`)
3. Convention-based paths (Foundry/Hardhat)
4. Legacy `generation.artifactPaths` as fallback

## Minimal config
```yaml
artifactSources:
  defaults:
    foundryOut: ./out
    # hardhatOut: ./artifacts  # optional

contracts:
  ExternalContract:
    artifact:
      project: foundry
      outDir: ../../external-repo/out
      # file: contracts/External.sol/ExternalContract.json  # optional
```

## Full documentation
See the website for detailed guidance and examples:
- Artifact Sources & Resolution: https://abikit.ahloop.com/configuration
- CLI Reference: https://abikit.ahloop.com/cli-reference

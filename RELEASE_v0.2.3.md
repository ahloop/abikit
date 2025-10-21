# abikit v0.2.3 Release Notes

## 🚀 New Features

### Artifact Caching
- **Local Artifact Caching**: Copy artifacts to local `artifacts/` folder for faster builds
- **Cache Management Commands**: New `abikit cache stats` and `abikit cache clear` commands
- **Offline Development**: Work without access to original artifact sources
- **CI/CD Optimization**: Pre-cache artifacts for faster CI builds

### Enhanced Configuration
- **Artifact Caching Configuration**: New `artifactSources.cache` section in `contracts.yaml`
- **Cache Options**: `mode`, `dir`, and `copyOnBuild` settings for fine-grained control
- **Smart Caching**: Only copy artifacts when source changes (configurable)

## 🔧 Improvements

### CLI Enhancements
- **Cache Commands**: `abikit cache stats` and `abikit cache clear` for cache management
- **Better Error Messages**: More descriptive error messages for debugging
- **Improved Validation**: Enhanced configuration validation and error reporting

### Documentation
- **Comprehensive Cache Docs**: Complete guide to artifact caching feature
- **Updated CLI Reference**: New cache commands documentation
- **Enhanced Configuration Guide**: Artifact caching configuration examples
- **Best Practices**: Development workflow and CI/CD integration guides

## 🏗️ Technical Changes

### New Files
- `src/artifacts/cache-manager.ts` - Artifact cache management
- `examples/contracts-with-cache.yaml` - Caching configuration example
- `website/src/content/docs/artifact-caching.mdx` - Comprehensive caching documentation

### Updated Files
- `src/types/config.ts` - Added `copyOnBuild` to `ArtifactCache` interface
- `src/artifacts/loader.ts` - Integrated `ArtifactCacheManager`
- `src/cli.ts` - Added cache commands and build integration
- `examples/contracts.yaml` - Added caching configuration and documentation
- Website documentation - Updated all docs for v0.2.3

## 📦 Installation

```bash
# Update to latest version
abikitup

# Or install fresh
curl -L https://abikit.ahloop.com/install | bash
```

## 🔧 Usage

### Enable Artifact Caching

Add to your `contracts.yaml`:

```yaml
artifactSources:
  defaults:
    foundryOut: ./out
  
  cache:
    mode: copy          # Enable artifact copying
    dir: artifacts      # Cache directory (default: 'artifacts')
    copyOnBuild: false  # Only copy when artifacts change
```

### Cache Management

```bash
# Show cache statistics
abikit cache stats

# Clear artifact cache
abikit cache clear

# Build with caching
abikit build
```

## 🎯 Benefits

- **Faster Builds**: Cached artifacts load faster than scanning source directories
- **Offline Development**: Continue working without access to original artifact sources
- **Consistent Builds**: Ensure same artifacts across team members
- **CI/CD Optimization**: Significantly reduce build times in CI/CD pipelines

## 📚 Documentation

- [Artifact Caching Guide](https://abikit.ahloop.com/artifact-caching)
- [CLI Reference](https://abikit.ahloop.com/cli-reference)
- [Configuration Guide](https://abikit.ahloop.com/configuration)

## 🔗 Links

- **Website**: https://abikit.ahloop.com
- **GitHub**: https://github.com/ahloop/abikit
- **NPM**: https://www.npmjs.com/package/abikit

---

**Full Changelog**: https://github.com/ahloop/abikit/compare/v0.2.2...v0.2.3

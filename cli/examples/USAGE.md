# Usage Examples (Minimal)

See full examples on the website:
- Configuration: https://abikit.ahloop.com/configuration
- CLI Reference: https://abikit.ahloop.com/cli-reference

## Minimal Workflow

```bash
forge build            # or hardhat compile
abikit init            # create contracts.yaml
abikit build           # generate SDKs
```

## Minimal TypeScript usage

```ts
import { MyContract } from './sdk/typescript';

const contract = new MyContract({ address: '0x...' });
await contract.someMethod('arg');
```

## Minimal Python usage

```python
from sdk.python.contracts.my_contract import MyContract

c = MyContract(w3, '0x...')
res = c.some_method('arg')
```


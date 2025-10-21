# Deployment

This repository has two deployable parts:
- CLI (npm)
- Website (Vercel)

## CLI (npm)

```bash
cd cli/
yarn install
yarn build
npm publish
```

- Repository: https://github.com/ahloop/abikit
- Package: https://www.npmjs.com/package/abikit

## Website (Vercel)

- Root: `website`
- Build: `npm run build`
- Output: `.next`
- Domain: `abikit.ahloop.com`

Steps:
1. Push to `main` → Vercel auto-deploys
2. Ensure `website/public/install` and `website/public/abikitup` are present

## Scripts Hosting

- Install: `https://abikit.ahloop.com/install`
- Update: `https://abikit.ahloop.com/abikitup`

## CI/CD (optional)
- Use GitHub Actions to publish CLI and sync website scripts

For detailed setup guides, see provider documentation:
- Vercel: https://vercel.com/docs
- npm: https://docs.npmjs.com


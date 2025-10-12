# abikit Installer Scripts

This directory contains the installer and updater scripts for abikit.

## Files

- **install**: Main installer script (foundryup-style)
- **abikitup**: Updater script that installs latest abikit from npm

## Hosting

These scripts should be hosted at:

- `https://abikit.ahloop.com/install` → `install`
- `https://abikit.ahloop.com/abikitup` → `abikitup`

## Hosting Options

### Option 1: AWS S3 + CloudFront

```bash
# Upload scripts to S3
aws s3 cp install s3://abikit.ahloop.com/install --content-type "text/x-shellscript"
aws s3 cp abikitup s3://abikit.ahloop.com/abikitup --content-type "text/x-shellscript"

# Make them public
aws s3api put-object-acl --bucket abikit.ahloop.com --key install --acl public-read
aws s3api put-object-acl --bucket abikit.ahloop.com --key abikitup --acl public-read
```

### Option 2: Cloudflare Pages

1. Create a new Pages project
2. Create `_redirects` file:
```
/install  /scripts/install  200
/abikitup /scripts/abikitup 200
```
3. Deploy with scripts in `/scripts/` directory

### Option 3: Vercel

1. Create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/install", "destination": "/scripts/install" },
    { "source": "/abikitup", "destination": "/scripts/abikitup" }
  ]
}
```
2. Deploy project

### Option 4: GitHub Pages

1. Create a repo with scripts
2. Enable Pages on `main` branch
3. Configure custom domain `abikit.ahloop.com`

## Testing Locally

```bash
# Test install script locally
bash ./install

# Test updater script locally
bash ./abikitup
```

## Security

- Always serve over HTTPS
- Scripts use `set -eo pipefail` for safety
- No arbitrary code execution
- Checksums recommended for production

## Usage

Once hosted, users can install with:

```bash
curl -L https://abikit.ahloop.com/install | bash
```

And update with:

```bash
abikitup
```


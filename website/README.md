# abikit Website

Documentation website for abikit, built with Next.js and MDX.

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
website/
├── src/
│   ├── pages/
│   │   ├── index.tsx          # Home page
│   │   ├── [slug].tsx         # Dynamic docs pages
│   │   └── _app.tsx           # App wrapper
│   ├── components/
│   │   └── Layout.tsx         # Shared layout
│   ├── content/docs/          # MDX documentation files
│   │   ├── installation.mdx
│   │   ├── cli-reference.mdx
│   │   └── configuration.mdx
│   └── styles/
│       └── globals.css        # Global styles
├── public/
│   ├── install                # Installer script (served at /install)
│   └── abikitup               # Updater script (served at /abikitup)
├── next.config.js
├── package.json
└── tsconfig.json
```

## Adding Documentation

To add a new documentation page:

1. Create a new MDX file in `src/content/docs/`:

```mdx
---
title: My New Page
---

# My New Page

Content goes here...
```

2. The page will automatically be available at `/my-new-page`

3. Add a link to it in the navigation (in `src/components/Layout.tsx` and `src/pages/index.tsx`)

## Deployment

The site is deployed to Vercel and accessible at https://abikit.ahloop.com

### Automatic Deployment

Push to the `main` branch to trigger automatic deployment.

### Manual Deployment

```bash
npm run build
```

## Static Files

The `/install` and `/abikitup` scripts are served as static files from the `public/` directory. These are copied from the CLI project's `scripts/` directory.

To update them:

```bash
cp ../cli/scripts/install public/install
cp ../cli/scripts/abikitup public/abikitup
```

## Styling

The site uses CSS modules and global styles defined in `src/styles/globals.css`.

## MDX

Documentation pages use MDX, which allows you to use React components within Markdown:

- Automatic heading IDs (via `rehype-slug`)
- Automatic heading anchor links (via `rehype-autolink-headings`)
- Code syntax highlighting
- Front matter for metadata

## Maintenance with Cursor

To update docs:

1. Open the project in Cursor
2. Edit MDX files in `src/content/docs/`
3. Use AI prompts like: "Add a section about X to cli-reference.mdx"
4. Commit and push changes

The site will automatically redeploy.


const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
        rehypePlugins: [
            async () => (await import('rehype-slug')).default,
            async () => (await import('rehype-autolink-headings')).default,
        ],
    },
});

module.exports = withMDX({
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    reactStrictMode: true,
});


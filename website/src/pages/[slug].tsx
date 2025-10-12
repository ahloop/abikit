import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import Layout from '../components/Layout';
import Link from 'next/link';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

interface DocPageProps {
    frontMatter: {
        title: string;
        description?: string;
        prev?: {
            title: string;
            slug: string;
        };
        next?: {
            title: string;
            slug: string;
        };
    };
    mdxSource: MDXRemoteSerializeResult;
}

export async function getStaticPaths() {
    const docsDirectory = path.join(process.cwd(), 'src/content/docs');
    const files = fs.readdirSync(docsDirectory);

    const paths = files.map(filename => ({
        params: { slug: filename.replace('.mdx', '') }
    }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
    const docsDirectory = path.join(process.cwd(), 'src/content/docs');
    const filePath = path.join(docsDirectory, `${params.slug}.mdx`);

    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContents);

    const mdxSource = await serialize(content, {
        mdxOptions: {
            rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
        },
    });

    return {
        props: {
            frontMatter,
            mdxSource,
        },
    };
}

export default function DocPage({ frontMatter, mdxSource }: DocPageProps) {
    return (
        <Layout title={`${frontMatter.title} - abikit`}>
            <article>
                {frontMatter.description && (
                    <p className="text-lg text-gray-600 mb-8">{frontMatter.description}</p>
                )}
                <div className="prose prose-lg max-w-none">
                    <MDXRemote {...mdxSource} />
                </div>

                {/* Prev/Next Navigation */}
                {(frontMatter.prev || frontMatter.next) && (
                    <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between">
                        <div className="flex-1">
                            {frontMatter.prev && (
                                <Link href={`/${frontMatter.prev.slug}`} className="inline-block group">
                                    <div className="text-sm text-gray-500 mb-1">Previous</div>
                                    <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                                        ← {frontMatter.prev.title}
                                    </div>
                                </Link>
                            )}
                        </div>
                        <div className="flex-1 text-right">
                            {frontMatter.next && (
                                <Link href={`/${frontMatter.next.slug}`} className="inline-block group">
                                    <div className="text-sm text-gray-500 mb-1">Next</div>
                                    <div className="text-blue-600 group-hover:text-blue-800 font-medium">
                                        {frontMatter.next.title} →
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </article>
        </Layout>
    );
}


import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import DocsSidebar from './DocsSidebar';

export default function Layout({ children, title }: { children: React.ReactNode; title: string }) {
    const router = useRouter();
    const isDocsPage = router.pathname.startsWith('/') &&
        !router.pathname.includes('index') &&
        router.pathname !== '/' &&
        router.pathname !== '/_app';
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content="abikit - Multi-language SDK generator for smart contracts" />
                <link rel="icon" href="/favicon.ico" />
                <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" />
            </Head>
            <div className="min-h-screen bg-white">
                {/* Header */}
                <nav className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="flex justify-between items-center h-20">
                            <div className="nav-brand">
                                <Link href="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                                    abikit
                                </Link>
                            </div>
                            <div className="nav-links flex gap-8 items-center">
                                <Link href="/getting-started" className="text-gray-700 hover:text-gray-900 transition-colors">
                                    docs
                                </Link>
                                <a href="https://github.com/ahloop/abikit" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-gray-900 transition-colors" aria-label="GitHub Repository">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="min-h-screen">
                    {isDocsPage ? (
                        <div className="flex">
                            <DocsSidebar currentSlug={router.query.slug as string} />
                            <div className="flex-1 max-w-4xl mx-auto px-6 py-12">
                                {children}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto px-6 py-12">
                            {children}
                        </div>
                    )}
                </main>

                {/* Footer */}
                <footer className="footer-primary">
                    <div className="max-w-7xl mx-auto px-6 py-12">
                        <div className="text-center">
                            <p className="text-sm text-white">© 2025 ahloop. MIT License.</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}


import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

interface DocItem {
    title: string;
    slug: string;
    children?: DocItem[];
}

const docsStructure: DocItem[] = [
    {
        title: 'Getting Started',
        slug: 'getting-started'
    },
    {
        title: 'Installation',
        slug: 'installation',
        children: [
            {
                title: 'Install Script',
                slug: 'install-script'
            },
            {
                title: 'Update Script',
                slug: 'update-script'
            }
        ]
    },
    {
        title: 'Configuration',
        slug: 'configuration'
    },
    {
        title: 'EIP-712 Signatures',
        slug: 'signatures'
    },
    {
        title: 'Artifact Caching',
        slug: 'artifact-caching'
    },
    {
        title: 'CLI Reference',
        slug: 'cli-reference'
    }
];

interface DocsSidebarProps {
    currentSlug?: string;
}

export default function DocsSidebar({ currentSlug }: DocsSidebarProps) {
    const router = useRouter();
    const [expandedItems, setExpandedItems] = useState<string[]>(['installation']);

    const toggleExpanded = (slug: string) => {
        setExpandedItems(prev =>
            prev.includes(slug)
                ? prev.filter(item => item !== slug)
                : [...prev, slug]
        );
    };

    const isActive = (slug: string) => {
        return currentSlug === slug;
    };

    const isExpanded = (slug: string) => {
        return expandedItems.includes(slug);
    };

    const renderDocItem = (item: DocItem, level: number = 0) => {
        const hasChildren = item.children && item.children.length > 0;
        const active = isActive(item.slug);
        const expanded = isExpanded(item.slug);

        return (
            <div key={item.slug} className="mb-1">
                <div className="flex items-center">
                    {hasChildren && (
                        <button
                            onClick={() => toggleExpanded(item.slug)}
                            className="mr-2 p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label={expanded ? 'Collapse' : 'Expand'}
                        >
                            <svg
                                className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                    {!hasChildren && <div className="w-6" />}

                    <Link
                        href={`/${item.slug}`}
                        className={`block py-1 px-2 rounded text-sm transition-colors ${active
                            ? 'bg-blue-100 text-blue-900 font-medium'
                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        style={{ paddingLeft: `${level * 12 + 8}px` }}
                    >
                        {item.title}
                    </Link>
                </div>

                {hasChildren && expanded && (
                    <div className="ml-2">
                        {item.children!.map(child => renderDocItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-64 bg-gray-50 border-r border-gray-200 min-h-screen">
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Documentation</h2>
                <nav className="space-y-1">
                    {docsStructure.map(item => renderDocItem(item))}
                </nav>
            </div>
        </div>
    );
}




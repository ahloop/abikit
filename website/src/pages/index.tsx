import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
    const [version, setVersion] = useState('0.2.3');

    useEffect(() => {
        // Fetch latest version from npm
        fetch('https://registry.npmjs.org/abikit/latest')
            .then(res => res.json())
            .then(data => setVersion(data.version || '0.2.3'))
            .catch(() => setVersion('0.2.3'));
    }, []);

    return (
        <Layout title="abikit - Contract SDK Generator">
            {/* Hero Section */}
            <div className="text-center py-20">
                <h1 className="text-6xl font-bold text-gray-900 mb-6">abikit</h1>
                <p className="text-2xl text-gray-700 mb-4">multi-language sdk generator for smart contracts</p>
                <p className="text-lg text-gray-600 mb-12">current version: <strong>{version}</strong></p>
                <div className="flex gap-6 justify-center">
                    <Link href="/installation" className="btn-primary">
                        get started
                    </Link>
                    <a href="https://github.com/ahloop/abikit" className="btn-secondary" target="_blank" rel="noopener noreferrer">
                        view on github
                    </a>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-20">
                <h2 className="text-4xl font-bold text-gray-900 text-center mb-16">features</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="bg-gray-50 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">🔧 multi-language support</h3>
                        <p className="text-gray-700">generate typescript (viem-based) and python (web3.py + pydantic) sdks from a single source.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ type-safe</h3>
                        <p className="text-gray-700">fully-typed contract wrappers with automatic struct and event type generation.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 foundry & hardhat</h3>
                        <p className="text-gray-700">works seamlessly with foundry and hardhat build artifacts.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">🔌 plugin system</h3>
                        <p className="text-gray-700">extensible architecture for custom generators and features.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">📝 config-driven</h3>
                        <p className="text-gray-700">simple yaml configuration for all generation options.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 cli first</h3>
                        <p className="text-gray-700">easy-to-use command-line interface with foundryup-style installation.</p>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-2xl hover:transform hover:-translate-y-2 transition-all duration-300">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ artifact caching</h3>
                        <p className="text-gray-700">copy artifacts to local directory for faster builds and offline development.</p>
                    </div>
                </div>
            </section>

            {/* Quick Start Section */}
            <section className="py-20">
                <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">quick start</h2>
                <div className="max-w-4xl mx-auto">
                    <div className="bg-gray-900 rounded-2xl p-8">
                        <pre className="text-white overflow-x-auto">
                            <code className="text-white">
                                {`# install abikit
curl -L https://abikit.ahloop.com/install | bash

# initialize in your project
cd your-foundry-project
abikit init

# generate sdks
abikit build`}
                            </code>
                        </pre>
                    </div>
                </div>
            </section>

            {/* Documentation Links */}
            <section className="py-20">
                <h2 className="text-4xl font-bold text-gray-900 text-center mb-12">documentation</h2>
                <div className="max-w-2xl mx-auto">
                    <div className="space-y-4">
                        <Link href="/installation" className="block p-6 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">installation guide</h3>
                            <p className="text-gray-700">get started with abikit in minutes</p>
                        </Link>
                        <Link href="/cli-reference" className="block p-6 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">cli reference</h3>
                            <p className="text-gray-700">complete command reference and examples</p>
                        </Link>
                        <Link href="/configuration" className="block p-6 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">configuration</h3>
                            <p className="text-gray-700">configure your project for optimal sdk generation</p>
                        </Link>
                        <Link href="/artifact-caching" className="block p-6 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">artifact caching</h3>
                            <p className="text-gray-700">faster builds with local artifact caching</p>
                        </Link>
                        <a href="https://github.com/ahloop/abikit" target="_blank" rel="noopener noreferrer" className="block p-6 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">github repository</h3>
                            <p className="text-gray-700">source code, issues, and contributions</p>
                        </a>
                    </div>
                </div>
            </section>
        </Layout>
    );
}


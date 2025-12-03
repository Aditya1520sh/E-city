import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Key, Shield, Zap, Book, Terminal, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const FadeInSection = ({ children, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay }}
        >
            {children}
        </motion.div>
    );
};

const ApiAccess = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const endpoints = [
        {
            method: 'GET',
            path: '/api/issues',
            description: 'Retrieve all civic issues with pagination'
        },
        {
            method: 'POST',
            path: '/api/issues',
            description: 'Create a new issue report'
        },
        {
            method: 'GET',
            path: '/api/issues/:id',
            description: 'Get detailed information about a specific issue'
        },
        {
            method: 'PUT',
            path: '/api/issues/:id',
            description: 'Update issue status or details (Admin only)'
        }
    ];

    const features = [
        {
            icon: Key,
            title: 'API Key Authentication',
            description: 'Secure your API requests with personal access tokens',
            items: ['Generate unlimited API keys', 'Revoke keys anytime', 'Track usage per key']
        },
        {
            icon: Shield,
            title: 'Rate Limiting',
            description: 'Fair usage policies to ensure platform stability',
            items: ['1000 requests/hour', '10,000 requests/day', 'Burst protection enabled']
        },
        {
            icon: Zap,
            title: 'Real-time Webhooks',
            description: 'Get instant notifications for events you care about',
            items: ['Issue status updates', 'New comments', 'Resolution notifications']
        },
        {
            icon: Book,
            title: 'Comprehensive Docs',
            description: 'Detailed documentation with code examples',
            items: ['REST API reference', 'SDK libraries', 'Interactive playground']
        }
    ];

    const codeExample = `// Initialize E-City API Client
const ECity = require('@ecity/api-client');

const client = new ECity({
  apiKey: 'your_api_key_here',
  environment: 'production'
});

// Fetch all issues
const issues = await client.issues.list({
  status: 'open',
  limit: 10,
  page: 1
});

console.log(issues);`;

    const methodColors = {
        GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        POST: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        PUT: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
        DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                                <Terminal size={16} />
                                FOR DEVELOPERS
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                                API Access
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                                Build powerful integrations with E-City platform. Access civic data, automate workflows, and create innovative solutions for your community.
                            </p>
                        </div>
                    </FadeInSection>

                    {/* Code Example */}
                    <FadeInSection delay={0.1}>
                        <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 md:p-8 mb-16 shadow-2xl border border-slate-700 overflow-hidden">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                </div>
                                <span className="text-slate-400 text-sm ml-4">example.js</span>
                            </div>
                            <pre className="text-sm md:text-base text-green-400 font-mono overflow-x-auto">
                                <code>{codeExample}</code>
                            </pre>
                        </div>
                    </FadeInSection>

                    {/* API Endpoints */}
                    <FadeInSection delay={0.2}>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                            Available Endpoints
                        </h2>
                        <div className="grid gap-4 mb-16">
                            {endpoints.map((endpoint, index) => (
                                <div
                                    key={index}
                                    className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] group"
                                >
                                    <div className="flex items-center gap-4 flex-wrap">
                                        <span className={`px-3 py-1 rounded-lg text-sm font-bold ${methodColors[endpoint.method]}`}>
                                            {endpoint.method}
                                        </span>
                                        <code className="text-lg font-mono text-slate-700 dark:text-slate-300 flex-1">
                                            {endpoint.path}
                                        </code>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 mt-3">
                                        {endpoint.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </FadeInSection>

                    {/* Features Grid */}
                    <FadeInSection delay={0.3}>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
                            API Features
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6 mb-16">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group"
                                    >
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                                <Icon size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm">
                                                    {feature.description}
                                                </p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2 ml-2">
                                            {feature.items.map((item, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300 text-sm">
                                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </FadeInSection>

                    {/* CTA Section */}
                    <FadeInSection delay={0.4}>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 md:p-12 text-white text-center">
                            <h2 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Get Started?
                            </h2>
                            <p className="text-blue-100 mb-8 text-lg max-w-2xl mx-auto">
                                Sign up for a developer account to get your API keys and start building amazing applications.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    to="/login"
                                    className="bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2"
                                >
                                    <Key size={20} />
                                    Get API Keys
                                </Link>
                                <Link
                                    to="/documentation"
                                    className="bg-blue-700 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-800 transition-all transform hover:scale-105 inline-flex items-center justify-center gap-2 border-2 border-blue-500"
                                >
                                    <Book size={20} />
                                    View Documentation
                                </Link>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Important Notes */}
                    <FadeInSection delay={0.5}>
                        <div className="mt-12 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" size={24} />
                                <div>
                                    <h4 className="font-bold text-yellow-900 dark:text-yellow-100 mb-2">
                                        Important Note
                                    </h4>
                                    <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                        API access is currently in beta. Rate limits and endpoints may change. We'll notify all developers before any breaking changes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        </div>
    );
};

export default ApiAccess;

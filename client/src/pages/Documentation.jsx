import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, Video, HelpCircle, ArrowRight, CheckCircle, FileText, Users, Zap } from 'lucide-react';
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

const Documentation = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            icon: Book,
            title: 'Getting Started',
            description: 'Learn the basics of using E-City platform to report and track civic issues.',
            color: 'blue',
            items: [
                'Creating your account',
                'Setting up your profile',
                'Understanding the dashboard',
                'Navigation guide'
            ]
        },
        {
            icon: FileText,
            title: 'User Guide',
            description: 'Comprehensive guide to all features and functionalities of the platform.',
            color: 'green',
            items: [
                'Reporting an issue',
                'Tracking issue status',
                'Upvoting community issues',
                'Commenting and collaboration'
            ]
        },
        {
            icon: Video,
            title: 'Video Tutorials',
            description: 'Watch step-by-step video guides for common tasks and features.',
            color: 'purple',
            items: [
                'How to report your first issue',
                'Using the city map feature',
                'Managing notifications',
                'Community engagement tips'
            ]
        },
        {
            icon: HelpCircle,
            title: 'FAQs',
            description: 'Find quick answers to frequently asked questions.',
            color: 'orange',
            items: [
                'How long does issue resolution take?',
                'Can I report anonymously?',
                'How to contact support?',
                'Data privacy and security'
            ]
        }
    ];

    const quickLinks = [
        { title: 'Report First Issue', link: '/report', icon: Zap },
        { title: 'View City Map', link: '/map', icon: Users },
        { title: 'Join Community', link: '/events', icon: Users },
        { title: 'Contact Support', link: '/help', icon: HelpCircle }
    ];

    const colorSchemes = {
        blue: {
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            border: 'border-blue-200 dark:border-blue-800',
            hoverBorder: 'hover:border-blue-500 dark:hover:border-blue-400',
            text: 'text-blue-600 dark:text-blue-400',
            icon: 'bg-blue-100 dark:bg-blue-900/30'
        },
        green: {
            bg: 'bg-green-50 dark:bg-green-900/20',
            border: 'border-green-200 dark:border-green-800',
            hoverBorder: 'hover:border-green-500 dark:hover:border-green-400',
            text: 'text-green-600 dark:text-green-400',
            icon: 'bg-green-100 dark:bg-green-900/30'
        },
        purple: {
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            border: 'border-purple-200 dark:border-purple-800',
            hoverBorder: 'hover:border-purple-500 dark:hover:border-purple-400',
            text: 'text-purple-600 dark:text-purple-400',
            icon: 'bg-purple-100 dark:bg-purple-900/30'
        },
        orange: {
            bg: 'bg-orange-50 dark:bg-orange-900/20',
            border: 'border-orange-200 dark:border-orange-800',
            hoverBorder: 'hover:border-orange-500 dark:hover:border-orange-400',
            text: 'text-orange-600 dark:text-orange-400',
            icon: 'bg-orange-100 dark:bg-orange-900/30'
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <FadeInSection>
                        <div className="text-center mb-16">
                            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                                Documentation
                            </h1>
                            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
                                Everything you need to know to make the most of E-City platform and contribute to building a better city together.
                            </p>
                        </div>
                    </FadeInSection>

                    {/* Main Documentation Sections */}
                    <div className="grid md:grid-cols-2 gap-8 mb-16">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            const colors = colorSchemes[section.color];

                            return (
                                <FadeInSection key={index} delay={index * 0.1}>
                                    <div className={`bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-2 ${colors.border} ${colors.hoverBorder} transition-all duration-300 hover:shadow-xl hover:scale-[1.02] group`}>
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className={`${colors.icon} p-4 rounded-xl ${colors.text} group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                                    {section.title}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-300">
                                                    {section.description}
                                                </p>
                                            </div>
                                        </div>

                                        <ul className="space-y-3">
                                            {section.items.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                                                    <CheckCircle size={20} className={`${colors.text} flex-shrink-0 mt-0.5`} />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </FadeInSection>
                            );
                        })}
                    </div>

                    {/* Quick Links Section */}
                    <FadeInSection delay={0.4}>
                        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 md:p-12 text-white">
                            <h2 className="text-3xl font-bold mb-6 text-center">Quick Actions</h2>
                            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                                {quickLinks.map((link, index) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={index}
                                            to={link.link}
                                            className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/20 transition-all duration-300 hover:scale-105 group text-center border border-white/20"
                                        >
                                            <Icon size={32} className="mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                            <p className="font-semibold">{link.title}</p>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Need More Help Section */}
                    <FadeInSection delay={0.5}>
                        <div className="mt-16 text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                Still Need Help?
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-6">
                                Our support team is here to assist you with any questions or issues.
                            </p>
                            <Link
                                to="/help"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Contact Support <ArrowRight size={20} />
                            </Link>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        </div>
    );
};

export default Documentation;

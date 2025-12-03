import React, { useEffect } from 'react';
import { Shield, Eye, Lock, Users, FileText, Clock, CheckCircle } from 'lucide-react';
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

const PrivacyPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            icon: Eye,
            title: 'Information We Collect',
            content: [
                'Personal information (name, email, phone number) when you create an account',
                'Location data when you report issues',
                'Photos and descriptions you upload',
                'Usage data and analytics to improve our services',
                'Device information and IP addresses'
            ]
        },
        {
            icon: FileText,
            title: 'How We Use Your Information',
            content: [
                'To process and track civic issue reports',
                'To communicate updates about your reported issues',
                'To improve platform functionality and user experience',
                'To send important announcements and community updates',
                'To generate anonymous statistics for city planning'
            ]
        },
        {
            icon: Users,
            title: 'Information Sharing',
            content: [
                'Issue reports are shared with relevant city departments',
                'Public issues may be visible to other citizens',
                'We never sell your personal data to third parties',
                'Law enforcement access only with valid legal requests',
                'Anonymized data may be used for research purposes'
            ]
        },
        {
            icon: Lock,
            title: 'Data Security',
            content: [
                'Industry-standard encryption for data transmission',
                'Secure cloud storage with regular backups',
                'Two-factor authentication available',
                'Regular security audits and penetration testing',
                'Immediate notification of any data breaches'
            ]
        },
        {
            icon: CheckCircle,
            title: 'Your Rights',
            content: [
                'Access your personal data at any time',
                'Request data correction or deletion',
                'Opt-out of non-essential communications',
                'Download your data in portable format',
                'Lodge complaints with data protection authorities'
            ]
        },
        {
            icon: Shield,
            title: 'Cookies and Tracking',
            content: [
                'Essential cookies for platform functionality',
                'Analytics cookies to understand usage patterns',
                'Preference cookies to remember your settings',
                'You can disable non-essential cookies anytime',
                'Third-party cookies only from trusted partners'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 transition-colors duration-200">
            {/* Hero Section */}
            <section className="pt-32 pb-12 px-4">
                <div className="container mx-auto max-w-5xl">
                    <FadeInSection>
                        <div className="text-center mb-12">
                            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                                <Shield size={16} />
                                YOUR PRIVACY MATTERS
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                                Privacy Policy
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
                                We are committed to protecting your privacy and handling your data transparently. This policy explains how we collect, use, and safeguard your information.
                            </p>
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                                <Clock size={16} />
                                <span>Last updated: November 28, 2025</span>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Main Content */}
                    <div className="space-y-6">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            return (
                                <FadeInSection key={index} delay={index * 0.1}>
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] group">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-xl text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform flex-shrink-0">
                                                <Icon size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                                    {section.title}
                                                </h2>
                                                <ul className="space-y-3">
                                                    {section.content.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                                                            <CheckCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                                                            <span>{item}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </FadeInSection>
                            );
                        })}
                    </div>

                    {/* Contact Section */}
                    <FadeInSection delay={0.6}>
                        <div className="mt-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 text-white text-center">
                            <h3 className="text-2xl font-bold mb-4">
                                Questions About Your Privacy?
                            </h3>
                            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                If you have any questions or concerns about our privacy practices, please don't hesitate to contact our Data Protection Officer.
                            </p>
                            <a
                                href="mailto:privacy@ecity.gov.in"
                                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                            >
                                privacy@ecity.gov.in
                            </a>
                        </div>
                    </FadeInSection>

                    {/* Changes Notice */}
                    <FadeInSection delay={0.7}>
                        <div className="mt-8 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-6">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                                Changes to This Policy
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
                            </p>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        </div>
    );
};

export default PrivacyPolicy;

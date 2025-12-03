import React, { useEffect } from 'react';
import { Scale, AlertTriangle, FileCheck, ShieldAlert, Gavel, Clock, CheckCircle } from 'lucide-react';
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

const TermsOfService = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const sections = [
        {
            icon: FileCheck,
            title: 'Acceptance of Terms',
            content: [
                'By accessing E-City platform, you agree to these terms',
                'You must be 18 years or older to use our services',
                'You are responsible for maintaining account security',
                'One account per person policy',
                'Right to refuse service to anyone violating terms'
            ]
        },
        {
            icon: Scale,
            title: 'User Obligations',
            content: [
                'Provide accurate information when reporting issues',
                'Respect other users and government officials',
                'Use the platform only for legitimate civic purposes',
                'Not to spam or abuse the reporting system',
                'Keep your login credentials confidential'
            ]
        },
        {
            icon: AlertTriangle,
            title: 'Content Guidelines',
            content: [
                'Do not post offensive or discriminatory content',
                'No false or misleading information',
                'Respect intellectual property rights',
                'No advertisements or promotional content unless authorized',
                'We reserve the right to remove inappropriate content'
            ]
        },
        {
            icon: ShieldAlert,
            title: 'Prohibited Activities',
            content: [
                'Hacking or attempting to breach security measures',
                'Using automated bots or scrapers without permission',
                'Creating duplicate accounts to manipulate voting',
                'Harassing other users or government staff',
                'Sharing harmful or illegal content'
            ]
        },
        {
            icon: Gavel,
            title: 'Limitation of Liability',
            content: [
                'Platform provided "as is" without warranties',
                'Not liable for delays in issue resolution',
                'Not responsible for third-party content',
                'Liability limited to the maximum extent permitted by law',
                'Force majeure events excuse performance'
            ]
        },
        {
            icon: Scale,
            title: 'Dispute Resolution',
            content: [
                'Contact support first for any disputes',
                'Mediation before legal action preferred',
                'Governing law is applicable local jurisdiction',
                'Arbitration clause for eligible disputes',
                'Class action waiver applies'
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
                            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                                <Gavel size={16} />
                                LEGAL AGREEMENT
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
                                Terms of Service
                            </h1>
                            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-4">
                                Please read these terms carefully before using E-City platform. By using our services, you agree to be bound by these terms and conditions.
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
                                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border-2 border-slate-200 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-400 transition-all duration-300 hover:shadow-xl hover:scale-[1.01] group">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-xl text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform flex-shrink-0">
                                                <Icon size={28} />
                                            </div>
                                            <div className="flex-1">
                                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                                                    {section.title}
                                                </h2>
                                                <ul className="space-y-3">
                                                    {section.content.map((item, idx) => (
                                                        <li key={idx} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                                                            <CheckCircle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
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

                    {/* Termination Section */}
                    <FadeInSection delay={0.6}>
                        <div className="mt-12 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-8">
                            <div className="flex items-start gap-4">
                                <AlertTriangle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-1" size={32} />
                                <div>
                                    <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
                                        Account Termination
                                    </h3>
                                    <p className="text-red-800 dark:text-red-200 mb-4">
                                        We reserve the right to suspend or terminate your account at any time for violations of these terms, including but not limited to:
                                    </p>
                                    <ul className="space-y-2 text-red-700 dark:text-red-300">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>Repeated false reporting or spam</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>Harassment or abusive behavior</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>Attempting to compromise platform security</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1">•</span>
                                            <span>Violation of applicable laws or regulations</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </FadeInSection>

                    {/* Contact Section */}
                    <FadeInSection delay={0.7}>
                        <div className="mt-8 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl shadow-2xl p-8 text-white text-center">
                            <h3 className="text-2xl font-bold mb-4">
                                Questions About These Terms?
                            </h3>
                            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                                If you have any questions or concerns about our terms of service, please contact our legal team.
                            </p>
                            <a
                                href="mailto:legal@ecity.gov.in"
                                className="inline-block bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-lg"
                            >
                                legal@ecity.gov.in
                            </a>
                        </div>
                    </FadeInSection>

                    {/* Changes Notice */}
                    <FadeInSection delay={0.8}>
                        <div className="mt-8 bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-xl p-6">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">
                                Changes to These Terms
                            </h4>
                            <p className="text-slate-600 dark:text-slate-300 text-sm">
                                We may revise these terms from time to time. Continued use of the platform after changes constitutes acceptance of the modified terms. Material changes will be communicated via email or platform notification.
                            </p>
                        </div>
                    </FadeInSection>
                </div>
            </section>
        </div>
    );
};

export default TermsOfService;

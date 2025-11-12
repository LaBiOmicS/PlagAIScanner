import React, { useState } from 'react';
import { HelpCircleIcon, XIcon, SparklesIcon, ShieldCheckIcon, InfoIcon, BrainCircuitIcon, AlertTriangleIcon } from './icons';
import { translations, type Language } from '../lib/translations';

interface HelpSystemProps {
    language: Language;
}

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <React.Fragment>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="text-cyan-300 font-semibold">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </React.Fragment>
    );
};

export const HelpSystem: React.FC<HelpSystemProps> = ({ language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const t_help = translations[language].ui.help;
    const t_results = translations[language].ui.results;

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 hover:rotate-3 focus:outline-none focus:ring-4 focus:ring-cyan-500/50"
                aria-label={t_help.title}
            >
                <HelpCircleIcon className="w-8 h-8" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
                    <div 
                        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-2">
                                <HelpCircleIcon className="w-6 h-6 text-cyan-400" />
                                {t_help.title}
                            </h2>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">
                            
                            {/* Section: About */}
                            <section>
                                <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-3">
                                    <InfoIcon className="w-6 h-6 text-cyan-400" />
                                    {t_help.about.title}
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed pl-9">
                                    <MarkdownRenderer text={t_help.about.content} />
                                </p>
                            </section>

                            <hr className="border-gray-700/50" />

                            {/* Section: How to Use */}
                            <section>
                                <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-3">
                                     <span className="bg-cyan-900/50 text-cyan-300 border border-cyan-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                                    {t_help.howToUse.title}
                                </h3>
                                <ul className="space-y-3 ml-4 pl-8 border-l-2 border-gray-700">
                                    {t_help.howToUse.steps.map((step, idx) => (
                                        <li key={idx} className="flex gap-3 text-gray-300 text-sm leading-relaxed relative">
                                            <div className="absolute -left-[30px] top-1 w-4 h-4 bg-gray-700 rounded-full border-4 border-gray-800"></div>
                                            <p><MarkdownRenderer text={step} /></p>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                            
                            <hr className="border-gray-700/50" />

                            {/* Section: Interpreting Results */}
                            <section>
                                <h3 className="text-xl font-semibold text-gray-200 mb-4 flex items-center gap-3">
                                    <span className="bg-cyan-900/50 text-cyan-300 border border-cyan-700 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                                    {t_help.interpreting.title}
                                </h3>
                                <div className="grid md:grid-cols-2 gap-4 pl-9">
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center gap-2 mb-2 text-green-400 font-semibold">
                                            <ShieldCheckIcon className="w-5 h-5" />
                                            <span>{t_results.title}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            <MarkdownRenderer text={t_help.interpreting.plagiarism} />
                                        </p>
                                    </div>
                                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                                        <div className="flex items-center gap-2 mb-2 text-cyan-400 font-semibold">
                                            <SparklesIcon className="w-5 h-5" />
                                            <span>{t_results.aiDetection.title}</span>
                                        </div>
                                        <p className="text-sm text-gray-400 leading-relaxed">
                                            <MarkdownRenderer text={t_help.interpreting.ai} />
                                        </p>
                                    </div>
                                </div>
                            </section>

                             <hr className="border-gray-700/50" />

                            {/* Section: Advanced Config */}
                            <section>
                                <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-3">
                                    <BrainCircuitIcon className="w-6 h-6 text-cyan-400" />
                                    {t_help.advancedConfig.title}
                                </h3>
                                <p className="text-sm text-gray-400 mb-4 pl-9">{t_help.advancedConfig.description}</p>
                                <dl className="space-y-3 pl-9">
                                    {t_help.advancedConfig.sections.map((sec, i) => (
                                        <div key={i} className="bg-gray-900/40 p-3 rounded-md border border-gray-700/40">
                                            <dt className="font-semibold text-gray-200 text-sm">{sec.term}</dt>
                                            <dd className="text-gray-400 text-xs mt-1">{sec.definition}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </section>
                            
                             <hr className="border-gray-700/50" />

                            {/* Section: Limitations & License */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <section>
                                    <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-3">
                                        <AlertTriangleIcon className="w-6 h-6 text-yellow-400" />
                                        {t_help.limitations.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed pl-9">
                                        <MarkdownRenderer text={t_help.limitations.content} />
                                    </p>
                                </section>
                                <section>
                                    <h3 className="text-xl font-semibold text-gray-200 mb-3 flex items-center gap-3">
                                        <ShieldCheckIcon className="w-6 h-6 text-green-400" />
                                        {t_help.license.title}
                                    </h3>
                                    <p className="text-sm text-gray-400 leading-relaxed pl-9">
                                         <MarkdownRenderer text={t_help.license.content} />
                                    </p>
                                </section>
                            </div>


                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                {t_help.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
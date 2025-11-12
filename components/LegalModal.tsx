import React, { useState } from 'react';
import { ScaleIcon, XIcon } from './icons';
import { translations, type Language } from '../lib/translations';

interface LegalModalProps {
    language: Language;
}

type LegalTab = 'privacy' | 'terms' | 'cookies' | 'support';

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


export const LegalModal: React.FC<LegalModalProps> = ({ language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<LegalTab>('privacy');
    const t = translations[language].ui.legalModal;
    const LGPD_URL = 'http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm';
    const GITHUB_URL = 'https://github.com/LaBiOmicS/PlagAIScanner/issues';

    const renderContent = () => {
        switch (activeTab) {
            case 'privacy':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">{t.privacyPolicy.title}</h3>
                        <p className="text-xs text-gray-500 italic">{t.privacyPolicy.lastUpdated}</p>
                        {t.privacyPolicy.content.map((p, i) => (
                            <p key={i} className="text-sm text-gray-300 leading-relaxed"><MarkdownRenderer text={p} /></p>
                        ))}
                        <a href={LGPD_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm font-medium">
                            {t.privacyPolicy.lgpdLinkText}
                        </a>
                    </div>
                );
            case 'terms':
                 return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">{t.termsOfUse.title}</h3>
                        {t.termsOfUse.content.map((p, i) => (
                            <p key={i} className="text-sm text-gray-300 leading-relaxed"><MarkdownRenderer text={p} /></p>
                        ))}
                    </div>
                );
            case 'cookies':
                 return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">{t.cookiePolicy.title}</h3>
                        {t.cookiePolicy.content.map((p, i) => (
                           <p key={i} className="text-sm text-gray-300 leading-relaxed"><MarkdownRenderer text={p} /></p>
                        ))}
                    </div>
                );
            case 'support':
                 return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-200">{t.support.title}</h3>
                         {t.support.content.map((p, i) => (
                           <p key={i} className="text-sm text-gray-300 leading-relaxed"><MarkdownRenderer text={p} /></p>
                        ))}
                        <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline text-sm font-medium">
                            {t.support.githubLinkText}
                        </a>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{ tab: LegalTab, label: string }> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab 
                ? 'bg-cyan-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
        >
            {label}
        </button>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-6 z-40 bg-gray-600 hover:bg-gray-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                aria-label={t.buttonTooltip}
                title={t.buttonTooltip}
            >
                <ScaleIcon className="w-8 h-8" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <h2 className="text-xl font-bold text-gray-200 flex items-center gap-3">
                                <ScaleIcon className="w-6 h-6 text-gray-300" />
                                {t.title}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>
                        
                        <div className="p-3 border-b border-gray-700">
                             <div className="flex flex-wrap items-center gap-2">
                                <TabButton tab="privacy" label={t.tabs.privacy} />
                                <TabButton tab="terms" label={t.tabs.terms} />
                                <TabButton tab="cookies" label={t.tabs.cookies} />
                                <TabButton tab="support" label={t.tabs.support} />
                             </div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                           {renderContent()}
                        </div>

                        <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex justify-end">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="bg-gray-700 hover:bg-gray-600 text-white px-5 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                                {t.close}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
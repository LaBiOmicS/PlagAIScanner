import React, { useState } from 'react';
import { LicenseIcon, XIcon } from './icons';
import { translations, type Language } from '../lib/translations';

interface LicenseModalProps {
    language: Language;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({ language }) => {
    const [isOpen, setIsOpen] = useState(false);
    const t = translations[language].ui.licenseModal;

    return (
        <>
            {/* Floating Action Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-44 right-6 z-40 bg-gray-600 hover:bg-gray-500 text-white p-4 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gray-500/50"
                aria-label={t.buttonTooltip}
                title={t.buttonTooltip}
            >
                <LicenseIcon className="w-8 h-8" />
            </button>

            {/* Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setIsOpen(false)}>
                    <div
                        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                            <h2 className="text-xl font-bold text-gray-200 flex items-center gap-3">
                                <LicenseIcon className="w-6 h-6 text-gray-300" />
                                {t.title}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <pre className="text-sm text-gray-400 whitespace-pre-wrap font-mono">
                                {t.mitLicenseText}
                            </pre>
                        </div>

                        {/* Footer */}
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
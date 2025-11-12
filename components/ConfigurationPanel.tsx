import React from 'react';
import { translations, type Language, type ModelConfig } from '../lib/translations';
import { XIcon, BrainCircuitIcon } from './icons';

interface ConfigurationPanelProps {
    isOpen: boolean;
    onClose: () => void;
    config: ModelConfig;
    setConfig: (config: ModelConfig) => void;
    onReset: () => void;
    language: Language;
}

const Slider: React.FC<{
    label: string;
    value: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    step: number;
    minLabel: string;
    maxLabel: string;
}> = ({ label, value, onChange, min, max, step, minLabel, maxLabel }) => (
    <div>
        <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <span className="text-sm font-semibold text-cyan-300 bg-gray-700 px-2 py-0.5 rounded-md">{value}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{minLabel}</span>
            <span>{maxLabel}</span>
        </div>
    </div>
);

export const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
    isOpen,
    onClose,
    config,
    setConfig,
    onReset,
    language,
}) => {
    if (!isOpen) return null;

    const t = translations[language].ui.config;

    const handleChange = (field: keyof ModelConfig, value: string | number) => {
        setConfig({ ...config, [field]: value });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
            <div
                className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/50">
                    <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center gap-3">
                        <BrainCircuitIcon className="w-6 h-6 text-cyan-400" />
                        {t.title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded-full"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                    <p className="text-sm text-gray-400 -mt-2">{t.description}</p>
                    
                    {/* Behavior & Context */}
                    <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-200">{t.behavior.title}</h3>
                        <div>
                            <label htmlFor="persona-input" className="block text-sm font-medium text-gray-300">{t.behavior.persona.label}</label>
                            <p className="text-xs text-gray-500 mb-2">{t.behavior.persona.description}</p>
                            <textarea
                                id="persona-input"
                                rows={4}
                                value={config.persona}
                                onChange={(e) => handleChange('persona', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label htmlFor="context-input" className="block text-sm font-medium text-gray-300">{t.behavior.context.label}</label>
                            <p className="text-xs text-gray-500 mb-2">{t.behavior.context.description}</p>
                            <textarea
                                id="context-input"
                                rows={2}
                                value={config.context}
                                onChange={(e) => handleChange('context', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                            />
                        </div>
                    </div>

                    {/* Learning Memory */}
                    <div className="space-y-2 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-200">{t.memory.title}</h3>
                        <div>
                            <p className="text-xs text-gray-500 mb-2">{t.memory.description}</p>
                            <textarea
                                id="memory-input"
                                rows={3}
                                value={config.memory}
                                onChange={(e) => handleChange('memory', e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                            />
                        </div>
                    </div>
                    
                    {/* Model Parameters */}
                    <div className="space-y-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-200">{t.parameters.title}</h3>
                        <Slider
                            label={t.parameters.temperature.label}
                            value={config.temperature}
                            onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                            min={0.0}
                            max={2.0}
                            step={0.1}
                            minLabel={t.parameters.temperature.precise}
                            maxLabel={t.parameters.temperature.creative}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300">{t.parameters.topK.label}</label>
                                <p className="text-xs text-gray-500 mb-2">{t.parameters.topK.description}</p>
                                <input
                                    type="number"
                                    value={config.topK}
                                    onChange={(e) => handleChange('topK', parseInt(e.target.value, 10))}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                                />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-300">{t.parameters.topP.label}</label>
                                <p className="text-xs text-gray-500 mb-2">{t.parameters.topP.description}</p>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={config.topP}
                                    onChange={(e) => handleChange('topP', parseFloat(e.target.value))}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                                />
                            </div>
                        </div>
                         <p className="text-xs text-gray-500 pt-2 border-t border-gray-700/50">{t.parameters.description}</p>
                    </div>

                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-800/50 flex justify-between items-center">
                     <button
                        onClick={onReset}
                        className="bg-red-900/70 hover:bg-red-800/70 text-red-300 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        {t.reset}
                    </button>
                    <button
                        onClick={onClose}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded-lg transition-colors text-sm font-bold"
                    >
                        {t.close}
                    </button>
                </div>
            </div>
        </div>
    );
};

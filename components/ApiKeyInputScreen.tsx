
import React, { useState } from 'react';
import { validateApiKey } from '../services/geminiService';
import { KeyIcon, LoaderIcon, AlertTriangleIcon, ShieldCheckIcon } from './icons';
import { translations, type Language } from '../lib/translations';

interface ApiKeyInputScreenProps {
  onKeyValidated: (key: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageSelector: React.FC<{ language: Language, setLanguage: (lang: Language) => void }> = ({ language, setLanguage }) => {
    const languages: { key: Language, name: string }[] = [
        { key: 'pt', name: 'Português' },
        { key: 'en', name: 'English' },
        { key: 'es', name: 'Español' },
    ];

    return (
        <div className="flex justify-center items-center gap-2 mb-8">
            {languages.map(lang => (
                <button
                    key={lang.key}
                    onClick={() => setLanguage(lang.key)}
                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                        language === lang.key 
                        ? 'bg-cyan-500 text-white font-semibold' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

export const ApiKeyInputScreen: React.FC<ApiKeyInputScreenProps> = ({ onKeyValidated, language, setLanguage }) => {
  const [inputKey, setInputKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const t = translations[language].ui;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKey) {
      setError(t['error.apiKeyRequired']);
      return;
    }

    setIsLoading(true);
    setError(null);

    const isValid = await validateApiKey(inputKey);

    setIsLoading(false);

    if (isValid) {
      onKeyValidated(inputKey);
    } else {
      setError(t['error.invalidApiKeyConnection']);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
        <main className="flex-grow flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700">
                <LanguageSelector language={language} setLanguage={setLanguage} />
                
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <ShieldCheckIcon className="w-8 h-8 text-cyan-400" />
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            {t.appName}
                        </h1>
                    </div>
                    <p className="text-gray-400">{t.apiKeyScreen.subtitle}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">
                    {t.apiKeyScreen.label}
                    </label>
                    <div className="relative">
                    <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <input
                        id="api-key-input"
                        type="password"
                        value={inputKey}
                        onChange={(e) => setInputKey(e.target.value)}
                        placeholder={t.apiKeyScreen.placeholder}
                        className="w-full bg-gray-900 border border-gray-600 rounded-lg py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                        disabled={isLoading}
                    />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {t.apiKeyScreen.helperText.part1}{' '}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                            {t.apiKeyScreen.helperText.link}
                        </a>
                        {t.apiKeyScreen.helperText.part2}
                    </p>
                </div>
                
                {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded-lg flex items-center gap-2 text-sm">
                        <AlertTriangleIcon className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !inputKey}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2"
                >
                    {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : <KeyIcon className="h-5 w-5" />}
                    <span>{isLoading ? t.apiKeyScreen.button.validating : t.apiKeyScreen.button.saveAndStart}</span>
                </button>
                </form>
            </div>
        </main>
        <footer className="w-full text-center p-4 border-t border-gray-800">
            <p className="text-xs text-gray-500 max-w-4xl mx-auto">
                {t.footer}
            </p>
        </footer>
    </div>
  );
};

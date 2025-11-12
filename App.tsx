import React, { useState, useEffect } from 'react';
import { ApiKeyInputScreen } from './components/ApiKeyInputScreen';
import { PlagiarismChecker } from './components/PlagiarismChecker';
import { HelpSystem } from './components/HelpSystem';
import { LicenseModal } from './components/LicenseModal';
import { LegalModal } from './components/LegalModal';
import { type Language } from './lib/translations';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isKeyValidated, setIsKeyValidated] = useState<boolean>(false);
  const [isEnvKey, setIsEnvKey] = useState<boolean>(false);
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    // Verifica se a chave de API é fornecida pelo ambiente (ex: AI Studio)
    const envApiKey = process.env.API_KEY;
    if (envApiKey) {
      setApiKey(envApiKey);
      setIsKeyValidated(true);
      setIsEnvKey(true);
    }
  }, []);

  const handleKeyValidated = (validatedKey: string) => {
    setApiKey(validatedKey);
    setIsKeyValidated(true);
  };

  return (
    <>
        {(!isKeyValidated || !apiKey) ? (
            <ApiKeyInputScreen onKeyValidated={handleKeyValidated} language={language} setLanguage={setLanguage} />
        ) : (
            <PlagiarismChecker apiKey={apiKey} isEnvKey={isEnvKey} language={language} setLanguage={setLanguage} />
        )}
        <LegalModal language={language} />
        <HelpSystem language={language} />
        <LicenseModal language={language} />
    </>
  );
};

export default App;
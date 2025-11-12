import React, { useState, useCallback, useRef, useEffect } from 'react';
import { runAnalysis, type PlagiarismAnalysisResult, type AiAnalysisResult } from '../services/geminiService';
import { parseFile } from '../services/fileParser';
import { type GroundingChunk } from '../types';
import { SearchIcon, LoaderIcon, AlertTriangleIcon, LinkIcon, UploadCloudIcon, XIcon, ShieldCheckIcon, DownloadIcon, SparklesIcon, BrainCircuitIcon } from './icons';
import { translations, type Language, type ModelConfig } from '../lib/translations';
import { ConfigurationPanel } from './ConfigurationPanel';

// These are loaded from script tags in index.html
declare const jspdf: any;

const MAX_WORDS = 1500;

const countWords = (text: string) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

interface PlagiarismCheckerProps {
  apiKey: string;
  isEnvKey: boolean;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const getDefaultConfig = (language: Language): ModelConfig => {
    const t_config = translations[language].ui.config;
    return {
        persona: t_config.behavior.persona.default,
        context: t_config.behavior.context.default,
        memory: t_config.memory.default,
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
    };
};


const LanguageSelector: React.FC<{ language: Language, setLanguage: (lang: Language) => void, disabled: boolean }> = ({ language, setLanguage, disabled }) => {
    const languages: { key: Language, name: string }[] = [
        { key: 'pt', name: 'Português' },
        { key: 'en', name: 'English' },
        { key: 'es', name: 'Español' },
    ];

    return (
        <div className="flex items-center gap-2">
            {languages.map(lang => (
                <button
                    key={lang.key}
                    onClick={() => setLanguage(lang.key)}
                    disabled={disabled}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                        language === lang.key 
                        ? 'bg-cyan-500 text-white font-semibold' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {lang.name}
                </button>
            ))}
        </div>
    );
};

export const PlagiarismChecker: React.FC<PlagiarismCheckerProps> = ({ apiKey, isEnvKey, language, setLanguage }) => {
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingTitle, setLoadingTitle] = useState('');
  const [loadingSubtitle, setLoadingSubtitle] = useState('');
  const [result, setResult] = useState<{ plagiarismResult: PlagiarismAnalysisResult; aiResult: AiAnalysisResult; sources: GroundingChunk[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [model, setModel] = useState<'gemini-2.5-flash' | 'gemini-2.5-pro'>('gemini-2.5-flash');
  const [config, setConfig] = useState<ModelConfig>(getDefaultConfig(language));
  
  const t = translations[language].ui;
  const t_err = t.errors;

  useEffect(() => {
    setWordCount(countWords(inputText));
  }, [inputText]);

  // Reset config when language changes
  useEffect(() => {
    setConfig(getDefaultConfig(language));
  }, [language]);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setLoadingTitle(t.loading.processingFile);
    setLoadingSubtitle(t.loading.extractingText);
    setError(null);
    setResult(null);
    setFileName(file.name);

    try {
      const text = await parseFile(file);
      setInputText(text);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message.startsWith('error.unsupportedFileType:')) {
            const ext = err.message.split(':')[1];
            setError(t_err.unsupportedFileType.replace('{ext}', ext || ''));
        } else if (err.message === 'error.unsupportedDoc') {
            setError(t_err.unsupportedDoc);
        } else {
            setError(t_err.processingFile);
        }
      } else {
        setError(t_err.processingFile);
      }
      setFileName(null);
      setInputText('');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleClear = () => {
    setInputText('');
    setResult(null);
    setError(null);
    setFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleCheckPlagiarism = useCallback(async () => {
    if (!inputText.trim()) {
      setError(t_err.textRequired);
      return;
    }
    
    if (!fileName && wordCount > MAX_WORDS) {
        setError(t_err.wordLimitExceeded.replace('{maxWords}', MAX_WORDS.toString()));
        return;
    }

    setIsLoading(true);
    setLoadingTitle(t.loading.analyzingText);
    setLoadingSubtitle(t.loading.comparingText);
    setError(null);
    setResult(null);

    try {
      const analysisResponse = await runAnalysis(inputText, apiKey, language, model, config);
      if (!analysisResponse.plagiarismResult || !analysisResponse.aiResult) {
        throw new Error(t_err.apiFail);
      }
      setResult(analysisResponse);
    } catch (err) {
      if (err instanceof Error) {
        const errorMessageKey = err.message as keyof typeof t_err;
        if (t_err[errorMessageKey]) {
            setError(t_err[errorMessageKey]);
        } else {
            setError(err.message);
        }
      } else {
        setError(t_err.unknown);
      }
    } finally {
      setIsLoading(false);
    }
  }, [inputText, wordCount, fileName, apiKey, language, t, t_err, model, config]);

  return (
    <>
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col">
      <header className="bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 p-4 border-b border-gray-700">
        <div className="container mx-auto max-w-4xl flex justify-between items-center">
          <div className="flex items-center gap-3">
              <ShieldCheckIcon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
              <h1 className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                {t.appName}
              </h1>
          </div>
          <div className="flex items-center gap-4">
             {isEnvKey && (
                <div className="hidden sm:flex items-center gap-2 bg-green-900/50 text-green-300 text-xs px-3 py-1 rounded-full border border-green-700" title={t.envKeyTooltip}>
                <ShieldCheckIcon className="h-4 w-4" />
                <span>{t.envKeySet}</span>
                </div>
             )}
            <button
                onClick={() => setIsConfigOpen(true)}
                disabled={isLoading}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={t.config.title}
            >
                <BrainCircuitIcon className="w-5 h-5" />
            </button>
            <LanguageSelector language={language} setLanguage={setLanguage} disabled={isLoading}/>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto max-w-4xl p-4 flex-grow flex flex-col">
          <div className="flex flex-col gap-6 flex-grow">
            
            {!result && !isLoading && (
              <>
                {!inputText && !fileName && (
                    <div className="w-full bg-gray-800 p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in">
                      <div className="space-y-4 text-center">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-2">{t.welcome.title}</h2>
                        <p className="text-gray-300">
                          {t.welcome.description}
                        </p>
                        <p className="text-sm text-gray-400">
                            {isEnvKey 
                              ? t.welcome.helperText.envKey
                              : t.welcome.helperText.noEnvKey
                            }
                        </p>
                      </div>
                    </div>
                )}
                
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2">
                    <label htmlFor="text-input" className="block text-sm font-medium text-gray-400">
                      {t.mainScreen.inputLabel}
                    </label>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept=".pdf,.docx,.odt"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                        <UploadCloudIcon className="h-4 w-4" />
                        {t.mainScreen.uploadButton}
                    </button>
                  </div>
                  <div className="relative">
                    <textarea
                      id="text-input"
                      rows={12}
                      value={inputText}
                      onChange={(e) => {
                          setInputText(e.target.value)
                          if(fileName) setFileName(null);
                      }}
                      placeholder={t.mainScreen.placeholder}
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg p-3 text-base resize-y focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                    />
                    {inputText && (
                        <button onClick={handleClear} className="absolute top-2.5 right-2.5 text-gray-500 hover:text-gray-300 transition-colors" aria-label={t.mainScreen.clearButton}>
                            <XIcon className="h-5 w-5" />
                        </button>
                     )}
                  </div>
                   <div className="flex justify-between items-center mt-2 text-sm px-1">
                        <div className="text-gray-400 text-xs">
                            {fileName && <span className="truncate max-w-[200px] sm:max-w-xs" title={fileName}>{t.mainScreen.fileLabel} {fileName}</span>}
                        </div>
                        <div className="text-right">
                            {fileName ? (
                                <>
                                    <span className="text-gray-400 font-medium">{wordCount} {t.mainScreen.words}</span>
                                    <p className="text-xs text-gray-500">{t.mainScreen.wordLimitDisclaimer.replace('{maxWords}', MAX_WORDS.toString())}</p>
                                </>
                            ) : (
                                <span className={`font-medium ${wordCount > MAX_WORDS ? 'text-red-400' : 'text-gray-400'}`}>
                                    {wordCount} / {MAX_WORDS} {t.mainScreen.words}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
                    <h3 className="text-base font-semibold text-gray-300">{t.config.model.label}</h3>
                    <div className="flex flex-col sm:flex-row gap-2">
                        <ModelCard 
                            title={t.config.model.flash.title}
                            description={t.config.model.flash.description}
                            isSelected={model === 'gemini-2.5-flash'}
                            onClick={() => setModel('gemini-2.5-flash')}
                        />
                         <ModelCard 
                            title={t.config.model.pro.title}
                            description={t.config.model.pro.description}
                            isSelected={model === 'gemini-2.5-pro'}
                            onClick={() => setModel('gemini-2.5-pro')}
                        />
                    </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg flex items-center gap-3">
                <AlertTriangleIcon className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
            
            {isLoading && <LoadingState title={loadingTitle} subtitle={loadingSubtitle} />}
            
            {result && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-700">
                         <h2 className="text-2xl font-bold text-gray-200">{t.results.reportTitle}</h2>
                         <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                                onClick={handleClear}
                                className="flex-grow sm:flex-grow-0 flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors"
                            >
                                <SearchIcon className="h-4 w-4" />
                                <span>{t.results.newAnalysisButton}</span>
                            </button>
                            <button
                                onClick={() => handleExportPdf(result, inputText)}
                                className="flex-shrink-0 flex items-center justify-center gap-2 text-sm bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md transition-colors"
                            >
                                <DownloadIcon className="h-4 w-4" />
                                <span>{t.results.exportPdfButton}</span>
                            </button>
                         </div>
                    </div>
                    <PlagiarismResultDisplay 
                        result={result.plagiarismResult} 
                        sources={result.sources}
                        originalText={inputText}
                        t={t}
                    />
                    <AiDetectionResultDisplay result={result.aiResult} t={t} />
                </div>
            )}


            <div className={`sticky bottom-0 bg-gray-900 py-4 mt-auto ${result ? 'hidden' : 'block'}`}>
                 <button
                    onClick={handleCheckPlagiarism}
                    disabled={isLoading || !inputText.trim() || (!fileName && wordCount > MAX_WORDS)}
                    className="w-full md:w-auto md:float-right bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2 text-lg shadow-lg"
                 >
                    {isLoading ? <LoaderIcon className="animate-spin h-5 w-5" /> : <SearchIcon className="h-5 w-5" />}
                    <span>{isLoading ? t.mainScreen.actionButton.loading : t.mainScreen.actionButton.default}</span>
                </button>
            </div>
          </div>
      </main>
      <footer className="w-full text-center p-4 border-t border-gray-800">
        <p className="text-xs text-gray-500 max-w-4xl mx-auto">
            {t.footer}
        </p>
      </footer>
    </div>
    <ConfigurationPanel 
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        setConfig={setConfig}
        onReset={() => setConfig(getDefaultConfig(language))}
        language={language}
    />
    </>
  );
};

const ModelCard: React.FC<{title: string, description: string, isSelected: boolean, onClick: () => void}> = ({ title, description, isSelected, onClick }) => (
    <div
        onClick={onClick}
        className={`flex-1 p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
            isSelected 
                ? 'border-cyan-500 bg-cyan-900/30 ring-2 ring-cyan-500' 
                : 'border-gray-600 bg-gray-900/50 hover:border-gray-500'
        }`}
    >
        <h4 className={`font-semibold ${isSelected ? 'text-cyan-300' : 'text-gray-200'}`}>{title}</h4>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
);

interface FullResult {
    plagiarismResult: PlagiarismAnalysisResult;
    aiResult: AiAnalysisResult;
    sources: GroundingChunk[];
}

const handleExportPdf = (result: FullResult, originalText: string) => {
    const { plagiarismResult, aiResult, sources } = result;
    const { jsPDF } = jspdf;
    const doc = new jsPDF();

    // This needs to be coordinated with the active language
    const lang = document.documentElement.lang || 'en';
    const t = translations[lang as Language].ui.results;

    const FONT_SIZE_TITLE = 18;
    const FONT_SIZE_SUBTITLE = 14;
    const FONT_SIZE_BODY = 11;
    const MARGIN = 15;
    const PAGE_WIDTH = doc.internal.pageSize.getWidth();
    const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
    const MAX_WIDTH = PAGE_WIDTH - MARGIN * 2;
    let y = MARGIN;

    const checkPageBreak = (spaceNeeded: number) => {
        if (y + spaceNeeded > PAGE_HEIGHT - MARGIN) {
            doc.addPage();
            y = MARGIN;
        }
    };

    // Main Title
    doc.setFontSize(FONT_SIZE_TITLE);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdfReportTitle, PAGE_WIDTH / 2, y, { align: 'center' });
    y += 15;

    // --- Plagiarism Section ---
    doc.setFontSize(FONT_SIZE_SUBTITLE);
    doc.text(t.title, MARGIN, y);
    y += 10;
    
    // Score and Assessment
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdfScore, MARGIN, y);
    const getScoreColor = (s: number) => {
        if (s > 60) return [239, 68, 68]; // red-500
        if (s > 30) return [250, 204, 21]; // yellow-500
        return [34, 197, 94]; // green-500
    };
    const scoreColor = getScoreColor(plagiarismResult.score);
    doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    doc.text(`${plagiarismResult.score}%`, MARGIN + 50, y);
    doc.setTextColor(0, 0, 0);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text(t.pdfAssessment, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    const assessmentLines = doc.splitTextToSize(plagiarismResult.assessment, MAX_WIDTH - 50);
    doc.text(assessmentLines, MARGIN + 50, y);
    y += assessmentLines.length * 5 + 5;
    
    // Analysis
    doc.setFont('helvetica', 'bold');
    doc.text(t.pdfAnalysis, MARGIN, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const plainAnalysis = plagiarismResult.analysis.replace(/\*\*/g, '');
    const analysisLines = doc.splitTextToSize(plainAnalysis, MAX_WIDTH);
    checkPageBreak(analysisLines.length * 5);
    doc.text(analysisLines, MARGIN, y);
    y += analysisLines.length * 5 + 10;
    
    // --- AI Detection Section ---
    checkPageBreak(40);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 10;

    doc.setFontSize(FONT_SIZE_SUBTITLE);
    doc.setFont('helvetica', 'bold');
    doc.text(t.aiDetection.pdfAiReportTitle, MARGIN, y);
    y += 10;
    
    doc.setFontSize(FONT_SIZE_BODY);
    doc.setFont('helvetica', 'bold');
    doc.text(t.aiDetection.pdfAiScore, MARGIN, y);
    const aiScoreColor = getScoreColor(aiResult.score);
    doc.setTextColor(aiScoreColor[0], aiScoreColor[1], aiScoreColor[2]);
    doc.text(`${aiResult.score}%`, MARGIN + 50, y);
    doc.setTextColor(0, 0, 0);
    y += 7;

    doc.setFont('helvetica', 'bold');
    doc.text(t.aiDetection.pdfAiAssessment, MARGIN, y);
    doc.setFont('helvetica', 'normal');
    const aiAssessmentLines = doc.splitTextToSize(aiResult.assessment, MAX_WIDTH - 50);
    doc.text(aiAssessmentLines, MARGIN + 50, y);
    y += aiAssessmentLines.length * 5 + 5;
    
    // AI Analysis
    doc.setFont('helvetica', 'bold');
    doc.text(t.aiDetection.pdfAiAnalysis, MARGIN, y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    const plainAiAnalysis = aiResult.analysis.replace(/\*\*/g, '');
    const aiAnalysisLines = doc.splitTextToSize(plainAiAnalysis, MAX_WIDTH);
    checkPageBreak(aiAnalysisLines.length * 5);
    doc.text(aiAnalysisLines, MARGIN, y);
    y += aiAnalysisLines.length * 5 + 10;

    // --- Sources Section ---
    if (sources.length > 0) {
        checkPageBreak(30);
        doc.setLineWidth(0.5);
        doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
        y += 10;

        doc.setFontSize(FONT_SIZE_SUBTITLE);
        doc.setFont('helvetica', 'bold');
        doc.text(t.pdfSources, MARGIN, y);
        y += 7;

        doc.setFontSize(FONT_SIZE_BODY);
        doc.setFont('helvetica', 'normal');
        sources.forEach(source => {
            if (source.web) {
                checkPageBreak(12);
                doc.setTextColor(0, 0, 255);
                const sourceLines = doc.splitTextToSize(source.web.title || source.web.uri, MAX_WIDTH);
                doc.textWithLink(sourceLines[0], MARGIN, y, { url: source.web.uri });
                if (sourceLines.length > 1) {
                  doc.text(sourceLines.slice(1), MARGIN, y + 5);
                  y += (sourceLines.length -1) * 5;
                }
                doc.setTextColor(0, 0, 0);
                y += 6;
            }
        });
    }

    doc.save('analysis-report.pdf');
};


interface LoadingStateProps {
    title: string;
    subtitle: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({ title, subtitle }) => (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 flex flex-col items-center justify-center text-center gap-4">
        <LoaderIcon className="h-8 w-8 animate-spin text-cyan-400" />
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-gray-400">{subtitle}</p>
    </div>
);

const ScoreCircle: React.FC<{ score: number; scoreType?: 'plagiarism' | 'ai' }> = ({ score, scoreType = 'plagiarism' }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s: number) => {
        if (s > 60) return 'stroke-red-500';
        if (s > 30) return 'stroke-yellow-500';
        return scoreType === 'plagiarism' ? 'stroke-green-500' : 'stroke-cyan-500';
    };
    
    const getTextColor = (s: number) => {
        if (s > 60) return 'text-red-400';
        if (s > 30) return 'text-yellow-400';
        return scoreType === 'plagiarism' ? 'text-green-400' : 'text-cyan-400';
    };

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                <circle
                    className="text-gray-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`${getColor(score)} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
            </svg>
            <span className={`absolute text-4xl font-bold ${getTextColor(score)}`}>
                {score}%
            </span>
        </div>
    );
};

const MarkdownRenderer: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
        <React.Fragment>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index}>{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </React.Fragment>
    );
};

const TextWithHighlights: React.FC<{ text: string; segments: string[] }> = ({ text, segments }) => {
    if (!segments || segments.length === 0) {
      return <p className="whitespace-pre-wrap">{text}</p>;
    }
  
    const escapeRegExp = (str: string) => {
      return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    };
  
    const sortedSegments = [...segments].sort((a, b) => b.length - a.length);
    const pattern = sortedSegments.map(escapeRegExp).join('|');
    const regex = new RegExp(`(${pattern})`, 'gi');
  
    const parts = text.split(regex);
  
    return (
      <p className="whitespace-pre-wrap">
        {parts.map((part, index) => {
          const isMatch = sortedSegments.some(segment => part.toLowerCase() === segment.toLowerCase());
          return isMatch ? (
            <mark key={index} className="bg-yellow-500/40 text-yellow-100 rounded px-1 py-0.5">
              {part}
            </mark>
          ) : (
            <React.Fragment key={index}>{part}</React.Fragment>
          );
        })}
      </p>
    );
  };


interface PlagiarismResultDisplayProps {
  result: PlagiarismAnalysisResult;
  sources: GroundingChunk[];
  originalText: string;
  t: any;
}

const PlagiarismResultDisplay: React.FC<PlagiarismResultDisplayProps> = ({ result, sources, originalText, t }) => {
    const t_results = t.results;
    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <ScoreCircle score={result.score} />
                <div className="flex-1 w-full">
                    <div className="flex-1 text-center sm:text-left">
                        <h2 className="text-2xl font-bold text-cyan-400 mb-1">{t_results.title}</h2>
                        <p className="text-lg font-medium text-gray-300">{result.assessment.replace('error.assessmentFailed', t.errors.assessmentFailed)}</p>
                        <p className="text-sm text-gray-400 mt-1">
                            {t_results.scoreDescription}
                        </p>
                    </div>
                </div>
            </div>

            {result.plagiarizedSegments.length > 0 && (
                <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-gray-300">{t_results.highlightedSegmentsTitle}</h3>
                    <div className="prose prose-invert prose-p:text-gray-300 max-h-60 overflow-y-auto pr-2">
                        <TextWithHighlights text={originalText} segments={result.plagiarizedSegments} />
                    </div>
                </div>
            )}
            
            <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-gray-300">{t_results.analysisTitle}</h3>
                <div className="prose prose-invert prose-p:text-gray-300 prose-strong:text-white whitespace-pre-wrap">
                    <MarkdownRenderer text={result.analysis} />
                </div>
            </div>

            {sources.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-gray-300">
                        <LinkIcon className="h-5 w-5" />
                        {t_results.sourcesTitle}
                    </h3>
                    <ul className="space-y-2">
                        {sources.map((source, index) => (
                            source.web && (
                                <li key={index} className="bg-gray-900/50 p-3 rounded-md border border-gray-700 hover:bg-gray-700/50 transition-colors">
                                    <a
                                        href={source.web.uri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-cyan-400 hover:text-cyan-300 hover:underline break-all"
                                    >
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            )
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface AiDetectionResultDisplayProps {
    result: AiAnalysisResult;
    t: any;
}

const AiDetectionResultDisplay: React.FC<AiDetectionResultDisplayProps> = ({ result, t }) => {
    const t_ai = t.results.aiDetection;
    return (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 space-y-6">
            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                <ScoreCircle score={result.score} scoreType="ai" />
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-cyan-400 mb-1">{t_ai.title}</h2>
                    <p className="text-lg font-medium text-gray-300">{result.assessment.replace('error.assessmentFailed', t.errors.assessmentFailed)}</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {t_ai.scoreDescription}
                    </p>
                </div>
            </div>
            
            {result.suggestions && result.suggestions.length > 0 && (
                <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
                    <h3 className="text-lg font-semibold mb-3 text-gray-300 flex items-center gap-2">
                        <SparklesIcon className="h-5 w-5 text-cyan-400" />
                        {t_ai.humanizingSuggestionsTitle}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">{t_ai.humanizingSuggestionsDescription}</p>
                    <ul className="space-y-3 pl-2">
                        {result.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-300 text-sm">
                                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0" />
                                <span>{suggestion}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="bg-gray-900/50 p-4 rounded-md border border-gray-700">
                <h3 className="text-lg font-semibold mb-3 text-gray-300 flex items-center gap-2">
                    <SparklesIcon className="h-5 w-5" />
                    {t_ai.analysisTitle}
                </h3>
                <div className="prose prose-invert prose-p:text-gray-300 prose-strong:text-white whitespace-pre-wrap">
                    <MarkdownRenderer text={result.analysis} />
                </div>
            </div>
        </div>
    );
}
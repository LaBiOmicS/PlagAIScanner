export type Language = 'pt' | 'en' | 'es';

export interface ModelConfig {
    persona: string;
    context: string;
    memory: string;
    temperature: number;
    topK: number;
    topP: number;
}


const createPrompt = (lang: string, plagiarismKeys: any, aiKeys: any) => `
Você é o "PlagAI Scanner", uma ferramenta especialista em integridade acadêmica e detecção de IA. Sua tarefa é realizar três análises profundas no texto fornecido: (1) detecção de plágio, (2) extração de segmentos plagiados, (3) detecção de conteúdo gerado por IA, e (4) fornecer sugestões de melhoria. Você DEVE responder INTEIRAMENTE no idioma: ${lang}.

--- INÍCIO DAS INSTRUÇÕES ---

**TAREFA 1.A: ANÁLISE DE PLÁGIO (CRÍTICA)**

*   **FERRAMENTA OBRIGATÓRIA:** O uso da tool \`googleSearch\` é **OBRIGATÓRIO** e deve ser extensivo. **NÃO** gere uma resposta de plágio baseada apenas em seu conhecimento interno. Você deve buscar ativamente para confirmar ou descartar a originalidade.
*   **PROTOCOLO de BUSCA (Siga rigorosamente):**
    1.  **Impressão Digital (Fingerprinting):** Selecione de 3 a 5 frases longas e específicas de diferentes partes do texto (início, desenvolvimento, conclusão) e busque-as exatamente entre aspas.
    2.  **Conceitos Específicos:** Busque por combinações de palavras-chave ou sequências de palavras raras presentes no texto.
*   **AVALIAÇÃO DE RESULTADOS:**
    *   **Encontrado na Web:** Se o texto (ou partes significativas dele) for encontrado online em correspondências exatas (verbatim), isso é **PLÁGIO**.
    *   **Critério de Pontuação:** A pontuação de plágio DEVE refletir a quantidade de texto COPIADO VERBATIM de fontes externas. NÃO penalize por ideias ou estruturas similares se o texto for original. 100% (cópia integral), 60-99% (parágrafos inteiros), 20-59% (frases esparsas), 0% (nenhuma correspondência verbatim).
    *   **Atenção:** É inaceitável dar 0% se o texto for uma cópia da internet. Na dúvida, faça mais buscas.
*   **Formato de Saída (Plágio):** Use o formato ESTRITO abaixo, dentro dos marcadores.
    
[PLAGIARISM_ANALYSIS_START]
${plagiarismKeys.scoreKey}: [Um número de 0 a 100]
${plagiarismKeys.assessmentKey}: [Um resumo de uma frase]
---
Análise Detalhada:
[Siga ESTRITAMENTE estas 4 etapas:
1.  **Justificativa da Pontuação:** Explique CLARAMENTE por que deu essa pontuação, citando o que foi encontrado (ou não encontrado).
2.  **Fontes Detectadas:** Mencione genericamente onde o conteúdo foi encontrado (ex: "Encontrado em múltiplos sites acadêmicos").
3.  **Aviso de Precisão:** Adicione um aviso informando que a ferramenta é um auxílio.
4.  **Ações Recomendadas:** Sugira ações claras (ex: "Reescrever o conteúdo", "Adicionar citações").]
[PLAGIARISM_ANALYSIS_END]

**TAREFA 1.B: EXTRAÇÃO DE SEGMENTOS (OBRIGATÓRIO)**

*   Se a pontuação de plágio for > 0, você DEVE extrair os trechos exatos do texto do usuário que correspondem às fontes online.
*   **Formato de Saída (Segmentos):** Use o formato ESTRITO abaixo. Separe CADA segmento com o delimitador '|||'. NÃO use quebras de linha.

[PLAGIARIZED_SEGMENTS_START]
${plagiarismKeys.plagiarizedSegmentsKey}: [segmento 1 exato do texto do usuário]|||[outro segmento exato]|||[e assim por diante]
[PLAGIARIZED_SEGMENTS_END]

**TAREFA 2: ANÁLISE DE CONTEÚDO GERADO POR IA**

*   **Objetivo:** Avaliar a probabilidade de o texto ter sido escrito por um modelo de linguagem de IA.
*   **Critérios:** Analise a **diversidade lexical** (uso repetitivo de palavras), a **"burstiness"** (variação no comprimento e estrutura das frases) e a presença de uma **voz autoral/pessoal**. Compare com padrões de LLMs (repetição de conectivos, falta de profundidade pessoal).
*   **Pontuação:** Probabilidade de ser gerado por IA (0 = humano, 100 = IA).
*   **Formato de Saída (IA):** Use o formato ESTRITO abaixo.

[AI_ANALYSIS_START]
${aiKeys.aiScoreKey}: [Um número de 0 a 100]
${aiKeys.aiAssessmentKey}: [Um resumo de uma frase]
---
Análise Detalhada da IA:
[Siga ESTRITAMENTE estas 3 etapas:
1.  **Justificativa da Pontuação:** Explique os fatores linguísticos que levaram à conclusão (ex: "O texto apresenta baixa 'burstiness' com sentenças de estrutura similar...").
2.  **Aviso de Precisão:** Adicione um aviso de que esta é uma análise probabilística.
3.  **Recomendação:** Sugira que o resultado seja usado como um indicador para revisão humana.]
[AI_ANALYSIS_END]

**TAREFA 3: SUGESTÕES DE HUMANIZAÇÃO (Se Score de IA > 50)**

*   Se a pontuação de IA for maior que 50, forneça de 2 a 3 sugestões práticas e acionáveis para "humanizar" o texto.
*   **Formato de Saída (Sugrestões):** Use o formato ESTRITO abaixo. Separe CADA sugestão com o delimitador '|||'. NÃO use quebras de linha. Se não houver sugestões, deixe a seção em branco.

[HUMANIZING_SUGGESTIONS_START]
${aiKeys.humanizingSuggestionsKey}: [sugestão 1]|||[sugestão 2]|||[sugestão 3]
[HUMANIZING_SUGGESTIONS_END]

--- FIM DAS INSTRUÇÕES ---

Agora, analise o seguinte texto:
---
`;

const translationsConfig = {
    pt: {
      lang: 'Português do Brasil',
      plagiarismKeys: { scoreKey: "Pontuação de Plágio", assessmentKey: "Avaliação Geral", plagiarizedSegmentsKey: "Segmentos Plagiados" },
      aiKeys: { aiScoreKey: "Pontuação de Geração por IA", aiAssessmentKey: "Avaliação de IA", humanizingSuggestionsKey: "Sugestões para Humanizar" }
    },
    en: {
      lang: 'English',
      plagiarismKeys: { scoreKey: "Plagiarism Score", assessmentKey: "Overall Assessment", plagiarizedSegmentsKey: "Plagiarized Segments" },
      aiKeys: { aiScoreKey: "AI-Generated Score", aiAssessmentKey: "AI Assessment", humanizingSuggestionsKey: "Humanizing Suggestions" }
    },
    es: {
      lang: 'Español',
      plagiarismKeys: { scoreKey: "Puntuación de Plagio", assessmentKey: "Evaluación General", plagiarizedSegmentsKey: "Segmentos Plagiados" },
      aiKeys: { aiScoreKey: "Puntuación de Generación por IA", aiAssessmentKey: "Evaluación de IA", humanizingSuggestionsKey: "Sugerencias para Humanizar" }
    }
};

const mitLicenseText = `Copyright (c) 2025 Laboratório de Bioinformática e de Ciências Ômicas (LaBiOmicS)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export const translations = {
  pt: {
    ui: {
      appName: "PlagAI Scanner",
      envKeySet: "Chave de API configurada",
      envKeyTooltip: "A chave de API está sendo fornecida automaticamente pelo ambiente.",
      apiKeyScreen: {
        subtitle: "Para começar, insira sua chave de API do Google AI Studio.",
        label: "Chave de API do Gemini",
        placeholder: "Cole sua chave de API aqui",
        helperText: {
          part1: "Você pode criar sua chave gratuitamente no",
          link: "Google AI Studio",
          part2: ".",
        },
        button: {
          validating: "Validando...",
          saveAndStart: "Salvar e Iniciar",
        },
      },
      welcome: {
        title: "Bem-vindo ao PlagAI Scanner",
        description: "Garanta que seu trabalho seja verdadeiramente original. O PlagAI Scanner, potencializado pelo Gemini do Google, realiza uma análise dupla e profunda: ele vasculha meticulosamente a web em busca de plágio e avalia o estilo de escrita para detectar conteúdo gerado por IA. Vá além de simples verificações e ganhe a confiança de que seu texto é autêntico, crível e pronto para impressionar.",
        helperText: {
          envKey: "A chave de API é fornecida automaticamente. Basta colar seu texto ou carregar um arquivo para começar.",
          noEnvKey: "Basta colar seu texto ou carregar um arquivo para começar."
        }
      },
      mainScreen: {
        inputLabel: "Cole o texto ou carregue um arquivo",
        uploadButton: "Carregar Documento",
        placeholder: "Cole o texto aqui ou carregue um arquivo (.pdf, .docx, .odt)",
        clearButton: "Limpar texto",
        fileLabel: "Arquivo:",
        words: "palavras",
        wordLimitDisclaimer: "Limite p/ digitação: {maxWords} palavras",
        actionButton: {
          default: "Analisar Texto",
          loading: "Analisando...",
        }
      },
      loading: {
          processingFile: "Processando arquivo...",
          extractingText: "Extraindo o texto do seu documento.",
          analyzingText: "Varrendo a Web...",
          comparingText: "A IA está buscando fontes e analisando padrões. Isso pode levar alguns segundos.",
      },
      results: {
          reportTitle: "Relatório de Análise",
          title: "Análise de Plágio",
          scoreDescription: "Este score representa a porcentagem de similaridade do texto com fontes online.",
          analysisTitle: "Análise Detalhada",
          sourcesTitle: "Fontes Encontradas",
          highlightedSegmentsTitle: "Segmentos com Similaridade Encontrada",
          exportPdfButton: "Exportar PDF",
          newAnalysisButton: "Nova Análise",
          pdfReportTitle: "Relatório PlagAI Scanner",
          pdfScore: "Pontuação de Plágio",
          pdfAssessment: "Avaliação Geral",
          pdfAnalysis: "Análise Detalhada",
          pdfSources: "Fontes Encontradas",
          aiDetection: {
              title: "Análise de Texto Gerado por IA",
              scoreDescription: "Este score representa a probabilidade de o texto ter sido gerado por uma IA.",
              analysisTitle: "Análise Detalhada da IA",
              humanizingSuggestionsTitle: "Sugestões para Melhorar",
              humanizingSuggestionsDescription: "A IA identificou algumas maneiras de tornar seu texto mais natural e envolvente:",
              pdfAiReportTitle: "Análise de Conteúdo Gerado por IA",
              pdfAiScore: "Pontuação de Geração por IA",
              pdfAiAssessment: "Avaliação de IA",
              pdfAiAnalysis: "Análise Detalhada da IA",
          }
      },
      config: {
        title: "Gestão do Cérebro da IA",
        description: "Configure o comportamento, memória e parâmetros do modelo Gemini.",
        model: {
            label: "Modelo de Inteligência Artificial",
            flash: {
                title: "Gemini 2.5 Flash (Padrão)",
                description: "Modelo rápido e eficiente (low-latency). Ideal para resumos gerais e tarefas ágeis."
            },
            pro: {
                title: "Gemini 2.5 Pro (Reasoning Model)",
                description: "Modelo avançado com capacidade de raciocínio profundo (Thinking). Melhor para análises complexas. Pode ser mais lento."
            }
        },
        behavior: {
            title: "Comportamento & Contexto",
            persona: {
                label: "Identidade (Persona)",
                description: "Define quem a IA 'é' e seu tom de voz.",
                default: "Você é um especialista meticuloso em integridade acadêmica. Sua expertise abrange linguística forense, detecção de plágio e identificação de padrões em textos gerados por IA. Seu tom é objetivo, analítico e educacional, com o objetivo de ajudar os usuários a melhorar a originalidade de seus trabalhos."
            },
            context: {
                label: "Contexto Global",
                description: "Fatos que a IA deve considerar em todas as análises.",
                default: "O objetivo principal é realizar uma dupla análise no texto enviado pelo usuário. Primeiro, conduza buscas extensivas na web para encontrar correspondências literais (verbatim) de plágio. Segundo, analise características linguísticas (como diversidade lexical, estrutura de sentenças e 'burstiness') para avaliar a probabilidade de geração por IA. A análise deve ser imparcial e baseada em evidências das buscas e do próprio texto."
            }
        },
        memory: {
            title: "Memória de Aprendizado (Instruções Acumuladas)",
            label: "Instruções Acumuladas",
            description: "Regras que a IA 'aprendeu' com seu feedback. Você pode editar manualmente.",
            default: "Instruções geradas via feedback aparecerão aqui..."
        },
        parameters: {
            title: "Parâmetros do Modelo",
            description: "Nota: Estes parâmetros afetam como a IA escolhe as próximas palavras. Ajuste a Temperatura para controlar a 'alucinação' vs 'criatividade'. Valores baixos (0.1 - 0.5) são melhores para análises factuais.",
            temperature: {
                label: "Temperatura",
                description: "Balanceado",
                precise: "Preciso",
                creative: "Criativo",
            },
            topK: {
                label: "Top K",
                description: "Tamanho do pool de tokens."
            },
            topP: {
                label: "Top P",
                description: "Probabilidade cumulativa."
            }
        },
        reset: "Redefinir Cérebro da IA (Padrão de Fábrica)",
        close: "Fechar Configurações"
      },
      errors: {
        'error.apiKeyRequired': 'Por favor, insira uma chave de API.',
        'error.invalidApiKeyConnection': 'A chave de API é inválida ou ocorreu um erro. Verifique a chave e sua conexão.',
        unsupportedDoc: "Arquivos .doc não são suportados. Por favor, salve como .docx ou .pdf.",
        unsupportedFileType: "Tipo de arquivo não suportado: .{ext}",
        processingFile: "Ocorreu um erro ao processar o arquivo.",
        textRequired: "Por favor, insira o texto a ser verificado.",
        wordLimitExceeded: "O texto inserido manualmente excede o limite de {maxWords} palavras.",
        assessmentFailed: "Não foi possível determinar a avaliação.",
        invalidApiKey: "A chave de API fornecida é inválida ou expirou. Por favor, verifique sua chave e tente novamente.",
        apiFail: "Falha ao obter resposta da API. A resposta pode estar mal formatada ou a API indisponível. Tente novamente.",
        unknown: "Ocorreu um erro desconhecido.",
      },
      footer: "Desenvolvido pelo Laboratório de Bioinformática e de Ciências Ômicas (LaBiOmicS) vinculado ao Núcleo de Pesquisas Tecnológicas (NPT) e ao Núcleo Integrado de Biotecnologia (NIB) da Universidade de Mogi das Cruzes (UMC).",
      help: {
        title: "Guia Completo do PlagAI Scanner",
        about: {
            title: "Sobre a Ferramenta",
            content: "O **PlagAI Scanner** é uma ferramenta de auxílio à integridade acadêmica e à escrita. Utilizando o poder da IA generativa do Google Gemini, ela realiza uma dupla verificação: busca por plágio literal em fontes online e analisa as características linguísticas do texto para estimar a probabilidade de ter sido gerado por uma IA. O objetivo é fornecer insights para que pesquisadores, estudantes e escritores possam garantir a originalidade e a qualidade de seus trabalhos."
        },
        howToUse: {
            title: "Como Usar o Scanner",
            steps: [
                "**1. Insira o Texto:** Cole seu texto na área designada ou carregue um arquivo nos formatos .pdf, .docx ou .odt.",
                "**2. Escolha o Modelo:** Selecione 'Gemini 2.5 Flash' para análises rápidas ou 'Gemini 2.5 Pro' para uma análise mais profunda e contextual, ideal para textos complexos (pode ser mais lento).",
                "**3. (Opcional) Configure a IA:** Clique no ícone do 'Cérebro' para ajustar a persona, o contexto e os parâmetros técnicos do modelo, adaptando a análise ao seu caso de uso específico.",
                "**4. Inicie a Análise:** Clique em 'Analisar Texto'. A IA fará uma varredura na web e analisará os padrões de escrita.",
                "**5. Revise os Resultados:** Explore os scores, veja os trechos com similaridade destacados e as fontes encontradas. Use as sugestões para aprimorar seu texto."
            ]
        },
        interpreting: {
            title: "Interpretando os Resultados",
            plagiarism: "**Score de Plágio:** Mede a porcentagem do texto que corresponde **exatamente (verbatim)** a conteúdo encontrado em fontes públicas online. Um score alto indica cópia literal. O sistema destaca esses trechos para facilitar a revisão e a citação correta. **Um score de 0% significa que nenhuma cópia literal foi detectada nas buscas.**",
            ai: "**Score de IA:** Estima a probabilidade de o texto ter sido escrito por uma IA, com base em padrões como uniformidade excessiva e falta de variação no estilo. **Isto não é plágio.** Um score alto apenas sugere que a escrita pode parecer 'robótica' e se beneficiar das sugestões para soar mais natural e autêntica."
        },
        advancedConfig: {
            title: "Configuração Avançada (Cérebro da IA)",
            description: "Esta seção permite que você controle com precisão como a IA se comporta durante a análise.",
            sections: [
                { term: "Persona", definition: "Define o 'papel' que a IA deve assumir (ex: um pesquisador PhD, um revisor casual). Isso afeta o tom e o foco da análise textual." },
                { term: "Contexto Global", definition: "Fornece à IA informações de base que ela deve considerar como verdadeiras em todas as análises. Útil para jargões específicos de um campo de estudo." },
                { term: "Temperatura", definition: "Controla a criatividade. Valores baixos (próximos a 0.0) tornam a IA mais precisa e factual. Valores altos (próximos a 2.0) a tornam mais criativa, mas também mais propensa a 'alucinações'." },
                { term: "Top K / Top P", definition: "Parâmetros técnicos que filtram as próximas palavras que a IA pode escolher, ajustando o quão focada ou diversificada será a resposta." }
            ]
        },
        limitations: {
            title: "Limitações, Vieses e Ética",
            content: "**Esta ferramenta é um auxílio, não um árbitro final.** A decisão sobre plágio ou autoria requer julgamento humano. **Escopo da Busca:** A detecção de plágio se limita a conteúdo publicamente indexado pelo Google. Artigos atrás de paywalls, livros não digitalizados ou conteúdo privado não serão detectados. **Precisão da IA:** A detecção de IA é probabilística e pode gerar falsos positivos/negativos, especialmente em textos muito técnicos ou criativos. **Privacidade:** Seu texto é processado para análise e não é armazenado ou usado para treinar modelos."
        },
        license: {
            title: "Código Aberto e Licença",
            content: "O PlagAI Scanner é um software de código aberto, distribuído sob a **Licença MIT**. Isso significa que você tem a liberdade de usar, modificar e distribuir o software, desde que os devidos créditos sejam mantidos. Incentivamos a colaboração e a auditoria do código pela comunidade."
        },
        close: "Fechar Guia"
      },
      licenseModal: {
        title: "Licença MIT",
        buttonTooltip: "Ver Licença de Uso",
        mitLicenseText: mitLicenseText,
        close: "Fechar",
      },
      legalModal: {
        title: "Informações Legais e Privacidade",
        buttonTooltip: "Ver Informações Legais",
        close: "Fechar",
        tabs: {
            privacy: "Privacidade",
            terms: "Termos de Uso",
            cookies: "Cookies",
            support: "Suporte",
        },
        privacyPolicy: {
            title: "Política de Privacidade",
            lastUpdated: "Última atualização: 24 de julho de 2024",
            content: [
                "**1. Coleta de Dados:** O PlagAI Scanner processa dois tipos de dados: (a) a **Chave de API do Gemini** que você fornece e (b) o **conteúdo textual** que você insere para análise. A chave de API é usada exclusivamente para autenticar as solicitações à API do Google Gemini e não é armazenada por nós.",
                "**2. Uso dos Dados:** O texto que você envia é usado unicamente para realizar a análise de plágio e detecção de IA solicitada. **Nós não armazenamos, compartilhamos ou utilizamos seu texto para treinar modelos de IA.** A interação ocorre diretamente entre seu navegador e a API do Google, sujeita às políticas de privacidade do Google.",
                "**3. Conformidade com a LGPD:** Estamos comprometidos com a Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018). Seus dados são tratados com a finalidade específica de fornecer o serviço desta ferramenta. Você tem o direito de saber como seus dados são usados e de que eles não serão retidos. Para mais informações, consulte a legislação oficial.",
                "**4. Segurança:** Sua chave de API é armazenada localmente no seu navegador durante a sessão de uso e/ou fornecida pelo ambiente seguro (como o AI Studio) e é transmitida de forma segura (HTTPS) para a API do Google.",
            ],
            lgpdLinkText: "Consultar a LGPD na íntegra",
        },
        termsOfUse: {
            title: "Termos de Uso",
            content: [
                "**1. Propósito da Ferramenta:** O PlagAI Scanner é uma ferramenta de auxílio destinada a apoiar a integridade acadêmica e a escrita original. Os resultados fornecidos são baseados em algoritmos de IA e buscas na web, e devem ser considerados como um suporte à decisão humana, não como um veredito final.",
                "**2. Responsabilidade do Usuário:** Você é responsável pelo conteúdo que analisa e por garantir que possui os direitos necessários sobre o texto. O uso da sua Chave de API do Google Gemini está sujeito aos termos de serviço do Google.",
                "**3. Limitações:** A detecção de plágio está limitada a fontes publicamente acessíveis e indexadas pelo Google. A detecção de IA é uma estimativa probabilística e não deve ser a única base para julgamento sobre a autoria de um texto.",
                "**4. Isenção de Garantia:** A ferramenta é fornecida 'como está', sob a Licença MIT, sem garantias de qualquer tipo. Os desenvolvedores não se responsabilizam por quaisquer imprecisões nos resultados ou decisões tomadas com base neles.",
            ]
        },
        cookiePolicy: {
            title: "Política de Cookies",
            content: [
                "O PlagAI Scanner, como aplicação autônoma, **não utiliza cookies** para rastrear usuários ou armazenar informações pessoais.",
                "Se você estiver executando esta ferramenta dentro de um ambiente de terceiros, como o Google AI Studio ou outras plataformas, esses ambientes podem utilizar seus próprios cookies. Recomendamos que você consulte as políticas de cookies da plataforma que está utilizando.",
            ]
        },
        support: {
            title: "Suporte e Contato",
            content: [
                "O PlagAI Scanner é um projeto de código aberto mantido pela comunidade.",
                "Em caso de dúvidas, sugestões de melhoria ou para relatar um problema, a maneira mais eficaz de obter suporte é abrindo uma **'Issue'** em nosso repositório oficial no GitHub.",
                "Isso permite que nossa equipe e a comunidade acompanhem e respondam à sua solicitação de forma organizada.",
            ],
            githubLinkText: "Abrir uma Issue no repositório LaBiOmicS/PlagAIScanner"
        }
      }
    },
    ai: {
      prompt: createPrompt(translationsConfig.pt.lang, translationsConfig.pt.plagiarismKeys, translationsConfig.pt.aiKeys),
      ...translationsConfig.pt.plagiarismKeys,
      ...translationsConfig.pt.aiKeys,
    },
  },
  en: {
    ui: {
      appName: "PlagAI Scanner",
      envKeySet: "API Key Configured",
      envKeyTooltip: "The API key is being provided automatically by the environment.",
      apiKeyScreen: {
        subtitle: "To get started, enter your Google AI Studio API key.",
        label: "Gemini API Key",
        placeholder: "Paste your API key here",
        helperText: {
          part1: "You can create your free key at the",
          link: "Google AI Studio",
          part2: ".",
        },
        button: {
          validating: "Validating...",
          saveAndStart: "Save and Start",
        },
      },
      welcome: {
        title: "Welcome to PlagAI Scanner",
        description: "Ensure your work is truly original. PlagAI Scanner, powered by Google's Gemini, performs a deep, dual-analysis: it meticulously scours the web for plagiarism and evaluates the writing style to detect AI-generated content. Go beyond simple checks and gain the confidence that your text is authentic, credible, and ready to impress.",
        helperText: {
          envKey: "The API key is provided automatically. Just paste your text or upload a file to begin.",
          noEnvKey: "Just paste your text or upload a file to begin."
        }
      },
      mainScreen: {
        inputLabel: "Paste text or upload a file",
        uploadButton: "Upload Document",
        placeholder: "Paste the text here or upload a file (.pdf, .docx, .odt)",
        clearButton: "Clear text",
        fileLabel: "File:",
        words: "words",
        wordLimitDisclaimer: "Manual input limit: {maxWords} words",
        actionButton: {
          default: "Analyze Text",
          loading: "Analyzing...",
        }
      },
      loading: {
          processingFile: "Processing file...",
          extractingText: "Extracting text from your document.",
          analyzingText: "Scanning the Web...",
          comparingText: "The AI is searching for sources and analyzing patterns. This may take a few seconds.",
      },
      results: {
          reportTitle: "Analysis Report",
          title: "Plagiarism Analysis",
          scoreDescription: "This score represents the percentage of text similarity with online sources.",
          analysisTitle: "Detailed Analysis",
          sourcesTitle: "Sources Found",
          highlightedSegmentsTitle: "Segments with Found Similarity",
          exportPdfButton: "Export PDF",
          newAnalysisButton: "New Analysis",
          pdfReportTitle: "PlagAI Scanner Report",
          pdfScore: "Plagiarism Score",
          pdfAssessment: "Overall Assessment",
          pdfAnalysis: "Detailed Analysis",
          pdfSources: "Sources Found",
          aiDetection: {
              title: "AI-Generated Text Analysis",
              scoreDescription: "This score represents the likelihood that the text was generated by an AI.",
              analysisTitle: "Detailed AI Analysis",
              humanizingSuggestionsTitle: "Suggestions for Improvement",
              humanizingSuggestionsDescription: "The AI identified a few ways to make your text more natural and engaging:",
              pdfAiReportTitle: "AI-Generated Content Analysis",
              pdfAiScore: "AI-Generated Score",
              pdfAiAssessment: "AI Assessment",
              pdfAiAnalysis: "Detailed AI Analysis",
          }
      },
      config: {
        title: "AI Brain Management",
        description: "Configure the behavior, memory, and parameters of the Gemini model.",
        model: {
            label: "Artificial Intelligence Model",
            flash: {
                title: "Gemini 2.5 Flash (Default)",
                description: "Fast and efficient model (low-latency). Ideal for general summaries and agile tasks."
            },
            pro: {
                title: "Gemini 2.5 Pro (Reasoning Model)",
                description: "Advanced model with deep reasoning capabilities (Thinking). Best for complex analysis. May be slower."
            }
        },
        behavior: {
            title: "Behavior & Context",
            persona: {
                label: "Identity (Persona)",
                description: "Defines who the AI 'is' and its tone of voice.",
                default: "You are a meticulous academic integrity expert. Your expertise lies in forensic linguistics, plagiarism detection, and identifying patterns in AI-generated text. Your tone is objective, analytical, and educational, aiming to help users improve the originality of their work."
            },
            context: {
                label: "Global Context",
                description: "Facts the AI should consider in all analyses.",
                default: "The primary goal is to perform a dual analysis on user-submitted text. First, conduct extensive web searches to find verbatim matches for plagiarism. Second, analyze linguistic features (like lexical diversity, sentence structure, and 'burstiness') to assess the probability of AI generation. The analysis must be impartial and based on evidence from the searches and the text itself."
            }
        },
        memory: {
            title: "Learning Memory (Accumulated Instructions)",
            label: "Accumulated Instructions",
            description: "Rules the AI has 'learned' from your feedback. You can edit them manually.",
            default: "Instructions generated via feedback will appear here..."
        },
        parameters: {
            title: "Model Parameters",
            description: "Note: These parameters affect how the AI chooses the next words. Adjust Temperature to control 'hallucination' vs 'creativity'. Low values (0.1 - 0.5) are better for factual analysis.",
            temperature: {
                label: "Temperature",
                description: "Balanced",
                precise: "Precise",
                creative: "Creative",
            },
            topK: {
                label: "Top K",
                description: "Size of the token pool."
            },
            topP: {
                label: "Top P",
                description: "Cumulative probability."
            }
        },
        reset: "Reset AI Brain (Factory Default)",
        close: "Close Settings"
      },
      errors: {
        'error.apiKeyRequired': 'Please enter an API key.',
        'error.invalidApiKeyConnection': 'The API key is invalid or an error occurred. Check the key and your connection.',
        unsupportedDoc: ".doc files are not supported. Please save as .docx or .pdf.",
        unsupportedFileType: "Unsupported file type: .{ext}",
        processingFile: "An error occurred while processing the file.",
        textRequired: "Please enter the text to be checked.",
        wordLimitExceeded: "Manually entered text exceeds the {maxWords} word limit.",
        assessmentFailed: "Could not determine the assessment.",
        invalidApiKey: "The provided API key is invalid or has expired. Please check your key and try again.",
        apiFail: "Failed to get a response from the API. The response may be malformed or the API is unavailable. Please try again.",
        unknown: "An unknown error occurred.",
      },
      footer: "Developed by the Bioinformatics and Omics Sciences Laboratory (LaBiOmicS), linked to the Center for Technological Research (NPT) and the Integrated Center for Biotechnology (NIB) of the University of Mogi das Cruzes (UMC).",
      help: {
        title: "PlagAI Scanner Complete Guide",
        about: {
            title: "About the Tool",
            content: "**PlagAI Scanner** is a tool to support academic and writing integrity. Using the power of Google's Gemini generative AI, it performs a dual check: it searches for literal plagiarism from online sources and analyzes the linguistic characteristics of the text to estimate the probability of it being AI-generated. The goal is to provide insights for researchers, students, and writers to ensure the originality and quality of their work."
        },
        howToUse: {
            title: "How to Use the Scanner",
            steps: [
                "**1. Input Text:** Paste your text into the designated area or upload a file in .pdf, .docx, or .odt format.",
                "**2. Choose Model:** Select 'Gemini 2.5 Flash' for quick analyses or 'Gemini 2.5 Pro' for a deeper, more contextual analysis, ideal for complex texts (may be slower).",
                "**3. (Optional) Configure AI:** Click the 'Brain' icon to adjust the model's persona, context, and technical parameters, tailoring the analysis to your specific use case.",
                "**4. Start Analysis:** Click 'Analyze Text'. The AI will scan the web and analyze writing patterns.",
                "**5. Review Results:** Explore the scores, view highlighted segments with similarity, and check the found sources. Use the suggestions to improve your text."
            ]
        },
        interpreting: {
            title: "Interpreting the Results",
            plagiarism: "**Plagiarism Score:** Measures the percentage of the text that **exactly (verbatim)** matches content found on public online sources. A high score indicates literal copying. The system highlights these passages to facilitate review and proper citation. **A score of 0% means no literal copy was detected in the searches.**",
            ai: "**AI Score:** Estimates the probability that the text was written by an AI, based on patterns like excessive uniformity and lack of stylistic variation. **This is not plagiarism.** A high score simply suggests that the writing might seem 'robotic' and could benefit from suggestions to sound more natural and authentic."
        },
        advancedConfig: {
            title: "Advanced Configuration (AI Brain)",
            description: "This section allows you to precisely control how the AI behaves during the analysis.",
            sections: [
                { term: "Persona", definition: "Defines the 'role' the AI should assume (e.g., a PhD researcher, a casual proofreader). This affects the tone and focus of the textual analysis." },
                { term: "Global Context", definition: "Provides the AI with background information it should consider true in all analyses. Useful for specific jargon in a field of study." },
                { term: "Temperature", definition: "Controls creativity. Low values (near 0.0) make the AI more precise and factual. High values (near 2.0) make it more creative but also more prone to 'hallucinations'." },
                { term: "Top K / Top P", definition: "Technical parameters that filter the next words the AI can choose, adjusting how focused or diverse the response will be." }
            ]
        },
        limitations: {
            title: "Limitations, Biases, and Ethics",
            content: "**This tool is an aid, not a final arbiter.** The decision on plagiarism or authorship requires human judgment. **Search Scope:** Plagiarism detection is limited to publicly indexed content by Google. Articles behind paywalls, non-digitized books, or private content will not be detected. **AI Accuracy:** AI detection is probabilistic and may yield false positives/negatives, especially with highly technical or creative texts. **Privacy:** Your text is processed for analysis and is not stored or used to train models."
        },
        license: {
            title: "Open Source and License",
            content: "PlagAI Scanner is open-source software, distributed under the **MIT License**. This means you have the freedom to use, modify, and distribute the software, provided that proper credit is maintained. We encourage community collaboration and code auditing."
        },
        close: "Close Guide"
      },
      licenseModal: {
        title: "MIT License",
        buttonTooltip: "View Usage License",
        mitLicenseText: mitLicenseText,
        close: "Close",
      },
      legalModal: {
        title: "Legal Information & Privacy",
        buttonTooltip: "View Legal Information",
        close: "Close",
        tabs: {
            privacy: "Privacy",
            terms: "Terms of Use",
            cookies: "Cookies",
            support: "Support",
        },
        privacyPolicy: {
            title: "Privacy Policy",
            lastUpdated: "Last updated: July 24, 2024",
            content: [
                "**1. Data Collection:** PlagAI Scanner processes two types of data: (a) the **Gemini API Key** you provide and (b) the **text content** you enter for analysis. The API key is used exclusively to authenticate requests to the Google Gemini API and is not stored by us.",
                "**2. Data Usage:** The text you submit is used solely to perform the requested plagiarism and AI detection analysis. **We do not store, share, or use your text to train AI models.** The interaction occurs directly between your browser and the Google API, subject to Google's privacy policies.",
                "**3. LGPD Compliance:** We are committed to Brazil's General Data Protection Law (LGPD, Law No. 13,709/2018). Your data is processed for the specific purpose of providing this tool's service. You have the right to know how your data is used and that it will not be retained. For more information, please consult the official legislation.",
                "**4. Security:** Your API key is stored locally in your browser during the session and/or provided by the secure environment (like AI Studio) and is transmitted securely (HTTPS) to the Google API.",
            ],
            lgpdLinkText: "Consult the full LGPD text",
        },
        termsOfUse: {
            title: "Terms of Use",
            content: [
                "**1. Purpose of the Tool:** PlagAI Scanner is an assistive tool intended to support academic integrity and original writing. The results provided are based on AI algorithms and web searches and should be considered as support for human decision-making, not as a final verdict.",
                "**2. User Responsibility:** You are responsible for the content you analyze and for ensuring you have the necessary rights to the text. Your use of the Google Gemini API Key is subject to Google's terms of service.",
                "**3. Limitations:** Plagiarism detection is limited to publicly accessible sources indexed by Google. AI detection is a probabilistic estimate and should not be the sole basis for judgment on a text's authorship.",
                "**4. Disclaimer of Warranty:** The tool is provided 'as is', under the MIT License, without warranties of any kind. The developers are not liable for any inaccuracies in the results or decisions made based on them.",
            ]
        },
        cookiePolicy: {
            title: "Cookie Policy",
            content: [
                "PlagAI Scanner, as a standalone application, **does not use cookies** to track users or store personal information.",
                "If you are running this tool within a third-party environment, such as Google AI Studio or other platforms, those environments may use their own cookies. We recommend consulting the cookie policies of the platform you are using.",
            ]
        },
        support: {
            title: "Support and Contact",
            content: [
                "PlagAI Scanner is a community-maintained open-source project.",
                "For questions, improvement suggestions, or to report a problem, the most effective way to get support is by opening an **'Issue'** in our official GitHub repository.",
                "This allows our team and the community to track and respond to your request in an organized manner.",
            ],
            githubLinkText: "Open an Issue at the LaBiOmicS/PlagAIScanner repository"
        }
      }
    },
    ai: {
      prompt: createPrompt(translationsConfig.en.lang, translationsConfig.en.plagiarismKeys, translationsConfig.en.aiKeys),
      ...translationsConfig.en.plagiarismKeys,
      ...translationsConfig.en.aiKeys,
    },
  },
  es: {
    ui: {
      appName: "PlagAI Scanner",
      envKeySet: "Clave de API configurada",
      envKeyTooltip: "La clave de API es proporcionada automáticamente por el entorno.",
      apiKeyScreen: {
        subtitle: "Para comenzar, ingrese su clave de API de Google AI Studio.",
        label: "Clave de API de Gemini",
        placeholder: "Pegue su clave de API aquí",
        helperText: {
          part1: "Puede crear su clave gratuita en el",
          link: "Google AI Studio",
          part2: ".",
        },
        button: {
          validating: "Validando...",
          saveAndStart: "Guardar e Iniciar",
        },
      },
      welcome: {
        title: "Bienvenido a PlagAI Scanner",
        description: "Asegura que tu trabajo sea verdaderamente original. PlagAI Scanner, potenciado por Gemini de Google, realiza un análisis dual y profundo: rastrea meticulosamente la web en busca de plagio y evalúa el estilo de escritura para detectar contenido generado por IA. Ve más allá de las simples verificaciones y obtén la confianza de que tu texto es auténtico, creíble y está listo para impresionar.",
        helperText: {
          envKey: "La clave de API se proporciona automáticamente. Simplemente pegue su texto o suba un archivo para comenzar.",
          noEnvKey: "Simplemente pegue su texto o suba un archivo para comenzar."
        }
      },
      mainScreen: {
        inputLabel: "Pegue el texto o suba un archivo",
        uploadButton: "Subir Documento",
        placeholder: "Pegue el texto aquí o suba un archivo (.pdf, .docx, .odt)",
        clearButton: "Limpiar texto",
        fileLabel: "Archivo:",
        words: "palabras",
        wordLimitDisclaimer: "Límite p/ entrada manual: {maxWords} palabras",
        actionButton: {
          default: "Analizar Texto",
          loading: "Analizando...",
        }
      },
      loading: {
          processingFile: "Procesando archivo...",
          extractingText: "Extrayendo el texto de su documento.",
          analyzingText: "Escaneando la Web...",
          comparingText: "La IA está buscando fuentes y analizando patrones. Esto puede tardar unos segundos.",
      },
      results: {
          reportTitle: "Informe de Análisis",
          title: "Análisis de Plagio",
          scoreDescription: "Este puntaje representa el porcentaje de similitud del texto con fuentes en línea.",
          analysisTitle: "Análisis Detallado",
          sourcesTitle: "Fuentes Encontradas",
          highlightedSegmentsTitle: "Segmentos con Similitud Encontrada",
          exportPdfButton: "Exportar PDF",
          newAnalysisButton: "Nuevo Análisis",
          pdfReportTitle: "Informe PlagAI Scanner",
          pdfScore: "Puntuación de Plagio",
          pdfAssessment: "Evaluación General",
          pdfAnalysis: "Análisis Detallado",
          pdfSources: "Fuentes Encontradas",
          aiDetection: {
              title: "Análisis de Texto Generado por IA",
              scoreDescription: "Este puntaje representa la probabilidad de que el texto haya sido generado por una IA.",
              analysisTitle: "Análisis Detallado de IA",
              humanizingSuggestionsTitle: "Sugerencias para Mejorar",
              humanizingSuggestionsDescription: "La IA ha identificado algunas formas de hacer su texto más natural y atractivo:",
              pdfAiReportTitle: "Análisis de Contenido Generado por IA",
              pdfAiScore: "Puntuación de Generación por IA",
              pdfAiAssessment: "Evaluación de IA",
              pdfAiAnalysis: "Análisis Detallado de IA",
          }
      },
      config: {
        title: "Gestión del Cerebro de la IA",
        description: "Configure el comportamiento, la memoria y los parámetros del modelo Gemini.",
        model: {
            label: "Modelo de Inteligencia Artificial",
            flash: {
                title: "Gemini 2.5 Flash (Predeterminado)",
                description: "Modelo rápido y eficiente (baja latencia). Ideal para resúmenes generales y tareas ágiles."
            },
            pro: {
                title: "Gemini 2.5 Pro (Modelo de Razonamiento)",
                description: "Modelo avanzado con capacidad de razonamiento profundo (Thinking). Mejor para análisis complejos. Puede ser más lento."
            }
        },
        behavior: {
            title: "Comportamiento y Contexto",
            persona: {
                label: "Identidad (Persona)",
                description: "Define quién 'es' la IA y su tono de voz.",
                default: "Eres un meticuloso experto en integridad académica. Tu especialidad abarca la lingüística forense, la detección de plagio y la identificación de patrones en textos generados por IA. Tu tono es objetivo, analítico y educativo, con el fin de ayudar a los usuarios a mejorar la originalidad de sus trabajos."
            },
            context: {
                label: "Contexto Global",
                description: "Hechos que la IA debe considerar en todos los análisis.",
                default: "El objetivo principal es realizar un doble análisis en el texto enviado por el usuario. Primero, realiza búsquedas exhaustivas en la web para encontrar coincidencias literales (verbatim) de plagio. Segundo, analiza características lingüísticas (como diversidad léxica, estructura de las oraciones y 'burstiness') para evaluar la probabilidad de que haya sido generado por IA. El análisis debe ser imparcial y basarse en la evidencia de las búsquedas y del propio texto."
            }
        },
        memory: {
            title: "Memoria de Aprendizaje (Instrucciones Acumuladas)",
            label: "Instrucciones Acumuladas",
            description: "Reglas que la IA ha 'aprendido' de sus comentarios. Puede editarlas manually.",
            default: "Las instrucciones generadas a través de comentarios aparecerán aquí..."
        },
        parameters: {
            title: "Parámetros del Modelo",
            description: "Nota: Estos parámetros afectan cómo la IA elige las siguientes palabras. Ajuste la Temperatura para controlar la 'alucinación' vs 'creatividad'. Los valores bajos (0.1 - 0.5) son mejores para análisis factuales.",
            temperature: {
                label: "Temperatura",
                description: "Equilibrado",
                precise: "Preciso",
                creative: "Creativo",
            },
            topK: {
                label: "Top K",
                description: "Tamaño del grupo de tokens."
            },
            topP: {
                label: "Top P",
                description: "Probabilidad acumulativa."
            }
        },
        reset: "Restablecer Cerebro de IA (Predeterminado de Fábrica)",
        close: "Cerrar Configuración"
      },
      errors: {
        'error.apiKeyRequired': 'Por favor, ingrese una clave de API.',
        'error.invalidApiKeyConnection': 'La clave de API no es válida o se ha producido un error. Verifique la clave y su conexión.',
        unsupportedDoc: "Los archivos .doc no son compatibles. Por favor, guarde como .docx o .pdf.",
        unsupportedFileType: "Tipo de archivo no compatible: .{ext}",
        processingFile: "Ocurrió un error al procesar el archivo.",
        textRequired: "Por favor, ingrese el texto a verificar.",
        wordLimitExceeded: "El texto ingresado manualmente excede el límite de {maxWords} palabras.",
        assessmentFailed: "No se pudo determinar la evaluación.",
        invalidApiKey: "La clave de API proporcionada no es válida o ha caducado. Por favor, verifique su clave e inténtelo de nuevo.",
        apiFail: "No se pudo obtener una respuesta de la API. La respuesta puede estar mal formada o la API no disponible. Inténtelo de nuevo.",
        unknown: "Ocurrió un error desconocido.",
      },
      footer: "Desarrollado por el Laboratorio de Bioinformática y Ciencias Ómicas (LaBiOmicS), vinculado al Núcleo de Investigaciones Tecnológicas (NPT) y al Núcleo Integrado de Biotecnología (NIB) de la Universidad de Mogi das Cruzes (UMC).",
      help: {
        title: "Guía Completa de PlagAI Scanner",
        about: {
            title: "Sobre la Herramienta",
            content: "**PlagAI Scanner** es una herramienta de apoyo a la integridad académica y la escritura. Utilizando el poder de la IA generativa de Google Gemini, realiza una doble verificación: busca plagio literal en fuentes en línea y analiza las características lingüísticas del texto para estimar la probabilidad de que haya sido generado por una IA. El objetivo es proporcionar información para que investigadores, estudiantes y escritores puedan garantizar la originalidad y calidad de sus trabajos."
        },
        howToUse: {
            title: "Cómo Usar el Escáner",
            steps: [
                "**1. Ingrese el Texto:** Pegue su texto en el área designada o suba un archivo en formato .pdf, .docx o .odt.",
                "**2. Elija el Modelo:** Seleccione 'Gemini 2.5 Flash' para análisis rápidos o 'Gemini 2.5 Pro' para un análisis más profundo y contextual, ideal para textos complejos (puede ser más lento).",
                "**3. (Opcional) Configure la IA:** Haga clic en el ícono del 'Cerebro' para ajustar la persona, el contexto y los parámetros técnicos del modelo, adaptando el análisis a su caso de uso específico.",
                "**4. Inicie el Análisis:** Haga clic en 'Analizar Texto'. La IA escaneará la web y analizará los patrones de escritura.",
                "**5. Revise los Resultados:** Explore las puntuaciones, vea los fragmentos con similitud resaltados y las fuentes encontradas. Use las sugerencias para mejorar su texto."
            ]
        },
        interpreting: {
            title: "Interpretando los Resultados",
            plagiarism: "**Puntuación de Plagio:** Mide el porcentaje del texto que coincide **exactamente (verbatim)** con contenido encontrado en fuentes públicas en línea. Una puntuación alta indica copia literal. El sistema resalta estos pasajes para facilitar la revisión y la citación correcta. **Una puntuación de 0% significa que no se detectó ninguna copia literal en las búsquedas.**",
            ai: "**Puntuación de IA:** Estima la probabilidad de que el texto haya sido escrito por una IA, basándose en patrones como la uniformidad excesiva y la falta de variación estilística. **Esto no es plagio.** Una puntuación alta solo sugiere que la escritura puede parecer 'robótica' y podría beneficiarse de las sugerencias para sonar más natural y auténtica."
        },
        advancedConfig: {
            title: "Configuración Avanzada (Cerebro de la IA)",
            description: "Esta sección le permite controlar con precisión cómo se comporta la IA durante el análisis.",
            sections: [
                { term: "Persona", definition: "Define el 'rol' que la IA debe asumir (por ejemplo, un investigador PhD, un revisor casual). Esto afecta el tono y el enfoque del análisis textual." },
                { term: "Contexto Global", definition: "Proporciona a la IA información de fondo que debe considerar como verdadera en todos los análisis. Útil para la jerga específica de un campo de estudio." },
                { term: "Temperatura", definition: "Controla la creatividad. Valores bajos (cercanos a 0.0) hacen que la IA sea más precisa y fáctica. Valores altos (cercanos a 2.0) la hacen más creativa, pero también más propensa a 'alucinaciones'." },
                { term: "Top K / Top P", definition: "Parámetros técnicos que filtran las siguientes palabras que la IA puede elegir, ajustando cuán enfocada o diversa será la respuesta." }
            ]
        },
        limitations: {
            title: "Limitaciones, Sesgos y Ética",
            content: "**Esta herramienta es una ayuda, no un árbitro final.** La decisión sobre el plagio o la autoría requiere juicio humano. **Alcance de la Búsqueda:** La detección de plagio se limita al contenido indexado públicamente por Google. No se detectarán artículos detrás de muros de pago, libros no digitalizados o contenido privado. **Precisión de la IA:** La detección de IA es probabilística y puede generar falsos positivos/negativos, especialmente con textos muy técnicos o creativos. **Privacidad:** Su texto se procesa para el análisis y no se almacena ni se utiliza para entrenar modelos."
        },
        license: {
            title: "Código Aberto y Licencia",
            content: "PlagAI Scanner es un software de código abierto, distribuido bajo la **Licencia MIT**. Esto significa que tiene la libertad de usar, modificar y distribuir el software, siempre que se mantengan los créditos adecuados. Fomentamos la colaboración y la auditoría del código por parte de la comunidad."
        },
        close: "Cerrar Guía"
      },
      licenseModal: {
        title: "Licencia MIT",
        buttonTooltip: "Ver Licencia de Uso",
        mitLicenseText: mitLicenseText,
        close: "Cerrar",
      },
      legalModal: {
        title: "Información Legal y Privacidad",
        buttonTooltip: "Ver Información Legal",
        close: "Cerrar",
        tabs: {
            privacy: "Privacidad",
            terms: "Términos de Uso",
            cookies: "Cookies",
            support: "Soporte",
        },
        privacyPolicy: {
            title: "Política de Privacidad",
            lastUpdated: "Última actualización: 24 de julio de 2024",
            content: [
                "**1. Recopilación de Datos:** PlagAI Scanner procesa dos tipos de datos: (a) la **Clave de API de Gemini** que usted proporciona y (b) el **contenido textual** que ingresa para su análisis. La clave de API se utiliza exclusivamente para autenticar las solicitudes a la API de Google Gemini y no la almacenamos.",
                "**2. Uso de los Datos:** El texto que envía se utiliza únicamente para realizar el análisis de plagio y detección de IA solicitado. **No almacenamos, compartimos ni utilizamos su texto para entrenar modelos de IA.** La interacción ocurre directamente entre su navegador y la API de Google, sujeta a las políticas de privacidad de Google.",
                "**3. Cumplimiento de la LGPD:** Estamos comprometidos con la Ley General de Protección de Datos de Brasil (LGPD, Ley N° 13.709/2018). Sus datos son tratados con el propósito específico de proporcionar el servicio de esta herramienta. Tiene derecho a saber cómo se utilizan sus datos y a que no sean retenidos. Para más información, consulte la legislación oficial.",
                "**4. Seguridad:** Su clave de API se almacena localmente en su navegador durante la sesión y/o es proporcionada por el entorno seguro (como AI Studio) y se transmite de forma segura (HTTPS) a la API de Google.",
            ],
            lgpdLinkText: "Consultar la LGPD en su totalidad",
        },
        termsOfUse: {
            title: "Términos de Uso",
            content: [
                "**1. Propósito de la Herramienta:** PlagAI Scanner es una herramienta de asistencia destinada a apoyar la integridad académica y la escritura original. Los resultados proporcionados se basan en algoritmos de IA y búsquedas web, y deben considerarse como un apoyo a la decisión humana, no como un veredicto final.",
                "**2. Responsabilidad del Usuario:** Usted es responsable del contenido que analiza y de garantizar que posee los derechos necesarios sobre el texto. El uso de su Clave de API de Google Gemini está sujeto a los términos de servicio de Google.",
                "**3. Limitaciones:** La detección de plagio se limita a fuentes de acceso público indexadas por Google. La detección de IA es una estimación probabilística y no debe ser la única base para juzgar la autoría de un texto.",
                "**4. Exención de Garantía:** La herramienta se proporciona 'tal cual', bajo la Licencia MIT, sin garantías de ningún tipo. Los desarrolladores no se hacen responsables de ninguna imprecisión en los resultados o de las decisiones tomadas en base a ellos.",
            ]
        },
        cookiePolicy: {
            title: "Política de Cookies",
            content: [
                "PlagAI Scanner, como aplicación independiente, **no utiliza cookies** para rastrear a los usuarios o almacenar información personal.",
                "Si está ejecutando esta herramienta dentro de un entorno de terceros, como Google AI Studio u otras plataformas, esos entornos pueden utilizar sus propias cookies. Le recomendamos que consulte las políticas de cookies de la plataforma que está utilizando.",
            ]
        },
        support: {
            title: "Soporte y Contacto",
            content: [
                "PlagAI Scanner es un proyecto de código abierto mantenido por la comunidad.",
                "En caso de dudas, sugerencias de mejora o para informar un problema, la forma más eficaz de obtener soporte es abriendo un **'Issue'** en nuestro repositorio oficial en GitHub.",
                "Esto permite a nuestro equipo y a la comunidad dar seguimiento y responder a su solicitud de forma organizada.",
            ],
            githubLinkText: "Abrir un Issue en el repositorio LaBiOmicS/PlagAIScanner"
        }
      }
    },
    ai: {
      prompt: createPrompt(translationsConfig.es.lang, translationsConfig.es.plagiarismKeys, translationsConfig.es.aiKeys),
      ...translationsConfig.es.plagiarismKeys,
      ...translationsConfig.es.aiKeys,
    },
  },
};

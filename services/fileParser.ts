import * as pdfjsLib from 'pdfjs-dist';

// These are loaded from script tags in index.html
declare const mammoth: any;
declare const JSZip: any;

// Set up the PDF.js worker from a CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const parsePdf = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map((item: any) => item.str).join(' ') + '\n';
  }
  return text;
};

const parseDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
};

const parseOdt = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  const zip = await JSZip.loadAsync(arrayBuffer);
  const contentXml = await zip.file('content.xml').async('string');
  
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(contentXml, 'text/xml');
  const paragraphs = xmlDoc.getElementsByTagName('text:p');
  
  let text = '';
  for (let i = 0; i < paragraphs.length; i++) {
    text += paragraphs[i].textContent + '\n';
  }
  return text.trim();
};

export const parseFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return parsePdf(file);
    case 'docx':
      return parseDocx(file);
    case 'odt':
      return parseOdt(file);
    case 'doc':
      throw new Error("error.unsupportedDoc");
    default:
      throw new Error(`error.unsupportedFileType:${extension}`);
  }
};

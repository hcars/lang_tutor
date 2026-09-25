const LIBREOFFICE_BASE_URL = 'https://raw.githubusercontent.com/LibreOffice/dictionaries/master';

interface DictionaryUrls {
  aff: string;
  dic: string;
}

const DICTIONARY_MAP: Record<string, DictionaryUrls> = {
  en_US: {
    aff: `${LIBREOFFICE_BASE_URL}/en/en_US.aff`,
    dic: `${LIBREOFFICE_BASE_URL}/en/en_US.dic`,
  },
  es_ES: {
    aff: `${LIBREOFFICE_BASE_URL}/es/es_ES.aff`,
    dic: `${LIBREOFFICE_BASE_URL}/es/es_ES.dic`,
  },
  fr_FR: {
    aff: `${LIBREOFFICE_BASE_URL}/dictionaries/fr_FR/dictionaries/fr.aff`,
    dic: `${LIBREOFFICE_BASE_URL}/dictionaries/fr_FR/dictionaries/fr.dic`,
  },
  de_DE: {
    aff: `${LIBREOFFICE_BASE_URL}/de/de_DE_frami.aff`,
    dic: `${LIBREOFFICE_BASE_URL}/de/de_DE_frami.dic`,
  },
};

export function getDictionaryUrls(language: string): DictionaryUrls {
  const urls = DICTIONARY_MAP[language];
  if (!urls) {
    throw new Error(`Unsupported language: ${language}. Supported languages: ${Object.keys(DICTIONARY_MAP).join(', ')}`);
  }
  return urls;
}

export function getSupportedLanguages(): string[] {
  return Object.keys(DICTIONARY_MAP);
}

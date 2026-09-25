import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
  disabled?: boolean;
}

const LANGUAGES = [
  { code: 'en_US', label: 'English (US)' },
  { code: 'es_ES', label: 'Spanish (Spain)' },
  { code: 'fr_FR', label: 'French (France)' },
  { code: 'de_DE', label: 'German (Germany)' }
];

export function LanguageSelector({ value, onChange, disabled }: LanguageSelectorProps) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[180px]" aria-label="Select language">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

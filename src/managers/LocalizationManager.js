import en from '../locales/en.json' with { type: 'json' };
import ms from '../locales/ms.json' with { type: 'json' };
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES } from '../config/constants.js';

class LocalizationManager {
  constructor() {
    this.locales = { en, ms };
    this.currentLanguage = DEFAULT_LANGUAGE; // Default to English
    this.listeners = new Set();
  }

  init(savedLanguage) {
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
      this.currentLanguage = savedLanguage;
    } else {
      this.currentLanguage = DEFAULT_LANGUAGE;
    }
  }

  setLanguage(lang) {
    if (SUPPORTED_LANGUAGES.includes(lang) && this.currentLanguage !== lang) {
      this.currentLanguage = lang;
      this.notifyListeners();
    }
  }

  getLanguage() {
    return this.currentLanguage;
  }

  toggleLanguage() {
    const nextLang = this.currentLanguage === 'en' ? 'ms' : 'en';
    this.setLanguage(nextLang);
    return nextLang;
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    for (const callback of this.listeners) {
      try {
        callback(this.currentLanguage);
      } catch (err) {
        console.error('Localization listener error:', err);
      }
    }
  }

  t(path, params = {}) {
    const keys = path.split('.');
    let result = this.locales[this.currentLanguage];

    for (const key of keys) {
      if (result && result[key] !== undefined) {
        result = result[key];
      } else {
        // Fallback to English if missing in current locale
        let fallback = this.locales[DEFAULT_LANGUAGE];
        for (const fbKey of keys) {
          if (fallback && fallback[fbKey] !== undefined) {
            fallback = fallback[fbKey];
          } else {
            return path;
          }
        }
        result = fallback;
        break;
      }
    }

    if (typeof result === 'string') {
      return result.replace(/\{(\w+)\}/g, (_, match) => {
        return params[match] !== undefined ? params[match] : `{${match}}`;
      });
    }

    return result !== undefined ? result : path;
  }
}

export const localizationManager = new LocalizationManager();
export default localizationManager;

/**
 * i18n Service
 * Internationalization setup using i18next + react-i18next + expo-localization
 *
 * Supported languages: English (en), Turkish (tr), French (fr)
 * Language override stored in AsyncStorage for debug purposes.
 * NOTE: MARK: Debug language selector — remove LANGUAGE_KEY and setDebugLanguage before release build.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '@/locales/en.json';
import tr from '@/locales/tr.json';
import fr from '@/locales/fr.json';

// MARK: Debug — remove before release build
const LANGUAGE_KEY = '@debug_language';

export const SUPPORTED_LOCALES = ['en', 'tr', 'fr'] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/** Resolve the best supported locale from device settings */
function resolveDeviceLocale(): SupportedLocale {
  const tag = Localization.getLocales()[0]?.languageTag ?? 'en';
  const code = tag.split('-')[0].toLowerCase();
  return SUPPORTED_LOCALES.includes(code as SupportedLocale)
    ? (code as SupportedLocale)
    : 'en';
}

/** Initialize i18n — call once at app startup before rendering */
export async function initI18n(): Promise<void> {
  const storedLang = await AsyncStorage.getItem(LANGUAGE_KEY);
  const lng =
    storedLang && SUPPORTED_LOCALES.includes(storedLang as SupportedLocale)
      ? (storedLang as SupportedLocale)
      : resolveDeviceLocale();

  await i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      tr: { translation: tr },
      fr: { translation: fr },
    },
    lng,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

// MARK: Debug — remove setDebugLanguage and LANGUAGE_KEY before release build
/** Change language at runtime and persist selection */
export async function setDebugLanguage(code: SupportedLocale | 'auto'): Promise<void> {
  if (code === 'auto') {
    await AsyncStorage.removeItem(LANGUAGE_KEY);
    await i18n.changeLanguage(resolveDeviceLocale());
  } else {
    await AsyncStorage.setItem(LANGUAGE_KEY, code);
    await i18n.changeLanguage(code);
  }
}

/** Return the active locale tag (e.g. 'tr') */
export function getCurrentLocale(): string {
  return i18n.language ?? 'en';
}

export default i18n;

export const defaultLocale = 'en-US';
export const locales = ['en-US', 'en-CA', 'zh-CN'] as const;
export type ValidLocale = (typeof locales)[number];

type PathnameLocale = {
  pathname: string;
  locale?: never;
};
type ISOLocale = {
  pathname?: never;
  locale: string;
};

type LocaleSource = PathnameLocale | ISOLocale;

export const getLocalePartsFrom = ({ pathname, locale }: LocaleSource) => {
  if (locale) {
    const localeParts = locale.toLowerCase().split('-');
    return {
      lang: localeParts[0],
      country: localeParts[1],
    };
  }
  const pathnameParts = pathname!.toLowerCase().split('/');
  return {
    lang: pathnameParts[1],
    country: pathnameParts[2],
  };
};

const dictionaries: Record<ValidLocale, any> = {
  'en-US': () =>
    import('./dictionaries/en-US.json').then((module) => module.default),
  'en-CA': () =>
    import('./dictionaries/en-CA.json').then((module) => module.default),
  'zh-CN': () =>
    import('./dictionaries/zh-CN.json').then((module) => module.default),
} as const;

export const getTranslator = async (locale: ValidLocale) => {
  const dictionary = await dictionaries[locale]();

  return (key: string, params?: { [key: string]: string | number }) => {
    let translation = key
      .split('.')
      .reduce((obj, keyT) => obj && obj[keyT], dictionary);

    if (!translation) {
      return key;
    }
    if (params && Object.entries(params).length) {
      Object.entries(params).forEach(([keyP, value]) => {
        translation = translation!.replace(`{{ ${keyP} }}`, String(value));
      });
    }
    return translation;
  };
};

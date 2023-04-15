import langParser from 'accept-language-parser';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { defaultLocale, getLocalePartsFrom, locales } from './i18n';

const findBestMatchingLocale = (acceptLangHeader: string) => {
  // parse the locales acceptable in the header, and sort them by priority (q)
  const parsedLangs = langParser.parse(acceptLangHeader);
  // Type error: 'parsedLang' is possibly 'undefined'.

  // find the first locale that matches a locale in our list
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < parsedLangs.length; i++) {
    const parsedLang = parsedLangs[i];
    // attempt to match both the language and the country
    const matchedLocale = locales.find((locale) => {
      const localeParts = getLocalePartsFrom({ locale });
      return (
        parsedLang?.code === localeParts.lang &&
        parsedLang?.region === localeParts.country
      );
    });
    if (matchedLocale) {
      return matchedLocale;
    }
    // if we didn't find a match for both language and country, try just the language

    const matchedLanguage = locales.find((locale) => {
      const localeParts = getLocalePartsFrom({ locale });
      return parsedLang?.code === localeParts.lang;
    });
    if (matchedLanguage) {
      return matchedLanguage;
    }
  }
  // if we didn't find a match, return the default locale
  return defaultLocale;
};

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const defaultLocaleParts = getLocalePartsFrom({ locale: defaultLocale });
  const currentPathnameParts = getLocalePartsFrom({ pathname });

  // Check if the default locale is in the pathname
  if (
    currentPathnameParts.lang === defaultLocaleParts.lang &&
    currentPathnameParts.country === defaultLocaleParts.country
  ) {
    // we want to REMOVE the default locale from the pathname,
    // and later use a rewrite so that Next will still match
    // the correct code file as if there was a locale in the pathname
    const newUrl = new URL(request.url);
    newUrl.pathname = pathname.replace(
      `/${defaultLocaleParts.lang}/${defaultLocaleParts.country}`,
      ''
    );
    newUrl.search = search;

    return NextResponse.redirect(newUrl);
  }

  const pathnameIsMissingValidLocale = locales.every((locale) => {
    const localeParts = getLocalePartsFrom({ locale });
    return !pathname.startsWith(`/${localeParts.lang}/${localeParts.country}`);
  });

  if (pathnameIsMissingValidLocale) {
    // rewrite it so next.js will render `/` as if it was `/en/us`

    const matchedLocale = findBestMatchingLocale(
      request.headers.get('Accept-Language') || defaultLocale
    );

    if (matchedLocale !== defaultLocale) {
      const matchedLocaleParts = getLocalePartsFrom({ locale: matchedLocale });
      return NextResponse.redirect(
        new URL(
          `/${matchedLocaleParts.lang}/${matchedLocaleParts.country}${pathname}`,
          request.url
        )
      );
    }
    return NextResponse.rewrite(
      new URL(
        `/${defaultLocaleParts.lang}/${defaultLocaleParts.country}${pathname}`,
        request.url
      )
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all internal paths (_next)
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js).*)',
  ],
};

import type { ValidLocale } from '@/i18n';
import { getTranslator } from '@/i18n';
import { Meta } from '@/layouts/Meta';
import { Main } from '@/templates/Main';
import Image from 'next/image';

export default async function Home({
  params,
}: {
  params: { lang: string; country: string };
}) {
  const { lang, country } = params;

  const translate = await getTranslator(
    `${params.lang}-${params.country.toUpperCase()}` as ValidLocale // our middleware ensures this is valid
  );
  const title = translate('home.title');
  const titleDesc = translate('home.titleDesc');

  return (
    <Main
      meta={<Meta title="EasyCWP" description="" />}
      lang={lang}
      country={country}
    >
      <div className="relative h-[200px] w-full md:h-[545px]">
        <Image
          src={'/assets/home-banner.png'}
          priority
          alt="EasyCWP"
          fill
          sizes="100vw"
        />
        <h2 className="absolute left-[20%] top-[20px] text-2xl font-bold md:top-[80px] md:text-6xl">
          {title}
        </h2>
        <div className="absolute top-[80px] left-[20%] w-2/3 text-sm md:top-[200px] md:w-2/5 md:text-2xl">
          {titleDesc}
        </div>
      </div>
    </Main>
  );
}

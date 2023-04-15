import type { ReactNode } from 'react';

type IMainProps = {
  lang?: string;
  country?: string;
  meta?: ReactNode;
  children: ReactNode;
};

const Main = (props: IMainProps) => (
  <div className="m-auto w-full text-gray-700 antialiased">
    {props.children}
  </div>
);

export { Main };

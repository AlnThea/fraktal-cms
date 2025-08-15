import classNames from 'classnames';
import React, { PropsWithChildren } from 'react';

type Props = React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>;

export default function PrimaryButton({
  children,
  ...props
}: PropsWithChildren<Props>) {
  return (
    <button
      {...props}
      className={classNames(
          'inline-flex items-center px-3 py-1 bg-white dark:bg-emerald-800 border border-emerald-300 dark:border-emerald-500 rounded-md font-semibold text-xs text-emerald-700 dark:text-gray-300 uppercase tracking-widest shadow-sm hover:bg-emerald-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-25 transition ease-in-out duration-150',
          props.className,
      )}
    >
      {children}
    </button>
  );
}

import { Transition } from '@headlessui/react';
import classNames from 'classnames';
import React, { PropsWithChildren, useState } from 'react';

interface Props {
  align?: string;
  width?: string | number;
  contentClasses?: string;
  position?: 'absolute' | 'fixed'; // tambahkan ini
  renderTrigger(): JSX.Element;
}

export default function Dropdown({
  align = 'right',
  width = '48',
  contentClasses = 'py-1 bg-white dark:bg-gray-700',
  renderTrigger,
  children,
}: PropsWithChildren<Props>) {
  const [open, setOpen] = useState(false);

  const widthClass = {
    '10': 'w-11',
    '20': 'w-20',
    '35': 'w-35',
    '45': 'w-45',
    '60': 'w-60',
  }[width.toString()];

  const alignmentClasses = (() => {
      if (align === 'left') return 'origin-top-left left-0';
      if (align === 'right') return 'origin-top-right right-0';
      if (align === 'top') return 'origin-top-right -top-44 -right-44';
      if (align === 'top-nav') return 'origin-top-right -top-44 -right-44';
      if (align === 'top-collapsed') return 'origin-top-right -top-43 -right-14';
      return 'origin-top';
  })();

  return (
    <div className="">
      <div onClick={() => setOpen(!open)}>{renderTrigger()}</div>

      {/* <!-- Full Screen Dropdown Overlay --> */}
      <div
        className="fixed inset-0 z-40"
        style={{ display: open ? 'block' : 'none' }}
        onClick={() => setOpen(false)}
      />

      <Transition
        show={open}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className={'absolute z-50'}>
          <div
            className={classNames(
              'absolute mt-2 rounded-md shadow-lg',
              widthClass,
              alignmentClasses,
            )}
            onClick={() => setOpen(false)}
          >
            <div
              className={classNames(
                'rounded-md border border-gray-200 dark:border-gray-700',
                contentClasses,
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </Transition>
    </div>
  );
}

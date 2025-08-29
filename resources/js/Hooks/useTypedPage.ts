import { usePage } from '@inertiajs/react';
import { InertiaSharedProps } from '@/Types/types';

export default function useTypedPage<T = {}>() {
  return usePage<InertiaSharedProps<T>>();
}

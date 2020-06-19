import { useEffect, useRef } from 'react';

// previous hook that accepts anything
export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

import { useEffect, useRef, useState } from 'react';

export const UseIO = (options: any) => {
  const [elements, setElements] = useState([]);
  const [entries, setEntries] = useState([]);

  const observer = useRef(null);
  const { root = null, rootMargin = undefined, threshold = 0.25 } = options;

  useEffect(() => {
    if (elements.length) {
      observer.current = new IntersectionObserver(
        (ioEntries) => {
          setEntries(ioEntries);
        },
        {
          threshold,
          root,
          rootMargin,
        }
      );

      elements.forEach((element) => {
        observer.current.observe(element);
      });
    }
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [elements, root, rootMargin, threshold]);

  return [observer.current, setElements, entries];
};

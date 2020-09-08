import { useEffect, useRef, useState } from 'react';

const useIO = (options: any) => {
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
      console.log(111, root);
      console.log(222, rootMargin);
      console.log(333, threshold);
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

export default useIO;

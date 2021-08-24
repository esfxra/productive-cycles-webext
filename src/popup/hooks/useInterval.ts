import { useRef, useEffect } from 'react';

type intervalCallback = () => void;
type intervalDelay = number | null;

export default function useInterval(
  callback: intervalCallback,
  delay: intervalDelay
): void {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  });

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }

    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        console.log('useInterval - Clearing interval');
        clearInterval(id);
      };
    }
  }, [delay]);
}

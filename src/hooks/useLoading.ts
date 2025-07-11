import { useState, useEffect } from 'react';

export const useLoading = (initialDelay: number = 1000) => {
  const [loading, setLoading] = useState<number>(1);

  useEffect(() => {
    // Remove initial loading after specified delay
    const timer = setTimeout(() => {
      setLoading(0);
    }, initialDelay);
    return () => clearTimeout(timer);
  }, [initialDelay]);

  const incrementLoading = () => {
    setLoading((prev) => prev + 1);
  };

  const decrementLoading = () => {
    setLoading((prev) => Math.max(0, prev - 1));
  };

  return {
    isLoading: loading > 0,
    incrementLoading,
    decrementLoading
  };
}; 
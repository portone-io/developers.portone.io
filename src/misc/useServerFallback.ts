import { useEffect, useState } from "react";

export const useServerFallback = <T>(value: T, serverFallback: T) => {
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    setIsInitialRender(false);
  }, []);

  return isInitialRender ? serverFallback : value;
};

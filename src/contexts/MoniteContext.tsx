import { createContext, useContext, useEffect, useState } from "react";
import { MoniteSDK } from "@monite/sdk-api";
import { useToast } from "@/hooks/use-toast";
import { initializeMoniteSDK, clearMoniteSDK } from "@/lib/monite/config";

interface MoniteContextType {
  monite: MoniteSDK | null;
  isInitialized: boolean;
  error: Error | null;
  initialize: () => Promise<void>;
  reset: () => void;
}

const MoniteContext = createContext<MoniteContextType>({
  monite: null,
  isInitialized: false,
  error: null,
  initialize: async () => {},
  reset: () => {},
});

export function MoniteProvider({ children }: { children: React.ReactNode }) {
  const [monite, setMonite] = useState<MoniteSDK | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const initialize = async () => {
    try {
      setError(null);
      const sdk = await initializeMoniteSDK();
      setMonite(sdk);
      setIsInitialized(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize Monite');
      setError(error);
      toast({
        variant: "destructive",
        title: "Initialization Error",
        description: error.message,
      });
      throw error;
    }
  };

  const reset = () => {
    clearMoniteSDK();
    setMonite(null);
    setIsInitialized(false);
    setError(null);
  };

  useEffect(() => {
    initialize().catch((error) => {
      console.error('Failed to initialize Monite SDK:', error);
      reset();
    });

    return () => {
      reset();
    };
  }, []);

  return (
    <MoniteContext.Provider value={{ monite, isInitialized, error, initialize, reset }}>
      {children}
    </MoniteContext.Provider>
  );
}

export function useMonite() {
  const context = useContext(MoniteContext);
  if (!context) {
    throw new Error("useMonite must be used within a MoniteProvider");
  }
  return context;
}
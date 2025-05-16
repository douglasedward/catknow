'use client';
import { createContext, useContext } from 'react';
import { catService } from '@/services/CatService';
import { ICatService } from '@/services/ICatService';

const CatServiceContext = createContext<ICatService>(catService);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CatServiceContext.Provider value={catService}>
      {children}
    </CatServiceContext.Provider>
  );
}

export function useCatService(): ICatService {
  const context = useContext(CatServiceContext);
  if (!context) {
    throw new Error('useCatService must be used within a CatServiceProvider');
  }
  return context;
}

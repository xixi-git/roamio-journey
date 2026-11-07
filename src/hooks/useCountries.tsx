import React, { createContext, useContext, useState, useEffect } from 'react';
import { countryService, type GlobalCountryConfig } from '../services/countryService';

// 1. 创建 Context
const CountryContext = createContext<{
  countries: GlobalCountryConfig[];
  loading: boolean;
  getCountryByCode: (code: string) => GlobalCountryConfig | undefined;
} | null>(null);

// 2. 全局 Provider组件 (包裹在 src/main.tsx 或 App.tsx 最外层)
export function CountryProvider({ children }: { children: React.ReactNode }) {
  const [countries, setCountries] = useState<GlobalCountryConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    countryService.getGlobalCountries().then((data) => {
      setCountries(data);
      setLoading(false);
    });
  }, []);

  // 提供一个根据国家代码快速反查国家详情的方法，方便在“改、查”回显时使用
  const getCountryByCode = (code: string) => {
    return countries.find(c => c.value === code);
  };

  return (
    <CountryContext.Provider value={{ countries, loading, getCountryByCode }}>
      {children}
    </CountryContext.Provider>
  );
}

// 3. 暴露给各个页面的公共业务 Hook
export function useCountries() {
  const context = useContext(CountryContext);
  if (!context) {
    throw new Error('useCountries must be used within a CountryProvider');
  }
  return context;
}
"use client";

import { AutomationsContextType, PayloadType } from '@/types';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { ThemeProvider } from '@aws-amplify/ui-react';

export const AutomationsContext = createContext<AutomationsContextType | null>(null);

const initialSettings: PayloadType = {}

const theme = {
  name: 'my-theme',
  tokens: {
    colors: {
      font: {
        orange: { value: '#f97316'}
      },
    },
  },
};

export function useAutomationsContext() {
    const context = useContext(AutomationsContext);
    if (!context) throw new Error('Automations Context Error');
    return context;
}

export default function Provider({children}: {children: React.ReactNode}) {
    const [settings, setSettings] = useState<PayloadType>(() => {
        if (typeof window !== 'undefined') {
            const savedSettings = localStorage.getItem('automation_settings');
            return savedSettings ? JSON.parse(savedSettings) : {};
        }
        return initialSettings;
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('automation_settings', JSON.stringify(settings));
        }
    }, [settings]);
    
    const resetSettings = useCallback(() => {
        setSettings(initialSettings);
    }, []);

    const updateSettingsByField = (id: string, value: PayloadType["key"]) => {
        setSettings((prevSettings: PayloadType) => ({
            ...prevSettings,
            [id]: value
        }))
    }

    return (
        <AutomationsContext.Provider value={{
            settings,
            resetSettings,
            updateSettingsByField
        }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </AutomationsContext.Provider>
    );
}
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'midnight' | 'forest';
export type Language = 'en' | 'hi' | 'es' | 'fr';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isSystemSync: boolean;
  setIsSystemSync: (sync: boolean) => void;
  t: (key: string) => string;
}

const translations: any = {
  en: {
    dashboard: 'Dashboard',
    projects: 'Projects',
    tasks: 'Tasks',
    users: 'Users',
    settings: 'Settings',
    profile: 'Profile',
    logout: 'Sign out',
    appearance: 'Appearance',
    language: 'Language',
    sync_system: 'Sync with System',
    create_issue: 'Create Issue',
    search_placeholder: 'Search by ID, Creator, or Assignee...',
    save_changes: 'Save Changes',
    cancel: 'Cancel',
    tasks_board: 'Task Board',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    projects: 'परियोजनाएं',
    tasks: 'कार्य',
    users: 'उपयोगकर्ता',
    settings: 'सेटिंग्स',
    profile: 'प्रोफ़ाइल',
    logout: 'साइन आउट',
    appearance: 'सजावट',
    language: 'भाषा',
    sync_system: 'सिस्टम के साथ सिंक करें',
    create_issue: 'नया मुद्दा',
    search_placeholder: 'ID, निर्माता या असाइनी द्वारा खोजें...',
    save_changes: 'परिवर्तन सहेजें',
    cancel: 'रद्द करें',
    tasks_board: 'कार्य बोर्ड',
  },
  es: {
    dashboard: 'Tablero',
    projects: 'Proyectos',
    tasks: 'Tareas',
    users: 'Usuarios',
    settings: 'Ajustes',
    profile: 'Perfil',
    logout: 'Cerrar sesión',
    appearance: 'Apariencia',
    language: 'Idioma',
    sync_system: 'Sincronizar con sistema',
    create_issue: 'Crear Incidencia',
    search_placeholder: 'Buscar por ID, creador o asignado...',
    save_changes: 'Guardar cambios',
    cancel: 'Cancelar',
    tasks_board: 'Tablero de Tareas',
  },
  fr: {
    dashboard: 'Tableau de bord',
    projects: 'Projets',
    tasks: 'Tâches',
    users: 'Utilisateurs',
    settings: 'Paramètres',
    profile: 'Profil',
    logout: 'Déconnexion',
    appearance: 'Apparence',
    language: 'Langue',
    sync_system: 'Sync avec le système',
    create_issue: 'Créer un ticket',
    search_placeholder: 'Rechercher par ID, créateur ou assigné...',
    save_changes: 'Sauvegarder',
    cancel: 'Annuler',
    tasks_board: 'Tableau des Tâches',
  }
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme;
      if (['light', 'dark', 'midnight', 'forest'].includes(saved)) return saved;
    } catch (e) {}
    return 'dark';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language') as Language;
      if (['en', 'hi', 'es', 'fr'].includes(saved)) return saved;
    } catch (e) {}
    return 'en';
  });

  const [isSystemSync, setIsSystemSyncState] = useState<boolean>(() => {
    try {
      return localStorage.getItem('isSystemSync') === 'true';
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    if (isSystemSync) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: any) => {
        setThemeState(e.matches ? 'dark' : 'light');
      };
      // For compatibility with older Safari
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      } else {
        (mediaQuery as any).addListener(handleChange);
      }
      setThemeState(mediaQuery.matches ? 'dark' : 'light');
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        } else {
          (mediaQuery as any).removeListener(handleChange);
        }
      };
    }
  }, [isSystemSync]);

  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('isSystemSync', String(isSystemSync));
    } catch (e) {}
    
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-midnight', 'theme-forest');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'midnight') {
      root.classList.add('dark', 'theme-midnight');
    } else if (theme === 'forest') {
      root.classList.add('dark', 'theme-forest');
    }
  }, [theme, isSystemSync]);

  useEffect(() => {
    try {
      localStorage.setItem('language', language);
    } catch (e) {}
  }, [language]);

  const t = (key: string) => {
    const langDict = translations[language] || translations.en;
    return langDict[key] || translations.en[key] || key;
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, setTheme: setThemeState, 
      language, setLanguage: setLanguageState,
      isSystemSync, setIsSystemSync: setIsSystemSyncState,
      t
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

import React from 'react';
import { useTheme, Theme, Language } from '../../context/ThemeContext';
import { 
  Palette, 
  Languages, 
  Check, 
  Moon, 
  Sun, 
  Zap, 
  Trees,
  Monitor
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, setTheme, language, setLanguage, isSystemSync, setIsSystemSync, t } = useTheme();

  const themes: { id: Theme; name: string; icon: any; color: string }[] = [
    { id: 'light', name: 'Light', icon: Sun, color: 'bg-white' },
    { id: 'dark', name: 'Dark', icon: Moon, color: 'bg-gray-900' },
    { id: 'midnight', name: 'Midnight', icon: Zap, color: 'bg-slate-900' },
    { id: 'forest', name: 'Forest', icon: Trees, color: 'bg-emerald-900' },
  ];

  const languages: { id: Language; name: string; flag: string }[] = [
    { id: 'en', name: 'English', flag: '🇺🇸' },
    { id: 'hi', name: 'Hindi', flag: '🇮🇳' },
    { id: 'es', name: 'Spanish', flag: '🇪🇸' },
    { id: 'fr', name: 'French', flag: '🇫🇷' },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t('settings')}</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Customize your workspace appearance and language preference</p>
      </div>

      <div className="space-y-8">
        {/* Appearance Section */}
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-xl text-primary-600 dark:text-primary-400">
              <Palette className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('appearance')}</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => {
                  setIsSystemSync(false);
                  setTheme(tItem.id);
                }}
                className={`relative group flex flex-col items-center p-5 rounded-2xl border-2 transition-all ${
                  theme === tItem.id && !isSystemSync
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl ${tItem.color} shadow-lg flex items-center justify-center mb-3 border border-gray-200 dark:border-gray-700`}>
                  <tItem.icon className={`w-6 h-6 ${tItem.id === 'light' ? 'text-orange-500' : 'text-primary-400'}`} />
                </div>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{tItem.name}</span>
                {theme === tItem.id && !isSystemSync && (
                  <div className="absolute -top-2 -right-2 bg-primary-600 text-white rounded-full p-1 shadow-lg">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Language Section */}
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400">
              <Languages className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Language & Region</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languages.map((l) => (
              <button
                key={l.id}
                onClick={() => setLanguage(l.id)}
                className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all ${
                  language === l.id 
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/20' 
                    : 'border-gray-100 dark:border-gray-800 hover:border-primary-300 dark:hover:border-primary-700'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <span className="text-2xl">{l.flag}</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{l.name}</span>
                </div>
                {language === l.id && (
                  <Check className="w-5 h-5 text-primary-600" />
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Display Settings */}
        <section className="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
                <Monitor className="w-5 h-5 text-gray-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Sync with System</h3>
                <p className="text-xs text-gray-500">Automatically adjust theme based on device settings</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSystemSync(!isSystemSync)}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${
                isSystemSync ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${
                isSystemSync ? 'left-7' : 'left-1'
              }`}></div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

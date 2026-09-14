import { useLanguage } from '../../contexts/LanguageContext'

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
      className="relative group"
      aria-label={`Switch to ${language === 'pt' ? 'English' : 'Portuguese'}`}
      title={`Switch to ${language === 'pt' ? 'English' : 'Portuguese'}`}
    >
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all">
        {/* Brazil Flag for PT */}
        {language === 'pt' && (
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🇧🇷</span>
            <span className="text-xs font-semibold text-white">PT-BR</span>
          </div>
        )}
        
        {/* UK Flag for EN */}
        {language === 'en' && (
          <div className="flex items-center gap-2">
            <span className="text-lg" aria-hidden="true">🇬🇧</span>
            <span className="text-xs font-semibold text-white">English</span>
          </div>
        )}
      </div>
    </button>
  )
}

export default LanguageToggle

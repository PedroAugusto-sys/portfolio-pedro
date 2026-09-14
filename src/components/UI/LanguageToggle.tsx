import { useLanguage } from '../../contexts/LanguageContext'

const LanguageToggle = () => {
  const { language, setLanguage } = useLanguage()

  return (
    <button
      onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
      className="relative px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all group"
      aria-label={`Switch to ${language === 'pt' ? 'English' : 'Portuguese'}`}
      title={`Switch to ${language === 'pt' ? 'English' : 'Portuguese'}`}
    >
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold transition-all ${language === 'pt' ? 'text-white' : 'text-gray-500'}`}>
          PT
        </span>
        <div className="relative w-8 h-4 bg-gray-800 rounded-full border border-white/20">
          <div 
            className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all duration-300 ${
              language === 'en' ? 'left-4' : 'left-0.5'
            }`}
          />
        </div>
        <span className={`text-xs font-bold transition-all ${language === 'en' ? 'text-white' : 'text-gray-500'}`}>
          EN
        </span>
      </div>
    </button>
  )
}

export default LanguageToggle

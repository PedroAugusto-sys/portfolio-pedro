import { useState, useEffect, useRef } from 'react'
import { trackEvent } from '../../utils/analytics'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { useLanguage } from '../../contexts/LanguageContext'
import LanguageToggle from './LanguageToggle'

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('hero')
  const { scrollTo } = useSmoothScroll()
  const { t } = useLanguage()
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollTimeoutRef.current) {
        return
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolled(window.scrollY > 50)
        
        const sections = ['hero', 'about', 'projects', 'achievements', 'contact']
        const scrollPosition = window.scrollY + window.innerHeight / 3

        for (const sectionId of sections) {
          const element = document.getElementById(sectionId)
          if (element) {
            const { offsetTop, offsetHeight } = element
            if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
              setActiveSection(sectionId)
              break
            }
          }
        }
        
        scrollTimeoutRef.current = null
      }, 10)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    scrollTo(sectionId, { duration: 1.0, offset: -80 })
    trackEvent('navigation_click', 'navigation', sectionId)
    setIsMobileMenuOpen(false)
    setActiveSection(sectionId)
  }

  const navItems = [
    { id: 'about', label: t('nav.about') },
    { id: 'projects', label: t('nav.projects') },
    { id: 'achievements', label: t('nav.achievements') },
    { id: 'contact', label: t('nav.contact') },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-white/5 border-b border-white/10'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <div className="flex-shrink-0">
            <button
              onClick={() => scrollToSection('hero')}
              className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent hover:from-gray-100 hover:via-gray-300 hover:to-gray-500 transition-all"
            >
              Pedro Augusto
            </button>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-white/20 via-gray-400/20 to-gray-600/20 text-white border border-white/30'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <div className="ml-4">
                <LanguageToggle />
              </div>
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-gray-900/98 backdrop-blur-xl border-t border-white/10 shadow-lg">
          <div className="px-4 pt-3 pb-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`block px-5 py-3.5 rounded-xl text-base font-medium w-full text-left transition-all ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-white/20 via-gray-400/20 to-gray-600/20 text-white border border-white/30'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation

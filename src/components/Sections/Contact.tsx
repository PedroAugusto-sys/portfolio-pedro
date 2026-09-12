import { useEffect, useRef } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { trackSectionView } from '../../utils/analytics'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Contact = () => {
  const { elementRef, hasIntersected } = useIntersectionObserver({ 
    threshold: 0.2,
    rootMargin: '200px',
    persist: true
  })
  const contentRef = useRef<HTMLDivElement>(null)
  const animationsCreatedRef = useRef(false)

  useEffect(() => {
    if (hasIntersected) {
      trackSectionView('contact')
    }
  }, [hasIntersected])

  useEffect(() => {
    if (hasIntersected && contentRef.current && !animationsCreatedRef.current) {
      const titleElement = contentRef.current.querySelector('h2')
      if (titleElement) {
        gsap.set(titleElement, { opacity: 0, y: 30, scale: 0.9 })
        gsap.to(titleElement, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
          scrollTrigger: {
            trigger: titleElement,
            start: 'top 85%',
            toggleActions: 'play none none none',
            once: true,
          },
        })
      }

      const contactCards = contentRef.current.querySelectorAll('.contact-card')
      contactCards.forEach((card, index) => {
        gsap.set(card, { 
          opacity: 0, 
          y: 50, 
          scale: 0.8,
          rotationY: -15
        })
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationY: 0,
          duration: 0.7,
          delay: index * 0.15,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })
      })

      const icons = contentRef.current.querySelectorAll('.contact-icon')
      icons.forEach((icon, index) => {
        gsap.set(icon, { 
          opacity: 0, 
          scale: 0,
          rotation: -180
        })
        gsap.to(icon, {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.6,
          delay: index * 0.1 + 0.3,
          ease: 'elastic.out(1, 0.8)',
          scrollTrigger: {
            trigger: icon.closest('.contact-card'),
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })
      })

      animationsCreatedRef.current = true
    }
  }, [hasIntersected, elementRef])

  const contacts = [
    {
      id: 'github',
      label: 'GitHub',
      value: 'github.com/PedroAugusto-sys',
      href: 'https://github.com/PedroAugusto-sys',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      value: '+55 62 9 81843688',
      href: 'https://wa.me/5562981843688',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      ),
    },
    {
      id: 'email',
      label: 'Email',
      value: 'pedrocaandrade01@gmail.com',
      href: 'mailto:pedrocaandrade01@gmail.com',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      value: 'linkedin.com/in/pedro-augusto-ssyss/',
      href: 'https://linkedin.com/in/pedro-augusto-ssyss/',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
    },
  ]

  return (
    <section
      id="contact"
      ref={elementRef}
      className="relative min-h-screen py-24 px-4 sm:px-6 lg:px-8 overflow-visible"
    >
      <div ref={contentRef} className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            Entre em <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">Contato</span>
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-full mx-auto mb-6" />
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            Estou sempre aberto para novas oportunidades e conversas sobre projetos interessantes
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto mb-16">
          {contacts.map((contact) => (
            <a
              key={contact.id}
              href={contact.href}
              target={contact.id !== 'email' ? '_blank' : undefined}
              rel={contact.id !== 'email' ? 'noopener noreferrer' : undefined}
              className="contact-card group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-cyan-500/30 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/60 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform hover:scale-105 hover:-translate-y-2"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="contact-icon text-cyan-400 group-hover:text-blue-300 transition-colors duration-300">
                  {contact.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-300 group-hover:via-blue-300 group-hover:to-purple-300 group-hover:bg-clip-text transition-all">
                    {contact.label}
                  </h3>
                  <p className="text-gray-400 text-sm group-hover:text-gray-300 transition-colors break-all">
                    {contact.value}
                  </p>
                </div>
              </div>
              
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/10 blur-xl" />
            </a>
          ))}
        </div>

        <footer className="text-center border-t border-cyan-500/10 pt-8">
          <p className="text-gray-400 text-sm">
            © 2026 <span className="text-cyan-300 font-medium">Pedro Augusto Santos Andrade</span>. Todos os direitos reservados.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Desenvolvido com React, TypeScript, Three.js, GSAP e Tailwind CSS
          </p>
        </footer>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>
    </section>
  )
}

export default Contact

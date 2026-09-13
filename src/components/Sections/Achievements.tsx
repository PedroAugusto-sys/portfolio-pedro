import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '../../hooks/useGSAP'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { trackSectionView } from '../../utils/analytics'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Achievements = () => {
  const { elementRef, hasIntersected } = useIntersectionObserver({ 
    threshold: 0.2,
    rootMargin: '200px',
    persist: true
  })
  const { animateIn } = useGSAP()
  const animationsCreatedRef = useRef(false)
  const statsRefs = useRef<(HTMLDivElement | null)[]>([])
  const [displayValues, setDisplayValues] = useState<number[]>([0, 0, 0])

  useEffect(() => {
    if (hasIntersected) {
      trackSectionView('achievements')
    }
  }, [hasIntersected])

  useEffect(() => {
    if (hasIntersected && elementRef.current && !animationsCreatedRef.current) {
      const titleSection = elementRef.current.querySelector('h2')?.parentElement
      if (titleSection) {
        gsap.set(titleSection, { opacity: 0, y: 30 })
        gsap.to(titleSection, {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: titleSection,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })
      }

      const statsData = [
        { label: 'Projetos Completos', value: '10+' },
        { label: 'Tecnologias Dominadas', value: '15+' },
        { label: 'Anos de Experiência', value: '3+' },
      ]
      
      const setupStatsAnimation = () => {
        const validStatsRefs = statsRefs.current.filter(ref => ref !== null)
        
        if (validStatsRefs.length !== statsData.length) {
          setTimeout(setupStatsAnimation, 50)
          return
        }
        
        statsRefs.current.forEach((statElement, index) => {
          if (!statElement || !statsData[index]) return
          
          gsap.set(statElement, { opacity: 0, y: 30, scale: 0.9 })
          
          const targetValue = statsData[index].value
          const numValue = parseInt(targetValue.replace(/\D/g, ''))
          
          gsap.to(statElement, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            delay: 0.05 + index * 0.05,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: statElement,
              start: 'top 90%',
              toggleActions: 'play none none none',
              once: true,
              onEnter: () => {
                const obj = { value: 0 }
                gsap.to(obj, {
                  value: numValue,
                  duration: 2,
                  ease: 'power2.out',
                  onUpdate: () => {
                    setDisplayValues((prev) => {
                      const newValues = [...prev]
                      newValues[index] = Math.floor(obj.value)
                      return newValues
                    })
                  }
                })
              }
            },
          })
        })
      }
      
      setupStatsAnimation()

      const elements = elementRef.current.querySelectorAll('.animate-on-scroll')
      elements.forEach((el, index) => {
        gsap.set(el, { opacity: 0, x: -30 })
        gsap.to(el, {
          opacity: 1,
          x: 0,
          duration: 0.4,
          delay: 0.1 + index * 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })
      })

      animationsCreatedRef.current = true
    }
  }, [hasIntersected, animateIn, elementRef])

  const achievements = [
    {
      id: 1,
      title: 'Bacharel em Engenharia de Software',
      description: 'Formação completa em desenvolvimento de software, arquitetura de sistemas e gestão de projetos. Desenvolvendo soluções tecnológicas com qualidade e inovação.',
      year: '2025',
    },
    {
      id: 2,
      title: 'Analista QA Sênior',
      description: 'Promoção na Escolar Manager assumindo responsabilidades estratégicas em automação de testes e desenvolvimento de ferramentas internas para QA e outros setores.',
      year: '2023',
    },
    {
      id: 3,
      title: 'Início da Carreira',
      description: 'Suporte Técnico Nível 3 desenvolvendo scripts SQL, otimizando processos e construindo base sólida em resolução de problemas técnicos.',
      year: '2022',
    },
  ]

  const stats = [
    { label: 'Projetos Completos', value: '10+' },
    { label: 'Tecnologias Dominadas', value: '15+' },
    { label: 'Anos de Experiência', value: '3+' },
  ]

  return (
    <section
      id="achievements"
      ref={elementRef}
      className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-6xl mx-auto">
        {/* Título */}
        <div className="text-center mb-12 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Conquistas e <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Marcos</span>
          </h2>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto mb-4" />
          <p className="text-gray-400 text-base sm:text-lg max-w-2xl mx-auto">
            Principais conquistas profissionais e habilidades técnicas
          </p>
        </div>

        {/* Stats Cards */}
        <div className="flex justify-center mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
            {stats.map((stat, index) => (
              <div
                key={index}
                ref={(el) => {
                  statsRefs.current[index] = el
                }}
                className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 text-center animate-on-scroll 
                           transition-all duration-300 ease-out
                           hover:scale-105 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/20
                           cursor-pointer group"
              >
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2
                              transition-all duration-300 
                              group-hover:scale-110">
                  {displayValues[index]}{stat.value.replace(/\d+/g, '')}
                </div>
                <div className="text-gray-400 text-sm md:text-base
                              transition-colors duration-300 
                              group-hover:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline de Conquistas */}
        <div className="space-y-6 max-w-4xl mx-auto">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="flex gap-6 animate-on-scroll group cursor-pointer transition-all duration-300 ease-out hover:translate-x-2"
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold
                              transition-all duration-300 ease-out
                              group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-500/50">
                  {index + 1}
                </div>
                {index < achievements.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-700 mx-auto mt-2 transition-colors duration-300 group-hover:bg-purple-500/50" />
                )}
              </div>
              <div className="flex-1 pb-6 p-4 rounded-lg transition-all duration-300 ease-out hover:bg-gray-900/50 hover:shadow-lg">
                <div className="text-blue-400 text-sm font-semibold mb-1 transition-all duration-300 group-hover:text-purple-400">
                  {achievement.year}
                </div>
                <h3 className="text-xl font-bold text-white mb-2 transition-all duration-300 group-hover:text-blue-300">
                  {achievement.title}
                </h3>
                <p className="text-gray-400 transition-colors duration-300 group-hover:text-gray-300">
                  {achievement.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Achievements

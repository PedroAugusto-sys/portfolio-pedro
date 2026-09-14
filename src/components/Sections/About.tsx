import { useEffect, useRef } from 'react'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { trackSectionView } from '../../utils/analytics'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const About = () => {
  const { elementRef, hasIntersected } = useIntersectionObserver({ 
    threshold: 0.2,
    rootMargin: '200px',
    persist: true
  })
  const contentRef = useRef<HTMLDivElement>(null)
  const animationsCreatedRef = useRef(false)
  const skillsRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (hasIntersected) {
      trackSectionView('about')
    }
  }, [hasIntersected])

  useEffect(() => {
    if (hasIntersected && contentRef.current && !animationsCreatedRef.current) {
      const elements = elementRef.current?.querySelectorAll('.animate-on-scroll') || []
      
      elements.forEach((el, index) => {
        gsap.set(el, { opacity: 0, y: 60, x: index % 2 === 0 ? -30 : 30 })
        gsap.to(el, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.6,
          delay: 0.1 + index * 0.08,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })
      })

      const threeDElements = elementRef.current?.querySelectorAll('[class*="h-[600px]"], [class*="h-[700px]"], [class*="h-[800px]"], [class*="h-[900px]"], [class*="h-[1000px]"], [class*="h-[1100px]"]') || []
      threeDElements.forEach((el, index) => {
        gsap.set(el, { opacity: 0, scale: 0.85, rotationY: -20 })
        gsap.to(el, {
          opacity: 1,
          scale: 1,
          rotationY: 0,
          duration: 0.8,
          delay: 0.15 + index * 0.08,
          ease: 'elastic.out(1, 0.6)',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })

        gsap.to(el, {
          y: -50,
          rotationY: 5,
          duration: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          },
        })
      })

      animationsCreatedRef.current = true
    }
  }, [hasIntersected, elementRef])

  // Floating animation for skill chips
  useEffect(() => {
    if (!hasIntersected || !skillsRef.current || prefersReducedMotion) return

    const skillChips = skillsRef.current.querySelectorAll('.skill-chip')
    
    skillChips.forEach((chip, index) => {
      const delay = index * 0.1
      const duration = 3 + (index % 3) * 0.5
      const yOffset = 10 + (index % 4) * 3
      
      gsap.to(chip, {
        y: `+=${yOffset}`,
        duration: duration,
        delay: delay,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })

      gsap.to(chip, {
        rotateZ: (index % 2 === 0) ? 2 : -2,
        duration: duration * 1.2,
        delay: delay,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      })
    })
  }, [hasIntersected, prefersReducedMotion])

  const skillsGroups = {
    'Linguagens': ['Java', 'Python', 'C#', 'TypeScript', 'JavaScript'],
    'Frontend': ['React', 'Angular', 'HTML', 'SCSS', 'Tailwind CSS', 'Bootstrap', 'Three.js', 'GSAP'],
    'Backend': ['Spring Boot', 'Node.js', '.NET', 'FastAPI', 'JPA/Hibernate'],
    'QA & Automação': ['Selenium', 'Playwright', 'Test Automation', 'CI/CD'],
    'Dados': ['MongoDB', 'PostgreSQL', 'Pandas', 'Big Data', 'Streamlit', 'DBeaver'],
    'DevOps & Ferramentas': ['Docker', 'Git', 'GitHub', 'Vite', 'Swagger', 'ElectronJS', 'Jira', 'Slack', 'VS Code'],
  }

  return (
    <section
      id="about"
      ref={elementRef}
      className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="max-w-4xl mx-auto">
          <div ref={contentRef} className="space-y-8 relative z-10">
            <div className="animate-on-scroll">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                Sobre <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">Mim</span>
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-white via-gray-300 to-gray-500 rounded-full" />
            </div>

            <div className="animate-on-scroll space-y-5 text-gray-300 text-base sm:text-lg leading-relaxed">
              <p>
                <strong className="text-white">Engenheiro de Software</strong> formado pela Fatesg (conclusão em 2025) com
                sólida trajetória de <strong className="text-white">3 anos e 8 meses</strong> na Escolar Manager. Atuei como
                Suporte N1, N2 e N3 até o cargo de Engenheiro de Qualidade e
                Automação.
              </p>
              <p>
                Neste caminho, fui desenvolvendo uma visão crítica sobre
                o produto e garantindo entregas de alta qualidade que resolvem
                problemas reais do usuário.
              </p>
              <p>
                Possuo competências em <strong className="text-white">C#, React.js e automação</strong> no geral, com inglês
                fluente para atuação em times globais. Busco aplicar minha
                experiência em engenharia para escalar processos de testes,
                otimizar os ciclos de desenvolvimento e de atendimento ao cliente.
              </p>
            </div>

            <div className="animate-on-scroll flex justify-center mb-8">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-300 to-gray-500 rounded-full blur-xl opacity-40" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                  <img
                    src="/images/face.png"
                    alt="Pedro Augusto - Engenheiro de Software"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="animate-on-scroll space-y-6" ref={skillsRef}>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-2xl sm:text-3xl font-bold text-white">
                  Tecnologias
                </h3>
                <div className="h-1 flex-1 bg-gradient-to-r from-white/30 via-gray-400/30 to-gray-600/30 rounded-full" />
              </div>
              {Object.entries(skillsGroups).map(([category, skills]) => (
                <div key={category} className="space-y-3">
                  <h4 className="text-white font-semibold text-sm uppercase tracking-wider">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((skill, index) => (
                      <span
                        key={skill}
                        className="skill-chip px-4 py-2 bg-gradient-to-br from-white/20 via-gray-400/20 to-gray-600/20 text-white rounded-xl font-medium text-sm border border-white/20 backdrop-blur-sm shadow-lg hover:shadow-white/20 transition-shadow cursor-default"
                        style={{
                          animationDelay: `${index * 0.1}s`
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default About

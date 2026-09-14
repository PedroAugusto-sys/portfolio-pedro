import { useEffect, useRef } from 'react'
import ProjectCard from '../UI/ProjectCard'
import { useGSAP } from '../../hooks/useGSAP'
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'
import { trackSectionView } from '../../utils/analytics'
import { useLanguage } from '../../contexts/LanguageContext'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Projects = () => {
  const { t } = useLanguage()
  const { elementRef, hasIntersected } = useIntersectionObserver({ 
    threshold: 0.2,
    rootMargin: '200px',
    persist: true
  })
  const { animateIn } = useGSAP()
  const animationsCreatedRef = useRef(false)
  
  const projects = [
    {
      id: 6,
      titleKey: 'projects.project6.title',
      descriptionKey: 'projects.project6.description',
      technologies: ['Selenium', 'Playwright', 'Python', 'Java', 'Test Automation', 'CI/CD'],
      github: 'https://github.com/PedroAugusto-sys/qa_automacao',
      image: '/images/gears.jpeg',
      featured: true,
    },
    {
      id: 7,
      titleKey: 'projects.project7.title',
      descriptionKey: 'projects.project7.description',
      technologies: ['JavaScript', 'Tampermonkey', 'Userscript', 'Automação', 'QA'],
      github: 'https://github.com/PedroAugusto-sys/geradorRelatorioAutomaticoQA',
      image: '/images/qa-livro.jpg',
      featured: true,
    },
    {
      id: 2,
      titleKey: 'projects.project2.title',
      descriptionKey: 'projects.project2.description',
      technologies: ['Java', 'Spring Boot', 'JPA/Hibernate', 'PostgreSQL', 'Swagger', 'Docker'],
      github: 'https://github.com/PedroAugusto-sys/financas',
      image: '/images/dinheiro.jpg',
      featured: true,
    },
    {
      id: 11,
      titleKey: 'projects.project11.title',
      descriptionKey: 'projects.project11.description',
      technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Lucide React'],
      github: 'https://github.com/PedroAugusto-sys/ticket-flowZ',
      preview: 'https://ticketflowz.netlify.app/',
      image: '/images/projects/ticketflow-demo.gif',
      featured: true,
    },
    {
      id: 1,
      titleKey: 'projects.project1.title',
      descriptionKey: 'projects.project1.description',
      technologies: ['Java', 'TypeScript', 'Spring', 'React', 'HTML', 'SCSS'],
      github: 'https://github.com/Usales/EaDuck',
      preview: 'https://weaduck.netlify.app/',
      image: '/images/projects/eaduck-demo.gif',
      featured: true,
    },
    {
      id: 8,
      titleKey: 'projects.project8.title',
      descriptionKey: 'projects.project8.description',
      technologies: ['JavaScript', 'Chrome Extension', 'Manifest V3', 'HTML', 'CSS', 'Chrome APIs'],
      github: 'https://github.com/PedroAugusto-sys/mantis_notificator',
      image: '/images/timeline.png',
    },
    {
      id: 5,
      titleKey: 'projects.project5.title',
      descriptionKey: 'projects.project5.description',
      technologies: ['JavaScript', 'Chrome Extension', 'HTML', 'CSS', 'Chrome APIs'],
      github: 'https://github.com/PedroAugusto-sys/Assistente-Escolar',
      image: '/images/credencial.png',
    },
    {
      id: 4,
      titleKey: 'projects.project4.title',
      descriptionKey: 'projects.project4.description',
      technologies: ['Python', 'FastAPI', 'Streamlit', 'MongoDB', 'Pandas', 'Big Data'],
      github: 'https://github.com/PedroAugusto-sys/bigdata',
      image: '/images/educacional.png',
    },
    {
      id: 9,
      titleKey: 'projects.project9.title',
      descriptionKey: 'projects.project9.description',
      technologies: ['TypeScript', 'JavaScript', 'Node.js', 'Socket.IO', 'JWT', 'SQLite', 'HTML', 'CSS'],
      github: 'https://github.com/PedroAugusto-sys/sistema_mensageria_praempresa',
      image: '/images/bubble_speech.png',
    },
    {
      id: 3,
      titleKey: 'projects.project3.title',
      descriptionKey: 'projects.project3.description',
      technologies: ['Java', 'Spring Boot', 'Backend', 'API REST'],
      github: 'https://github.com/PedroAugusto-sys/Crust-Delivery',
      image: '/images/delivery.png',
    },
    {
      id: 10,
      titleKey: 'projects.project10.title',
      descriptionKey: 'projects.project10.description',
      technologies: ['Python', 'PySide6', 'JSON', 'Desktop'],
      github: 'https://github.com/PedroAugusto-sys/sistema-venda-py',
      image: '/images/dinheiro.jpg',
    },
  ]

  useEffect(() => {
    if (hasIntersected) {
      trackSectionView('projects')
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

      const cards = elementRef.current.querySelectorAll('.project-card')
      cards.forEach((card, index) => {
        gsap.set(card, { 
          opacity: 0, 
          y: 80, 
          scale: 0.85,
          rotationX: -15,
          rotationY: index % 2 === 0 ? -10 : 10
        })
        
        gsap.to(card, {
          opacity: 1,
          y: 0,
          scale: 1,
          rotationX: 0,
          rotationY: 0,
          duration: 0.8,
          delay: 0.1 + index * 0.08,
          ease: 'back.out(1.4)',
          scrollTrigger: {
            trigger: card,
            start: 'top 90%',
            toggleActions: 'play none none none',
            once: true,
          },
        })

        gsap.to(card, {
          y: -30,
          duration: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })
      animationsCreatedRef.current = true
    }
  }, [hasIntersected, animateIn, elementRef])

  const featuredProjects = projects.filter(p => p.featured)
  const otherProjects = projects.filter(p => !p.featured)

  return (
    <section
      id="projects"
      ref={elementRef}
      className="relative min-h-screen py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 bg-gradient-radial from-white/5 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
            {t('projects.title')} <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">{t('projects.title.highlight')}</span>
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-white via-gray-300 to-gray-500 rounded-full mx-auto mb-6" />
          <p className="text-gray-300 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto leading-relaxed">
            {t('projects.subtitle.impact')} <strong className="text-white">{t('projects.subtitle.qa')}</strong>, <strong className="text-white">{t('projects.subtitle.sdet')}</strong> {t('projects.subtitle.outro')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-24 items-stretch">
          {featuredProjects.map((project) => (
            <div key={project.id} className="project-card h-full flex">
              <ProjectCard
                title={t(project.titleKey)}
                description={t(project.descriptionKey)}
                technologies={project.technologies}
                github={project.github}
                preview={project.preview}
                image={project.image}
              />
            </div>
          ))}
        </div>

        {otherProjects.length > 0 && (
          <>
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                {t('projects.other')} <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">{t('projects.other.highlight')}</span>
              </h3>
              <div className="h-1 w-24 bg-gradient-to-r from-white/50 via-gray-300/50 to-gray-500/50 rounded-full mx-auto mb-4" />
              <p className="text-gray-400 text-sm sm:text-base">
                {t('projects.other.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {otherProjects.map((project) => (
                <div key={project.id} className="project-card h-full flex">
                  <ProjectCard
                    title={t(project.titleKey)}
                    description={t(project.descriptionKey)}
                    technologies={project.technologies}
                    github={project.github}
                    preview={project.preview}
                    image={project.image}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export default Projects

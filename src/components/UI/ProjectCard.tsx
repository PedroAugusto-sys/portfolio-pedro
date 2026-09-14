import { useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import { useLanguage } from '../../contexts/LanguageContext'

interface ProjectCardProps {
  title: string
  description: string
  image?: string
  technologies: string[]
  github?: string
  preview?: string
}

const ProjectCard = ({
  title,
  description,
  image,
  technologies,
  github,
  preview,
}: ProjectCardProps) => {
  const { t } = useLanguage()
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const prefersReducedMotion = usePrefersReducedMotion()

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || !cardRef.current) return

    const card = cardRef.current
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateX = ((y - centerY) / centerY) * -8
    const rotateY = ((x - centerX) / centerX) * 8

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px) scale(1.02)`
  }

  const handleMouseLeave = () => {
    if (prefersReducedMotion || !cardRef.current) return
    cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)'
  }

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        handleMouseLeave()
      }}
      className="group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-sm border border-white/20 rounded-2xl overflow-hidden hover:border-white/40 transition-all duration-300 flex flex-col w-full shadow-xl hover:shadow-2xl hover:shadow-white/20"
      style={{
        transformStyle: 'preserve-3d',
        transition: prefersReducedMotion ? 'none' : 'transform 0.1s ease-out, box-shadow 0.3s ease',
      }}
    >
        <div className="aspect-video bg-gradient-to-br from-gray-800/30 via-gray-800 to-gray-700/30 relative overflow-hidden flex-shrink-0">
        {image ? (
          <>
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              style={{
                transform: isHovered ? 'translateZ(20px)' : 'translateZ(0)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white/10 via-white/5 to-gray-400/10">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-white/20 to-gray-400/20 flex items-center justify-center border border-white/30">
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <p className="text-white/60 text-sm">{t('projects.placeholder')}</p>
            </div>
          </div>
        )}
        
        {/* Featured badge for special projects */}
        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-white via-gray-200 to-gray-400 rounded-full text-xs font-semibold text-black shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          {t('projects.featured')}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow relative">
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-gray-400/5 to-gray-600/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-b-2xl" />

        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 relative z-10 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-200 group-hover:to-gray-400 group-hover:bg-clip-text transition-all">
          {title}
        </h3>
        
        <p className="text-gray-300 mb-5 flex-grow leading-relaxed text-sm sm:text-base relative z-10">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-5 flex-shrink-0 relative z-10">
          {technologies.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 bg-gradient-to-r from-white/10 via-gray-400/10 to-gray-600/10 border border-white/20 text-white text-xs sm:text-sm rounded-lg font-medium backdrop-blur-sm hover:border-white/40 transition-colors"
            >
              {tech}
            </span>
          ))}
          {technologies.length > 4 && (
            <span className="px-3 py-1.5 text-white/60 text-xs sm:text-sm font-medium">
              +{technologies.length - 4}
            </span>
          )}
        </div>
        
        <div className="flex gap-3 flex-shrink-0 mt-auto relative z-10">
          {preview && (
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-5 py-3 bg-gradient-to-r from-white via-gray-200 to-gray-400 hover:from-gray-100 hover:via-gray-300 hover:to-gray-500 text-black font-semibold text-sm sm:text-base rounded-xl transition-all text-center shadow-lg hover:shadow-xl hover:shadow-white/30 transform hover:scale-105 active:scale-95"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                {t('projects.demo')}
              </span>
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-5 py-3 border-2 border-white/30 hover:border-white/60 hover:bg-white/10 text-white font-semibold text-sm sm:text-base rounded-xl transition-all text-center backdrop-blur-sm"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                {t('projects.code')}
              </span>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard

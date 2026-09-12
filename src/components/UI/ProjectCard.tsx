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
  return (
    <div className="group relative bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-300 transform hover:scale-[1.02] flex flex-col w-full shadow-lg">
      <div className="aspect-video bg-gradient-to-br from-gray-800 via-gray-800/90 to-gray-900 relative overflow-hidden flex-shrink-0">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-500/10 via-primary-500/5 to-transparent">
            <div className="text-center p-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-primary-500/20 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-primary-400"
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
              <p className="text-gray-400 text-sm">Imagem do projeto</p>
            </div>
          </div>
        )}
        {/* Overlay sutil para melhor contraste */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/20 pointer-events-none" />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4 flex-grow leading-relaxed">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4 flex-shrink-0">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="px-2.5 py-1 bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs rounded-md font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
        <div className="flex gap-3 flex-shrink-0 mt-auto">
          {preview && (
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium text-sm rounded-lg transition-all text-center shadow-sm hover:shadow-md"
            >
              Demo
            </a>
          )}
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-4 py-2.5 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/50 text-gray-300 font-medium text-sm rounded-lg transition-all text-center"
            >
              Código
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectCard

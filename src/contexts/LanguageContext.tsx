import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'pt' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  pt: {
    // Navigation
    'nav.about': 'Sobre',
    'nav.achievements': 'Feitos',
    'nav.projects': 'Projetos',
    'nav.contact': 'Contato',
    
    // Hero
    'hero.available': 'Disponível para Oportunidades',
    'hero.greeting': 'Olá, eu sou o',
    'hero.fullName': 'Pedro Augusto Santos Andrade',
    'hero.role1': 'QA Automation',
    'hero.role2': 'SDET',
    'hero.role3': 'Engenheiro de Software',
    'hero.description': 'Desenvolvedor Full Stack com foco em Engenharia de Qualidade, Trajetória multidisciplinar em Automação de QA, SDET e Suporte Técnico.',
    'hero.cta.projects': 'Ver Projetos',
    'hero.cta.contact': 'Entre em Contato',
    
    // About
    'about.title': 'Sobre',
    'about.title.highlight': 'Mim',
    'about.intro': 'Engenheiro de Software formado pela Fatesg (conclusão em 2025) com sólida trajetória de',
    'about.experience': '3 anos e 8 meses',
    'about.company': 'na Escolar Manager. Atuei como Suporte N1, N2 e N3 até o cargo de Engenheiro de Qualidade e Automação.',
    'about.skills.intro': 'Possuo competências em',
    'about.skills.list': 'C#, React.js e automação',
    'about.skills.outro': 'no geral, com inglês fluente para atuação em times globais. Busco aplicar minha experiência em engenharia para escalar processos de testes, otimizar os ciclos de desenvolvimento e de atendimento ao cliente.',
    'about.skills.development': 'Desenvolvimento',
    'about.skills.qa': 'Tecnologias',
    'about.skills.infrastructure': 'Infraestrutura',
    
    // Achievements
    'achievements.title': 'Conquistas e',
    'achievements.title.highlight': 'Marcos',
    'achievements.subtitle': 'Principais conquistas profissionais e habilidades técnicas',
    'achievements.projects': 'Projetos Completos',
    'achievements.technologies': 'Tecnologias Dominadas',
    'achievements.years': 'Anos de Experiência',
    'achievements.bachelor': 'Bacharel em Engenharia de Software',
    'achievements.bachelor.desc': 'Formação completa em desenvolvimento de software, arquitetura de sistemas e gestão de projetos. Desenvolvendo soluções tecnológicas com qualidade e inovação.',
    'achievements.senior': 'Analista QA Sênior',
    'achievements.senior.desc': 'Promoção na Escolar Manager assumindo responsabilidades estratégicas em automação de testes e desenvolvimento de ferramentas internas para QA e outros setores.',
    'achievements.career': 'Início da Carreira',
    'achievements.career.desc': 'Suporte Técnico Nível 3 desenvolvendo scripts SQL, otimizando processos e construindo base sólida em resolução de problemas técnicos.',
    
    // Projects
    'projects.title': 'Projetos',
    'projects.title.highlight': 'em Destaque',
    'projects.subtitle.impact': 'Seleção dos meus trabalhos mais impactantes em',
    'projects.subtitle.qa': 'QA Automation',
    'projects.subtitle.sdet': 'SDET',
    'projects.subtitle.outro': 'e desenvolvimento full stack',
    'projects.other': 'Outros',
    'projects.other.highlight': 'Projetos',
    'projects.other.subtitle': 'Trabalhos adicionais e experimentos',
    'projects.featured': 'Destaque',
    'projects.demo': 'Ver Demo',
    'projects.code': 'Ver Código',
    'projects.placeholder': 'Projeto',
    
    // Contact
    'contact.title': 'Entre em',
    'contact.title.highlight': 'Contato',
    'contact.subtitle': 'Estou sempre aberto para novas oportunidades e conversas sobre projetos interessantes',
    'contact.footer': '© 2026',
    'contact.footer.name': 'Pedro Augusto Santos Andrade',
    'contact.footer.rights': '. Todos os direitos reservados.',
    
    // Loader
    'loader.loading': 'Carregando',
    'loader.simplified': 'Carregando versão simplificada',
    'loader.preparing': 'Preparando experiência 3D',
    'loader.resources': 'Carregando recursos...',
  },
  en: {
    // Navigation
    'nav.about': 'About',
    'nav.achievements': 'Achievements',
    'nav.projects': 'Projects',
    'nav.contact': 'Contact',
    
    // Hero
    'hero.available': 'Available for Opportunities',
    'hero.greeting': 'Hi, I\'m',
    'hero.fullName': 'Pedro Augusto Santos Andrade',
    'hero.role1': 'QA Automation',
    'hero.role2': 'SDET',
    'hero.role3': 'Software Engineer',
    'hero.description': 'Full Stack Developer focused on Quality Engineering. Multidisciplinary background in QA Automation, SDET, and Technical Support.',
    'hero.cta.projects': 'View Projects',
    'hero.cta.contact': 'Get in Touch',
    
    // About
    'about.title': 'About',
    'about.title.highlight': 'Me',
    'about.intro': 'Software Engineer graduated from Fatesg (completed in 2025) with a solid track record of',
    'about.experience': '3 years and 8 months',
    'about.company': 'at Escolar Manager. I worked as N1, N2, and N3 Support up to the role of Quality and Automation Engineer.',
    'about.skills.intro': 'I have expertise in',
    'about.skills.list': 'C#, React.js, and automation',
    'about.skills.outro': 'overall, with fluent English for working with global teams. I seek to apply my engineering experience to scale testing processes, optimize development cycles, and improve customer support.',
    'about.skills.development': 'Development',
    'about.skills.qa': 'Technologies',
    'about.skills.infrastructure': 'Infrastructure',
    
    // Achievements
    'achievements.title': 'Achievements &',
    'achievements.title.highlight': 'Milestones',
    'achievements.subtitle': 'Key professional achievements and technical skills',
    'achievements.projects': 'Completed Projects',
    'achievements.technologies': 'Technologies Mastered',
    'achievements.years': 'Years of Experience',
    'achievements.bachelor': 'Bachelor in Software Engineering',
    'achievements.bachelor.desc': 'Complete training in software development, system architecture, and project management. Developing technological solutions with quality and innovation.',
    'achievements.senior': 'Senior QA Analyst',
    'achievements.senior.desc': 'Promotion at Escolar Manager taking on strategic responsibilities in test automation and development of internal tools for QA and other sectors.',
    'achievements.career': 'Career Start',
    'achievements.career.desc': 'Level 3 Technical Support developing SQL scripts, optimizing processes, and building a solid foundation in technical problem-solving.',
    
    // Projects
    'projects.title': 'Featured',
    'projects.title.highlight': 'Projects',
    'projects.subtitle.impact': 'Selection of my most impactful work in',
    'projects.subtitle.qa': 'QA Automation',
    'projects.subtitle.sdet': 'SDET',
    'projects.subtitle.outro': 'and full stack development',
    'projects.other': 'Other',
    'projects.other.highlight': 'Projects',
    'projects.other.subtitle': 'Additional work and experiments',
    'projects.featured': 'Featured',
    'projects.demo': 'View Demo',
    'projects.code': 'View Code',
    'projects.placeholder': 'Project',
    
    // Contact
    'contact.title': 'Get in',
    'contact.title.highlight': 'Touch',
    'contact.subtitle': 'I\'m always open to new opportunities and conversations about interesting projects',
    'contact.footer': '© 2026',
    'contact.footer.name': 'Pedro Augusto Santos Andrade',
    'contact.footer.rights': '. All rights reserved.',
    
    // Loader
    'loader.loading': 'Loading',
    'loader.simplified': 'Loading simplified version',
    'loader.preparing': 'Preparing 3D experience',
    'loader.resources': 'Loading resources...',
  },
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('pt')

  // Load from localStorage after mount (client-side only)
  useEffect(() => {
    const stored = localStorage.getItem('portfolio-language')
    if (stored === 'en') {
      setLanguageState('en')
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('portfolio-language', lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key
  }

  useEffect(() => {
    // Update document lang attribute
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}

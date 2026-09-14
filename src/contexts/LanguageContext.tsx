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
    
    // Project 1 - EaDuck
    'projects.project1.title': 'EaDuck',
    'projects.project1.description': 'Plataforma educacional para gestão de ensino a distância com cadastro de usuários, salas, tarefas e avaliações. Demo pública disponível apenas com login (sem cadastro aberto).',
    
    // Project 2 - API de Controle Financeiro
    'projects.project2.title': 'API de Controle Financeiro',
    'projects.project2.description': 'API REST completa para gerenciamento financeiro pessoal e em grupos. Permite cadastro de pessoas, grupos, metas financeiras, lançamentos (entradas e saídas) e geração de relatórios detalhados. Desenvolvida com Spring Boot, inclui documentação Swagger e suporte para PostgreSQL em produção.',
    
    // Project 3 - Crust-Delivery
    'projects.project3.title': 'Crust-Delivery',
    'projects.project3.description': 'Sistema de delivery desenvolvido como projeto integrador do 6° período do SENAI. Plataforma completa para gestão de entregas com backend em Java, incluindo gerenciamento de pedidos, rotas e dados de entrega. Projeto acadêmico focado em aplicação prática de conceitos de desenvolvimento de software.',
    
    // Project 4 - Sistema de Análise Educacional
    'projects.project4.title': 'Sistema de Análise Educacional',
    'projects.project4.description': 'Solução completa para monitoramento e análise de dados educacionais com backend em FastAPI e frontend em Streamlit. Sistema de Big Data que oferece visualização de desempenho acadêmico, controle de frequência, acompanhamento de tarefas e monitoramento de comunicações. Inclui pipeline ETL com Pandas para processamento e transformação de dados educacionais.',
    
    // Project 5 - Assistente de Produtividade Interno
    'projects.project5.title': 'Assistente de Produtividade Interno',
    'projects.project5.description': 'Extensão do Chrome desenvolvida para automatizar tarefas repetitivas no sistema EscolarManager. Permite que usuários autorizados configurem acesso seguro via tokens locais, eliminando a necessidade de inserir credenciais manualmente a cada sessão. Focado em produtividade e usabilidade, com armazenamento local seguro, interface intuitiva e atalho de teclado para ativação rápida.',
    
    // Project 6 - Automação de QA
    'projects.project6.title': 'Automação de QA',
    'projects.project6.description': 'Projeto de automação de testes de qualidade de software desenvolvido para otimizar processos de validação e garantir a qualidade dos produtos. Inclui frameworks de automação, scripts de teste e integração com pipelines de CI/CD para execução contínua de testes.',
    
    // Project 7 - Gerador de Relatório Automático QA
    'projects.project7.title': 'Gerador de Relatório Automático QA',
    'projects.project7.description': 'Userscript para Tampermonkey que automatiza a criação de chamados no Mantis a partir do Escolar Manager. Inclui botão flutuante arrastável, popup interativo com fluxo passo a passo, captura automática de dados da página, seleção múltipla de clientes com pesquisa e preenchimento automático de formulários no Mantis. Otimiza fluxos de trabalho de QA com interface intuitiva e tratamento de erros.',
    
    // Project 8 - Mantis Timeline Monitor
    'projects.project8.title': 'Mantis Timeline Monitor',
    'projects.project8.description': 'Extensão para Chrome (Manifest V3) que monitora a "Linha do Tempo" do Mantis e notifica o usuário sobre novas atividades. Inclui monitoramento automático a cada minuto, notificações do sistema, filtro por usuário, histórico de notificações ilimitado, interface popup para controle e modal de configuração inicial. Desenvolvida para otimizar o acompanhamento de atividades no Mantis Bug Tracker.',
    
    // Project 9 - Sistema de Mensageria Local
    'projects.project9.title': 'Sistema de Mensageria Local',
    'projects.project9.description': 'Sistema completo de mensageria para rede local com funcionalidades avançadas de chat em tempo real. Inclui autenticação JWT, chat em tempo real via Socket.IO, criação de grupos, upload de arquivos e imagens, fotos de perfil personalizáveis, edição e exclusão de mensagens, indicadores de leitura, busca de conversas e interface responsiva. Desenvolvido com TypeScript, Node.js e SQLite para comunicação interna em empresas.',
    
    // Project 10 - Sistema de Vendas (Local)
    'projects.project10.title': 'Sistema de Vendas (Local)',
    'projects.project10.description': 'Sistema de vendas local em Python com interface PySide6. Permite cadastrar produtos, clientes e registrar vendas. Dados persistidos em JSON (products.json e clients.json), com estrutura organizada em managers, models, relatórios e interface gráfica. Requer Python 3.10+ e roda em Windows, macOS ou Linux.',
    
    // Project 11 - TicketFlow & MailGen
    'projects.project11.title': 'TicketFlow & MailGen',
    'projects.project11.description': 'SPA React + Tailwind para gestão de tickets (CRUD em localStorage) e gerador de e-mails low-code. Funcionalidades: lista de tickets com filtro por status (Aberto, Pendente, Resolvido), criar/editar/excluir tickets, gerador de e-mail com templates customizáveis (técnico/humano) e gerenciamento de templates via interface.',
    
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
    
    // Project 1 - EaDuck
    'projects.project1.title': 'EaDuck',
    'projects.project1.description': 'Educational platform for distance learning management with user registration, classrooms, assignments, and assessments. Public demo available with login only (no open registration).',
    
    // Project 2 - Financial Control API
    'projects.project2.title': 'Financial Control API',
    'projects.project2.description': 'Complete REST API for personal and group financial management. Features user registration, groups, financial goals, transactions (income and expenses), and detailed report generation. Built with Spring Boot, includes Swagger documentation and PostgreSQL support in production.',
    
    // Project 3 - Crust-Delivery
    'projects.project3.title': 'Crust-Delivery',
    'projects.project3.description': 'Delivery system developed as an integrative project for the 6th semester at SENAI. Complete platform for delivery management with Java backend, including order management, routes, and delivery data. Academic project focused on practical application of software development concepts.',
    
    // Project 4 - Educational Analysis System
    'projects.project4.title': 'Educational Analysis System',
    'projects.project4.description': 'Complete solution for monitoring and analyzing educational data with FastAPI backend and Streamlit frontend. Big Data system offering academic performance visualization, attendance tracking, task monitoring, and communication oversight. Includes ETL pipeline with Pandas for processing and transforming educational data.',
    
    // Project 5 - Internal Productivity Assistant
    'projects.project5.title': 'Internal Productivity Assistant',
    'projects.project5.description': 'Chrome extension developed to automate repetitive tasks in the EscolarManager system. Allows authorized users to configure secure access via local tokens, eliminating the need to manually enter credentials each session. Focused on productivity and usability, with secure local storage, intuitive interface, and keyboard shortcut for quick activation.',
    
    // Project 6 - QA Automation
    'projects.project6.title': 'QA Automation',
    'projects.project6.description': 'Software quality test automation project developed to optimize validation processes and ensure product quality. Includes automation frameworks, test scripts, and CI/CD pipeline integration for continuous test execution.',
    
    // Project 7 - Automatic QA Report Generator
    'projects.project7.title': 'Automatic QA Report Generator',
    'projects.project7.description': 'Tampermonkey userscript that automates ticket creation in Mantis from Escolar Manager. Features draggable floating button, interactive popup with step-by-step flow, automatic page data capture, multiple client selection with search, and automatic Mantis form filling. Optimizes QA workflows with intuitive interface and error handling.',
    
    // Project 8 - Mantis Timeline Monitor
    'projects.project8.title': 'Mantis Timeline Monitor',
    'projects.project8.description': 'Chrome extension (Manifest V3) that monitors the Mantis "Timeline" and notifies users about new activities. Features automatic monitoring every minute, system notifications, user filtering, unlimited notification history, popup interface for control, and initial setup modal. Developed to optimize activity tracking in Mantis Bug Tracker.',
    
    // Project 9 - Local Messaging System
    'projects.project9.title': 'Local Messaging System',
    'projects.project9.description': 'Complete messaging system for local networks with advanced real-time chat features. Includes JWT authentication, real-time chat via Socket.IO, group creation, file and image uploads, customizable profile photos, message editing and deletion, read receipts, conversation search, and responsive interface. Built with TypeScript, Node.js, and SQLite for internal company communication.',
    
    // Project 10 - Sales System (Local)
    'projects.project10.title': 'Sales System (Local)',
    'projects.project10.description': 'Local sales system in Python with PySide6 interface. Allows product and customer registration and sales recording. Data persisted in JSON (products.json and clients.json), with organized structure in managers, models, reports, and graphical interface. Requires Python 3.10+ and runs on Windows, macOS, or Linux.',
    
    // Project 11 - TicketFlow & MailGen
    'projects.project11.title': 'TicketFlow & MailGen',
    'projects.project11.description': 'React SPA + Tailwind for ticket management (CRUD in localStorage) and low-code email generator. Features: ticket list with status filtering (Open, Pending, Resolved), create/edit/delete tickets, email generator with customizable templates (technical/friendly), and template management via interface.',
    
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

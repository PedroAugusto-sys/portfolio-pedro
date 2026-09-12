import { lazy, Suspense, useEffect, useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { Loader } from '@react-three/drei'
import Navigation from './components/UI/Navigation'
import LoadingScreen from './components/UI/LoadingScreen'
import GoogleAnalytics from './components/Analytics/GoogleAnalytics'
import TagManager from './components/Analytics/TagManager'
import GlobalBackground3D from './components/ThreeJS/GlobalBackground3D'
import { generateStructuredData } from './utils/seo'

const Hero = lazy(() => import('./components/Sections/Hero'))
const About = lazy(() => import('./components/Sections/About'))
const Projects = lazy(() => import('./components/Sections/Projects'))
const Achievements = lazy(() => import('./components/Sections/Achievements'))
const Contact = lazy(() => import('./components/Sections/Contact'))

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    const structuredData = generateStructuredData({
      name: 'Pedro Augusto Santos Andrade',
      description: 'Engenheiro de Software - QA Automation, SDET e Desenvolvedor Full Stack. Especializado em automação de testes, qualidade de software e desenvolvimento com React, TypeScript, Java e Python.',
      url: import.meta.env.VITE_SITE_URL || window.location.origin,
    })

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify(structuredData)
    document.head.appendChild(script)

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [])

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <GoogleAnalytics />
      <TagManager />
      {isLoading ? (
        <LoadingScreen onLoaded={() => {
          setIsLoading(false)
          setTimeout(() => setShowContent(true), 1000)
        }} />
      ) : showContent ? (
        <div className="min-h-screen bg-black text-white relative">
          <GlobalBackground3D />
          <Navigation />
          <main className="relative z-10 overflow-visible">
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Carregando...</div>}>
              <Hero />
              <About />
              <Projects />
              <Achievements />
              <Contact />
            </Suspense>
          </main>
          <Loader />
        </div>
      ) : null}
    </Router>
  )
}

export default App

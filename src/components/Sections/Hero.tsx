import { useEffect, useRef, useState, Suspense } from 'react'
import Scene3D from '../ThreeJS/Scene3D'
import Character3D from '../ThreeJS/Character3D'
import { trackSectionView } from '../../utils/analytics'
import { useSmoothScroll } from '../../hooks/useSmoothScroll'
import { useTypingAnimation } from '../../hooks/useTypingAnimation'
import { useMobile } from '../../hooks/useMobile'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const character3DRef = useRef<HTMLDivElement>(null)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const { scrollTo } = useSmoothScroll()
  const isMobile = useMobile()
  
  const [greeting, setGreeting] = useState('')
  const [showNameAnimation, setShowNameAnimation] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  
  const typedName = useTypingAnimation({
    texts: ['Predo', 'Pedro'],
    typingSpeed: 150,
    deletingSpeed: 80,
    pauseTime: 1500,
    repeat: true,
  })

  useEffect(() => {
    const greetingText = 'Olá, eu sou o '
    let currentIndex = 0

    const typingInterval = setInterval(() => {
      if (currentIndex < greetingText.length) {
        setGreeting(greetingText.substring(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(typingInterval)
        setShowNameAnimation(true)
      }
    }, 100)

    return () => clearInterval(typingInterval)
  }, [])

  useEffect(() => {
    trackSectionView('hero')
    
    const timer = setTimeout(() => {
      if (titleRef.current && subtitleRef.current && ctaRef.current) {
        gsap.set([titleRef.current, subtitleRef.current, ctaRef.current], {
          opacity: 0,
          y: 30,
          force3D: true,
        })
        
        if (character3DRef.current) {
          gsap.set(character3DRef.current, { 
            opacity: 0, 
            scale: 1.0,
            force3D: true,
          })
        }

        const tl = gsap.timeline({
          defaults: {
            ease: 'power2.out',
            force3D: true,
          },
        })

        tl.to([titleRef.current, subtitleRef.current, ctaRef.current], {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.1,
        })

        if (character3DRef.current) {
          tl.to(
            character3DRef.current,
            {
              opacity: 1,
              scale: 1.4,
              duration: 1,
              ease: 'power2.out',
            },
            '-=0.3'
          )
        }

        tl.call(() => {
          if (titleRef.current) {
            gsap.set(titleRef.current, { opacity: 1, y: 0 })
            gsap.set(titleRef.current, { clearProps: 'transform,will-change' })
          }
          if (subtitleRef.current) {
            gsap.set(subtitleRef.current, { opacity: 1, y: 0 })
            gsap.set(subtitleRef.current, { clearProps: 'transform,will-change' })
          }
          if (ctaRef.current) {
            gsap.set(ctaRef.current, { opacity: 1, y: 0 })
            gsap.set(ctaRef.current, { clearProps: 'transform,will-change' })
          }
          if (character3DRef.current) {
            gsap.set(character3DRef.current, { opacity: 1, scale: 1.4 })
          }
        })
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  // Cálculo de scroll otimizado com GSAP ScrollTrigger
  useEffect(() => {
    if (!heroRef.current) return

    let scrollTriggerInstance: gsap.core.Tween | null = null
    let rafId: number | null = null

    // Função para calcular o progresso do scroll manualmente
    const calculateScrollProgress = (): number => {
      if (!heroRef.current) return 0

      const rect = heroRef.current.getBoundingClientRect()
      const sectionHeight = heroRef.current.offsetHeight || window.innerHeight
      const viewportHeight = window.innerHeight
      
      // Calcular progresso baseado na posição da seção na viewport
      // Quando o topo da seção está no topo da viewport: progress = 0
      // Quando o bottom da seção está no topo da viewport: progress = 1
      // Progresso varia de 0 a 1 enquanto a seção está visível
      
      if (rect.bottom < 0) {
        // Já saiu completamente
        return 1
      } else if (rect.top > viewportHeight) {
        // Ainda não entrou na viewport
        return 0
      } else {
        // Está na viewport - calcular progresso baseado em quanto já scrollou
        // Quando top = 0 (topo no topo da viewport): progress = 0
        // Quando top = -sectionHeight (bottom no topo da viewport): progress = 1
        // Usar Math.max(0, rect.top) para garantir que só comece quando a seção entrar na viewport
        const scrolled = Math.max(0, -rect.top) // Quanto mais negativo, mais scrollou
        const totalScrollable = sectionHeight
        const progress = Math.max(0, Math.min(1, scrolled / totalScrollable))
        return progress
      }
    }

    // Handler de scroll usando requestAnimationFrame para throttling
    const handleScroll = () => {
      if (rafId !== null) return // Evita múltiplas chamadas simultâneas
      
      rafId = requestAnimationFrame(() => {
        const progress = calculateScrollProgress()
        setScrollProgress(progress)
        rafId = null
      })
    }
    
    // Forçar atualização inicial
    const initialProgress = calculateScrollProgress()
    setScrollProgress(initialProgress)

    // Configurar ScrollTrigger com delay para garantir que o DOM esteja pronto
    const setupScrollTrigger = () => {
      if (!heroRef.current) return

      // Mata qualquer instância anterior
      if (scrollTriggerInstance?.scrollTrigger) {
        scrollTriggerInstance.scrollTrigger.kill()
      }
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
      }

      scrollTriggerInstance = gsap.to({}, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.5, // Suavização do scroll (0 = instantâneo, 1 = mais suave)
          invalidateOnRefresh: true,
          refreshPriority: 1,
          onUpdate: (self) => {
            const progress = self.progress
            setScrollProgress(progress)
          },
        },
      })

      // Força refresh do ScrollTrigger
      ScrollTrigger.refresh()
    }

    // Usar listener de scroll como método principal
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Calcular valor inicial

    // Aguardar um pouco para garantir que o DOM esteja totalmente renderizado
    const timeoutId = setTimeout(() => {
      setupScrollTrigger()
      // Forçar atualização após ScrollTrigger ser configurado
      handleScroll()
    }, 200)

    // Recalcular quando a janela for redimensionada
    const handleResize = () => {
      ScrollTrigger.refresh()
      handleScroll() // Recalcular progresso após resize
    }
    window.addEventListener('resize', handleResize, { passive: true })

    return () => {
      clearTimeout(timeoutId)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      if (scrollTriggerInstance?.scrollTrigger) {
        scrollTriggerInstance.scrollTrigger.kill()
      }
      if (scrollTriggerInstance) {
        scrollTriggerInstance.kill()
      }
    }
  }, [])

  // Bloquear resize do canvas durante scroll e zoom
  useEffect(() => {
    const canvasContainer = canvasContainerRef.current
    if (!canvasContainer) return

    let cleanupFunctions: (() => void)[] = []
    let checkCanvasInterval: ReturnType<typeof setInterval> | null = null

    const applyFixedCanvasSize = (canvas: HTMLCanvasElement) => {
      // Obtém o tamanho do container
      const rect = canvasContainer.getBoundingClientRect()
      const width = rect.width
      const height = rect.height
      
      // Define tamanho fixo no canvas
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.style.minWidth = `${width}px`
      canvas.style.maxWidth = `${width}px`
      canvas.style.minHeight = `${height}px`
      canvas.style.maxHeight = `${height}px`
      
      // Bloqueia eventos de wheel que causam zoom (Ctrl+Scroll)
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
      
      canvas.addEventListener('wheel', handleWheel, { passive: false })
      cleanupFunctions.push(() => {
        canvas.removeEventListener('wheel', handleWheel)
      })
      
      // Bloqueia eventos de touch que causam zoom (pinch)
      const handleTouch = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault()
          e.stopPropagation()
        }
      }
      
      canvas.addEventListener('touchstart', handleTouch, { passive: false })
      canvas.addEventListener('touchmove', handleTouch, { passive: false })
      cleanupFunctions.push(() => {
        canvas.removeEventListener('touchstart', handleTouch)
        canvas.removeEventListener('touchmove', handleTouch)
      })
    }

    const setupCanvas = () => {
      const canvas = canvasContainer.querySelector('canvas')
      if (canvas) {
        applyFixedCanvasSize(canvas)
        return true
      }
      return false
    }

    // Tenta imediatamente
    if (!setupCanvas()) {
      // Aguarda o canvas ser criado
      checkCanvasInterval = setInterval(() => {
        if (setupCanvas()) {
          if (checkCanvasInterval) {
            clearInterval(checkCanvasInterval)
            checkCanvasInterval = null
          }
        }
      }, 100)
    }

    // Observa mudanças de tamanho do container para manter canvas fixo
    const resizeObserver = new ResizeObserver(() => {
      const canvas = canvasContainer.querySelector('canvas')
      if (canvas) {
        const rect = canvasContainer.getBoundingClientRect()
        const width = rect.width
        const height = rect.height
        
        canvas.style.width = `${width}px`
        canvas.style.height = `${height}px`
        canvas.style.minWidth = `${width}px`
        canvas.style.maxWidth = `${width}px`
        canvas.style.minHeight = `${height}px`
        canvas.style.maxHeight = `${height}px`
      }
    })

    resizeObserver.observe(canvasContainer)

    return () => {
      if (checkCanvasInterval) {
        clearInterval(checkCanvasInterval)
      }
      resizeObserver.disconnect()
      cleanupFunctions.forEach(cleanup => cleanup())
      cleanupFunctions = []
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    scrollTo(sectionId, { duration: 1.0, offset: -80 })
  }

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div className="space-y-4 md:space-y-6 order-2 md:order-1 relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
              <span className="text-sm font-medium text-primary-400">Disponível para oportunidades</span>
            </div>
            <h1
              ref={titleRef}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight"
            >
              {greeting}
              {showNameAnimation && (
                <span className="text-primary-400">
                  {typedName}
                  <span className="animate-pulse">|</span>
                </span>
              )}
              {!showNameAnimation && greeting && (
                <span className="animate-pulse">|</span>
              )}
            </h1>
            <p
              ref={subtitleRef}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-400 px-2 max-w-2xl"
            >
              Desenvolvedor Full Stack com foco em Engenharia de Qualidade e
              trajetória multidisciplinar em Automação de QA e Suporte Técnico.
            </p>
            <div 
              ref={ctaRef} 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center relative z-30"
            >
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  scrollToSection('contact')
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-primary-500 text-white rounded-lg font-semibold hover:bg-primary-600 active:bg-primary-700 transition-all transform hover:scale-105 active:scale-95 text-sm sm:text-base relative z-30 touch-manipulation shadow-lg shadow-primary-500/25"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Entrar em Contato
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  scrollToSection('projects')
                }}
                onTouchStart={(e) => {
                  e.stopPropagation()
                }}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 border border-gray-700 text-gray-300 rounded-lg font-semibold hover:border-gray-600 hover:bg-gray-800/50 active:bg-gray-800 transition-all text-sm sm:text-base relative z-30 touch-manipulation"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                Ver Projetos
              </button>
            </div>
          </div>

          <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[800px] w-full flex items-end justify-center pb-4 sm:pb-8 md:pb-12 order-1 md:order-2" style={{ zIndex: 1 }}>
            <div 
              ref={canvasContainerRef}
              className="h-full w-full max-w-2xl"
              style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none'
              }}
            >
              <div 
                ref={character3DRef} 
                className="h-full w-full"
                style={{ 
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Suspense 
                  fallback={
                    <div className="w-full h-full bg-gray-900 rounded-lg flex items-center justify-center text-xs text-gray-400">
                      Carregando...
                    </div>
                  }
                >
                  <Scene3D
                    cameraPosition={isMobile ? [0, 0.5, 4.5] : [0, 0.8, 5]}
                    enableControls={!isMobile}
                    enableZoom={false}
                    className="w-full h-full"
                  >
                    <Character3D scrollProgress={scrollProgress} />
                  </Scene3D>
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  )
}

export default Hero

import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { configureGLTFLoader } from '../../utils/textureLoader'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface GlowingSphereProps {
  progress: number
}

const GlowingSphere = ({ progress }: GlowingSphereProps) => {
  return (
    <group>
      {/* Core sphere with animated scale based on progress */}
      <mesh position={[0, 0, 0]} scale={0.8 + (progress / 100) * 0.3}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial
          color="#3b82f6"
          wireframe
          transparent
          opacity={0.6}
        />
      </mesh>

      {/* Inner glow */}
      <mesh position={[0, 0, 0]} scale={0.7}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.2}
        />
      </mesh>

      {/* Outer glow rings */}
      <mesh position={[0, 0, 0]} scale={1.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.1}
          wireframe
        />
      </mesh>

      <pointLight position={[0, 0, 0]} intensity={1} color="#3b82f6" />
    </group>
  )
}

interface LoadingScreenProps {
  onLoaded: () => void
}

const CRITICAL_MODELS = [
  '/models/hero/character.glb',
  '/models/hero/a_pc_playing_btf4.glb',
]

const LoadingScreen = ({ onLoaded }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0)
  const [loadedModels, setLoadedModels] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [rotation, setRotation] = useState(0)
  const prefersReducedMotion = usePrefersReducedMotion()

  // Smooth rotation animation
  useEffect(() => {
    if (prefersReducedMotion) return

    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.5) % 360)
    }, 16)

    return () => clearInterval(interval)
  }, [prefersReducedMotion])

  useEffect(() => {
    let isMounted = true
    const startTime = Date.now()
    const MIN_LOADING_TIME = 3000
    const MAX_LOADING_TIME = 15000

    const fallbackTimer = setTimeout(() => {
      if (isMounted) {
        console.warn('⚠️ Loading timeout - continuando sem modelos 3D pesados')
        setHasError(true)
        setProgress(100)
        setTimeout(() => {
          if (isMounted) {
            onLoaded()
          }
        }, 500)
      }
    }, MAX_LOADING_TIME)

    const loadModels = async () => {
      try {
        const loader = configureGLTFLoader()
        
        let totalLoaded = 0
        const loadPromises = CRITICAL_MODELS.map((modelPath) => {
          return new Promise<void>((resolve) => {
            const timeoutId = setTimeout(() => {
              console.warn(`⏱️ Timeout ao carregar ${modelPath}`)
              resolve()
            }, 8000)

            loader.load(
              modelPath,
              () => {
                clearTimeout(timeoutId)
                if (isMounted) {
                  totalLoaded++
                  const newProgress = Math.floor((totalLoaded / CRITICAL_MODELS.length) * 90)
                  setLoadedModels(totalLoaded)
                  setProgress(newProgress)
                }
                resolve()
              },
              undefined,
              (error) => {
                clearTimeout(timeoutId)
                console.warn(`Erro ao carregar modelo ${modelPath}:`, error)
                if (isMounted) {
                  totalLoaded++
                  setLoadedModels(totalLoaded)
                }
                resolve()
              }
            )
          })
        })

        await Promise.all(loadPromises)

        if (isMounted) {
          clearTimeout(fallbackTimer)
          setProgress(100)
          
          const elapsedTime = Date.now() - startTime
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)
          const finalDelay = remainingTime + 2000
          
          setTimeout(() => {
            if (isMounted) {
              setTimeout(() => {
                if (isMounted) {
                  onLoaded()
                }
              }, 100)
            }
          }, finalDelay)
        }
      } catch (error) {
        console.error('Erro ao carregar modelos:', error)
        if (isMounted) {
          clearTimeout(fallbackTimer)
          setHasError(true)
          setProgress(100)
          const elapsedTime = Date.now() - startTime
          const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime)
          const finalDelay = remainingTime + 2000
          
          setTimeout(() => {
            if (isMounted) {
              setTimeout(() => {
                if (isMounted) {
                  onLoaded()
                }
              }, 100)
            }
          }, finalDelay)
        }
      }
    }

    loadModels()

    return () => {
      isMounted = false
      clearTimeout(fallbackTimer)
    }
  }, [onLoaded])

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute inset-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px]"
          style={{
            animation: prefersReducedMotion ? 'none' : 'pulse 3s ease-in-out infinite',
          }}
        />
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px]"
          style={{
            animation: prefersReducedMotion ? 'none' : 'pulse 3s ease-in-out infinite 1s',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center justify-center text-center w-full px-4">
        {/* 3D Sphere Animation */}
        <div 
          className="w-[300px] h-[300px] mb-12 flex items-center justify-center"
          style={{
            transform: prefersReducedMotion ? 'none' : `rotate(${rotation}deg)`,
            transition: 'transform 0.016s linear',
          }}
        >
          <Canvas 
            camera={{ position: [0, 0, 4] }}
            gl={{ 
              antialias: true, 
              alpha: true, 
              powerPreference: 'high-performance'
            }}
            dpr={[1, 2]}
          >
            <ambientLight intensity={0.3} />
            <GlowingSphere progress={progress} />
          </Canvas>
        </div>
        
        {/* Loading text with gradient */}
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            {hasError ? 'Carregando versão simplificada...' : 'Carregando...'}
          </h2>
          <p className="text-gray-400 text-sm">
            Preparando a experiência
          </p>
        </div>
        
        {/* Progress bar with gradient glow */}
        <div className="w-full max-w-md space-y-3">
          <div className="relative w-full h-2 bg-gray-900 rounded-full overflow-hidden border border-blue-500/20">
            {/* Glow effect behind bar */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-sm"
              style={{ width: `${progress}%` }}
            />
            {/* Actual progress bar */}
            <div
              className="relative h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect */}
              {!prefersReducedMotion && progress < 100 && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              )}
            </div>
          </div>
          
          {/* Progress info */}
          <div className="flex justify-between items-center text-sm">
            <span className="text-cyan-300 font-medium">
              {progress}%
            </span>
            <span className="text-gray-500">
              {loadedModels}/{CRITICAL_MODELS.length} modelos
            </span>
          </div>
        </div>

        {/* Subtle hint */}
        {!hasError && (
          <p className="text-gray-600 text-xs mt-8">
            Otimizando recursos 3D...
          </p>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen

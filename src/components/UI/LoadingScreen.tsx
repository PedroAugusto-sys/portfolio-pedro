import { useEffect, useState, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { configureGLTFLoader } from '../../utils/textureLoader'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import * as THREE from 'three'

interface OrbitingParticlesProps {
  progress: number
  prefersReducedMotion: boolean
}

const OrbitingParticles = ({ progress, prefersReducedMotion }: OrbitingParticlesProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Mesh[]>([])
  const coreRef = useRef<THREE.Mesh>(null)

  // Create orbital particles
  const particles = 12
  const particleGeometry = new THREE.SphereGeometry(0.08, 16, 16)

  useFrame((state) => {
    if (prefersReducedMotion) return

    const time = state.clock.elapsedTime

    // Rotate entire group
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.3
      groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.2
    }

    // Animate core with subtle pulse
    if (coreRef.current) {
      const pulse = 1 + Math.sin(time * 2) * 0.1
      coreRef.current.scale.setScalar(pulse * (0.5 + progress / 200))
      
      // Rotate core
      coreRef.current.rotation.y = time * 0.5
      coreRef.current.rotation.z = time * 0.3
    }

    // Animate individual particles in orbit
    particlesRef.current.forEach((particle, i) => {
      if (!particle) return

      const angle = (i / particles) * Math.PI * 2 + time * 0.8
      const radius = 1.8 + Math.sin(time * 1.5 + i) * 0.3
      const height = Math.sin(angle * 2 + time) * 0.5

      particle.position.x = Math.cos(angle) * radius
      particle.position.z = Math.sin(angle) * radius
      particle.position.y = height

      // Individual rotation
      particle.rotation.x = time * 2 + i
      particle.rotation.y = time * 1.5 + i

      // Fade particles based on progress
      const material = particle.material as THREE.MeshBasicMaterial
      material.opacity = 0.6 + Math.sin(time * 3 + i) * 0.3
    })
  })

  return (
    <group ref={groupRef}>
      {/* Core glowing sphere */}
      <mesh ref={coreRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.8}
          wireframe
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={0.8}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#8b5cf6"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Orbiting particles */}
      {Array.from({ length: particles }).map((_, i) => {
        const hue = (i / particles) * 0.3 // Blue to purple range
        const color = new THREE.Color().setHSL(0.6 - hue, 0.8, 0.6)
        
        return (
          <mesh
            key={i}
            ref={(el) => {
              if (el) particlesRef.current[i] = el
            }}
            geometry={particleGeometry}
          >
            <meshBasicMaterial
              color={color}
              transparent
              opacity={0.7}
            />
          </mesh>
        )
      })}

      {/* Outer ring glow */}
      <mesh rotation={[Math.PI / 2, 0, 0]} scale={2.2}>
        <torusGeometry args={[1, 0.05, 16, 64]} />
        <meshBasicMaterial
          color="#ec4899"
          transparent
          opacity={0.3}
        />
      </mesh>

      {/* Dynamic lights */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#3b82f6" distance={8} />
      <pointLight position={[2, 0, 0]} intensity={1} color="#8b5cf6" distance={6} />
      <pointLight position={[-2, 0, 0]} intensity={1} color="#ec4899" distance={6} />
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
  const prefersReducedMotion = usePrefersReducedMotion()

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
      {/* Multi-layer ambient glow effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Blue glow - center */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"
          style={{
            animation: prefersReducedMotion ? 'none' : 'pulse 4s ease-in-out infinite',
          }}
        />
        {/* Purple glow - offset */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/15 rounded-full blur-[100px]"
          style={{
            animation: prefersReducedMotion ? 'none' : 'pulse 4s ease-in-out infinite 1.5s',
          }}
        />
        {/* Magenta glow - soft outer */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[140px]"
          style={{
            animation: prefersReducedMotion ? 'none' : 'pulse 5s ease-in-out infinite 0.7s',
          }}
        />
      </div>

      <div className="relative flex flex-col items-center justify-center text-center w-full px-4 z-10">
        {/* 3D Orbital Animation */}
        <div className="w-[350px] h-[350px] mb-8 flex items-center justify-center">
          <Canvas 
            camera={{ position: [0, 0, 6], fov: 50 }}
            gl={{ 
              antialias: true, 
              alpha: true, 
              powerPreference: 'high-performance'
            }}
            dpr={[1, 2]}
          >
            <OrbitingParticles progress={progress} prefersReducedMotion={prefersReducedMotion} />
          </Canvas>
        </div>
        
        {/* Loading text with animated gradient */}
        <div className="mb-6">
          <h2 
            className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2"
            style={{
              animation: prefersReducedMotion ? 'none' : 'gradient-shift 3s ease infinite',
            }}
          >
            {hasError ? 'Carregando versão simplificada...' : 'Carregando'}
          </h2>
          <p className="text-gray-400 text-sm">
            Preparando experiência 3D
          </p>
        </div>
        
        {/* Sleek progress bar */}
        <div className="w-full max-w-sm space-y-2">
          <div className="relative w-full h-1.5 bg-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-blue-500/10">
            {/* Glow trail behind progress */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 blur-md transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            {/* Main progress bar with gradient */}
            <div
              className="relative h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out shadow-lg"
              style={{ 
                width: `${progress}%`,
                boxShadow: '0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3)'
              }}
            >
              {/* Animated shimmer */}
              {!prefersReducedMotion && progress < 100 && (
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                  style={{
                    animation: 'shimmer 2s infinite',
                  }}
                />
              )}
            </div>
          </div>
          
          {/* Progress stats */}
          <div className="flex justify-between items-center text-xs">
            <span className="text-blue-300 font-semibold tracking-wider">
              {progress}%
            </span>
            <span className="text-gray-500 font-mono">
              {loadedModels}/{CRITICAL_MODELS.length}
            </span>
          </div>
        </div>

        {/* Status message */}
        {!hasError && progress < 100 && (
          <p className="text-gray-600 text-xs mt-6 animate-pulse">
            Carregando recursos...
          </p>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes gradient-shift {
          0%, 100% { filter: hue-rotate(0deg); }
          50% { filter: hue-rotate(10deg); }
        }
      `}</style>
    </div>
  )
}

export default LoadingScreen

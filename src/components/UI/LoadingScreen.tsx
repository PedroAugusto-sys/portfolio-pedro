import { useEffect, useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { configureGLTFLoader } from '../../utils/textureLoader'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import * as THREE from 'three'

interface ParticleSwarmProps {
  progress: number
  prefersReducedMotion: boolean
}

const ParticleSwarm = ({ progress, prefersReducedMotion }: ParticleSwarmProps) => {
  const pointsRef = useRef<THREE.Points>(null)
  
  // Particle count - balanced for mobile performance
  const particleCount = 3000
  
  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    
    // Initialize particles in a volume
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Start in a sphere volume
      const radius = Math.random() * 3
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta)
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta)
      positions[i3 + 2] = radius * Math.cos(phi)
      
      // Initial colors - blue to purple to magenta gradient
      const hue = 0.6 - (i / particleCount) * 0.2 // 0.6 (blue) to 0.4 (magenta)
      const color = new THREE.Color().setHSL(hue, 0.9, 0.6)
      colors[i3] = color.r
      colors[i3 + 1] = color.g
      colors[i3 + 2] = color.b
    }
    
    return { positions, colors }
  }, [particleCount])
  
  useFrame((state) => {
    if (!pointsRef.current || prefersReducedMotion) return
    
    const time = state.clock.elapsedTime
    const geometry = pointsRef.current.geometry
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute
    const colorAttribute = geometry.attributes.color as THREE.BufferAttribute
    
    const progressFactor = progress / 100
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3
      
      // Normalized index for patterns
      const norm = i / particleCount
      
      // Create elegant swarm motion inspired by DUBOLT
      // Layer 1: Rotating torus field
      const angle1 = norm * Math.PI * 2 + time * 0.4
      const angle2 = norm * Math.PI * 4 + time * 0.6
      const torusRadius = 2 + Math.sin(time * 0.3 + norm * 10) * 0.5
      const tubeRadius = 1 + Math.cos(time * 0.5 + norm * 8) * 0.5
      
      // Layer 2: Wave interference
      const wave1 = Math.sin(norm * 20 + time * 2) * 0.3
      const wave2 = Math.cos(norm * 15 - time * 1.5) * 0.3
      
      // Layer 3: Spiral flow
      const spiralAngle = norm * Math.PI * 6 + time * 0.8
      const spiralRadius = norm * 3
      
      // Combine layers for organic motion
      const x = (Math.cos(angle1) * (torusRadius + Math.cos(angle2) * tubeRadius)) + 
                Math.cos(spiralAngle) * spiralRadius * 0.3 + wave1
      const y = Math.sin(spiralAngle) * spiralRadius * 0.5 + wave2 + 
                Math.sin(time * 0.7 + norm * 5) * 0.5
      const z = (Math.sin(angle1) * (torusRadius + Math.cos(angle2) * tubeRadius)) + 
                Math.sin(spiralAngle) * spiralRadius * 0.3
      
      // Apply with smoothing
      const smoothFactor = 0.05
      positionAttribute.array[i3] += (x - positionAttribute.array[i3]) * smoothFactor
      positionAttribute.array[i3 + 1] += (y - positionAttribute.array[i3 + 1]) * smoothFactor
      positionAttribute.array[i3 + 2] += (z - positionAttribute.array[i3 + 2]) * smoothFactor
      
      // Dynamic color shifts
      const hue = 0.6 - norm * 0.2 + Math.sin(time * 0.5 + norm * 10) * 0.05
      const lightness = 0.5 + Math.sin(time * 2 + norm * 8) * 0.2 + progressFactor * 0.2
      const color = new THREE.Color().setHSL(hue, 0.9, lightness)
      
      colorAttribute.array[i3] = color.r
      colorAttribute.array[i3 + 1] = color.g
      colorAttribute.array[i3 + 2] = color.b
    }
    
    positionAttribute.needsUpdate = true
    colorAttribute.needsUpdate = true
    
    // Gentle camera rotation for depth
    state.camera.position.x = Math.sin(time * 0.1) * 0.5
    state.camera.position.y = Math.cos(time * 0.15) * 0.5
    state.camera.lookAt(0, 0, 0)
  })
  
  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={prefersReducedMotion ? 0.04 : 0.06}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
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
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[150px]"
          style={{
            animation: prefersReducedMotion ? 'none' : 'pulse 6s ease-in-out infinite',
          }}
        />
      </div>

      {/* Particle Swarm Canvas - Full viewport */}
      <div className="absolute inset-0">
        <Canvas 
          camera={{ position: [0, 0, 8], fov: 60 }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: 'high-performance'
          }}
          dpr={[1, 2]}
        >
          <ParticleSwarm progress={progress} prefersReducedMotion={prefersReducedMotion} />
        </Canvas>
      </div>

      {/* Minimal UI overlay */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-16 px-4">
        {/* Clean text */}
        <div className="text-center mb-6">
          <h2 className="text-2xl sm:text-3xl font-light text-white/90 mb-1 tracking-wide">
            {hasError ? 'Carregando versão simplificada' : 'Carregando'}
          </h2>
          <p className="text-gray-500 text-sm font-light">
            {loadedModels}/{CRITICAL_MODELS.length}
          </p>
        </div>
        
        {/* Minimal progress indicator */}
        <div className="w-48 h-0.5 bg-gray-900/50 rounded-full overflow-hidden backdrop-blur-sm">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen

import { useEffect, useState, useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { configureGLTFLoader } from '../../utils/textureLoader'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'
import * as THREE from 'three'

interface BreathingTesseractProps {
  prefersReducedMotion: boolean
}

const BreathingTesseract = ({ prefersReducedMotion }: BreathingTesseractProps) => {
  const pointsRef = useRef<THREE.Points>(null)
  
  // Particle count optimized for mobile (dense enough to read as edges)
  const particlesPerEdge = 40
  const totalEdges = 32 // Tesseract has 32 edges (8 outer cube + 8 inner cube + 16 connectors)
  const particleCount = particlesPerEdge * totalEdges
  
  const { positions, colors, edgeData } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const edgeData: { start: THREE.Vector4; end: THREE.Vector4; edgeIndex: number }[] = []
    
    // Define 4D hypercube vertices (tesseract has 16 vertices)
    const vertices4D: THREE.Vector4[] = []
    for (let i = 0; i < 16; i++) {
      vertices4D.push(
        new THREE.Vector4(
          (i & 1) ? 1 : -1,
          (i & 2) ? 1 : -1,
          (i & 4) ? 1 : -1,
          (i & 8) ? 1 : -1
        )
      )
    }
    
    // Define edges (connect vertices that differ in only one coordinate)
    const edges: [number, number][] = []
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        const diff = i ^ j
        // Check if exactly one bit differs (edge in 4D hypercube)
        if (diff && !(diff & (diff - 1))) {
          edges.push([i, j])
        }
      }
    }
    
    // Distribute particles along each edge
    let particleIdx = 0
    edges.forEach((edge, edgeIndex) => {
      const start = vertices4D[edge[0]]
      const end = vertices4D[edge[1]]
      
      edgeData.push({ start, end, edgeIndex })
      
      for (let i = 0; i < particlesPerEdge; i++) {
        const t = i / (particlesPerEdge - 1)
        const i3 = particleIdx * 3
        
        // Initial 4D position along edge
        const pos4D = new THREE.Vector4(
          start.x + (end.x - start.x) * t,
          start.y + (end.y - start.y) * t,
          start.z + (end.z - start.z) * t,
          start.w + (end.w - start.w) * t
        )
        
        // Stereographic projection 4D → 3D
        const scale = 1 / (2 - pos4D.w)
        positions[i3] = pos4D.x * scale
        positions[i3 + 1] = pos4D.y * scale
        positions[i3 + 2] = pos4D.z * scale
        
        // Color: magenta → cyan along edge
        const hue = 0.85 - t * 0.3 // 0.85 (magenta) → 0.55 (cyan)
        const color = new THREE.Color().setHSL(hue, 1.0, 0.6)
        colors[i3] = color.r
        colors[i3 + 1] = color.g
        colors[i3 + 2] = color.b
        
        particleIdx++
      }
    })
    
    return { positions, colors, edgeData }
  }, [particleCount, particlesPerEdge])
  
  useFrame((state) => {
    if (!pointsRef.current) return
    
    const time = state.clock.elapsedTime
    const geometry = pointsRef.current.geometry
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute
    const colorAttribute = geometry.attributes.color as THREE.BufferAttribute
    
    // Breathing scale pulse
    const breathingScale = prefersReducedMotion 
      ? 1.0 
      : 1.0 + Math.sin(time * 0.6) * 0.15
    
    // 4D rotation angles (slow tumble)
    const rotXY = prefersReducedMotion ? 0 : time * 0.15
    const rotZW = prefersReducedMotion ? 0 : time * 0.1
    const rotXZ = prefersReducedMotion ? 0 : time * 0.08
    
    // Internal 4D morph (breathing in 4th dimension)
    const morphW = prefersReducedMotion ? 0 : Math.sin(time * 0.4) * 0.3
    
    let particleIdx = 0
    edgeData.forEach(({ start, end }) => {
      for (let i = 0; i < particlesPerEdge; i++) {
        const t = i / (particlesPerEdge - 1)
        const i3 = particleIdx * 3
        
        // Interpolate along edge in 4D
        let pos4D = new THREE.Vector4(
          start.x + (end.x - start.x) * t,
          start.y + (end.y - start.y) * t,
          start.z + (end.z - start.z) * t,
          start.w + (end.w - start.w) * t
        )
        
        // Apply 4D rotations (rotate in XY, ZW, XZ planes)
        // XY rotation
        const cosXY = Math.cos(rotXY)
        const sinXY = Math.sin(rotXY)
        const newX = pos4D.x * cosXY - pos4D.y * sinXY
        const newY = pos4D.x * sinXY + pos4D.y * cosXY
        pos4D.x = newX
        pos4D.y = newY
        
        // ZW rotation (creates 4D tumble effect)
        const cosZW = Math.cos(rotZW)
        const sinZW = Math.sin(rotZW)
        const newZ = pos4D.z * cosZW - pos4D.w * sinZW
        const newW = pos4D.z * sinZW + pos4D.w * cosZW
        pos4D.z = newZ
        pos4D.w = newW
        
        // XZ rotation
        const cosXZ = Math.cos(rotXZ)
        const sinXZ = Math.sin(rotXZ)
        const newX2 = pos4D.x * cosXZ - pos4D.z * sinXZ
        const newZ2 = pos4D.x * sinXZ + pos4D.z * cosXZ
        pos4D.x = newX2
        pos4D.z = newZ2
        
        // Apply 4D morph (breathing in W dimension)
        pos4D.w += morphW
        
        // Stereographic projection 4D → 3D
        const scale = breathingScale / (2.2 - pos4D.w)
        positionAttribute.array[i3] = pos4D.x * scale * 1.5
        positionAttribute.array[i3 + 1] = pos4D.y * scale * 1.5
        positionAttribute.array[i3 + 2] = pos4D.z * scale * 1.5
        
        // Dynamic color with breathing intensity
        const hue = 0.85 - t * 0.3 + Math.sin(time * 0.8 + t * 5) * 0.05
        const lightness = 0.6 + Math.sin(time * 1.5 + t * 10) * 0.15
        const color = new THREE.Color().setHSL(hue, 1.0, lightness)
        
        colorAttribute.array[i3] = color.r
        colorAttribute.array[i3 + 1] = color.g
        colorAttribute.array[i3 + 2] = color.b
        
        particleIdx++
      }
    })
    
    positionAttribute.needsUpdate = true
    colorAttribute.needsUpdate = true
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
        size={prefersReducedMotion ? 0.03 : 0.05}
        vertexColors
        transparent
        opacity={0.9}
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
      {/* Subtle bloom glow in void */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/3 rounded-full blur-[120px]"
          style={{
            animation: prefersReducedMotion ? 'none' : 'pulse 8s ease-in-out infinite',
          }}
        />
      </div>

      {/* Breathing Tesseract - Full viewport */}
      <div className="absolute inset-0">
        <Canvas 
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ 
            antialias: true, 
            alpha: true, 
            powerPreference: 'high-performance'
          }}
          dpr={[1, 2]}
        >
          <BreathingTesseract prefersReducedMotion={prefersReducedMotion} />
        </Canvas>
      </div>

      {/* Minimal UI - bottom center */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full pb-12 px-4">
        <div className="text-center mb-4">
          <h2 className="text-xl sm:text-2xl font-extralight text-white/80 mb-1 tracking-widest">
            {hasError ? 'CARREGANDO' : 'CARREGANDO'}
          </h2>
          <p className="text-gray-600 text-xs font-mono tracking-wider">
            {loadedModels}/{CRITICAL_MODELS.length}
          </p>
        </div>
        
        {/* Minimal progress line */}
        <div className="w-32 h-px bg-gray-900/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 transition-all duration-700 ease-out"
            style={{ 
              width: `${progress}%`,
              boxShadow: '0 0 8px rgba(236, 72, 153, 0.4)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen

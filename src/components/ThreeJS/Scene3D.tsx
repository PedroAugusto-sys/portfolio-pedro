import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import { useThreeScene } from '../../hooks/useThreeScene'
import { useMobile } from '../../hooks/useMobile'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion'

interface Scene3DProps {
  children: React.ReactNode
  cameraPosition?: [number, number, number]
  enableControls?: boolean
  enableZoom?: boolean
  className?: string
}

const WebGLContextManager = () => {
  const { gl } = useThree()
  
  useEffect(() => {
    const canvas = gl.domElement
    
    const handleContextLost = (event: Event) => {
      event.preventDefault()
      console.warn('WebGL context lost. Attempting recovery...')
    }
    
    const handleContextRestored = () => {
      console.log('WebGL context restored successfully')
      gl.resetState()
    }
    
    canvas.addEventListener('webglcontextlost', handleContextLost, false)
    canvas.addEventListener('webglcontextrestored', handleContextRestored, false)
    
    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost)
      canvas.removeEventListener('webglcontextrestored', handleContextRestored)
    }
  }, [gl])
  
  return null
}

const SceneContent = ({
  children,
  enableControls = true,
  enableZoom = true,
  cameraPosition = [0, 0, 5],
}: Omit<Scene3DProps, 'className'>) => {
  useThreeScene()
  const isMobile = useMobile()

  return (
    <>
      <WebGLContextManager />
      <PerspectiveCamera makeDefault position={cameraPosition} fov={80} />
      
      {/* Reduced ambient to avoid flat white blowout */}
      <ambientLight intensity={0.4} color="#ffffff" />
      
      {/* Key directional light from top-front-right */}
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.2} 
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Fill light from opposite side (soft) */}
      <directionalLight 
        position={[-3, 2, -3]} 
        intensity={0.5} 
        color="#ffffff"
        castShadow={false}
      />
      
      {/* Rim/back light for definition */}
      <pointLight 
        position={[0, 3, -5]} 
        intensity={0.6} 
        color="#ffffff"
        distance={20}
        decay={2}
      />
      
      {enableControls && (
        <OrbitControls
          enableZoom={enableZoom && !isMobile}
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          enableRotate={true}
          enableDamping={true}
          dampingFactor={0.05}
        />
      )}
      {children}
    </>
  )
}

const Scene3D = ({
  children,
  cameraPosition = [0, 0, 5],
  enableControls = true,
  enableZoom = true,
  className = '',
}: Scene3DProps) => {
  const isMobile = useMobile()
  const prefersReducedMotion = usePrefersReducedMotion()

  // Se o usuário preferir movimento reduzido, simplifica a cena
  if (prefersReducedMotion) {
    return (
      <div 
        className={`w-full h-full ${className} flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900`}
      >
        <div className="text-center p-8">
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Visualização 3D desabilitada</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`w-full h-full ${className}`} 
      style={{ 
        background: 'transparent', 
        touchAction: enableControls && isMobile ? 'none' : (isMobile ? 'pan-y' : 'auto'),
        position: 'relative',
        isolation: 'isolate'
      }}
    >
      <Canvas
        gl={{ 
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          logarithmicDepthBuffer: false,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
          precision: 'highp',
          premultipliedAlpha: false,
        }}
        dpr={isMobile ? [0.8, 1.2] : [1, 2]}
        camera={{ position: cameraPosition }}
        performance={{ min: isMobile ? 0.3 : 0.5, max: 1, debounce: isMobile ? 300 : 200 }}
        style={{ 
          display: 'block',
          background: 'transparent', 
          touchAction: enableControls && isMobile ? 'none' : (isMobile ? 'pan-y' : 'auto'),
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: enableControls && isMobile ? 'auto' : 'auto',
          zIndex: 1
        }}
        frameloop="always"
        onCreated={({ gl, scene }) => {
          try {
            gl.setClearColor('#000000', 0)
            gl.shadowMap.enabled = false
            gl.setPixelRatio(1)
            gl.outputColorSpace = 'srgb'
            gl.sortObjects = false
            scene.frustumCulled = true
          } catch (error) {
            console.error('Erro ao configurar WebGL:', error)
          }
        }}
        onError={(error) => {
          console.error('❌ Erro no Canvas:', error)
        }}
      >
        <Suspense fallback={null}>
          <SceneContent 
            enableControls={enableControls}
            enableZoom={enableZoom}
            cameraPosition={cameraPosition}
          >
            {children}
          </SceneContent>
        </Suspense>
      </Canvas>
    </div>
  )
}

export default Scene3D

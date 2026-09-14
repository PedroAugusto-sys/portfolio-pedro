import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const LuminousBackground3D = () => {
  const mesh1Ref = useRef<THREE.Mesh>(null)
  const mesh2Ref = useRef<THREE.Mesh>(null)
  const mesh3Ref = useRef<THREE.Mesh>(null)
  const isVisibleRef = useRef(true)

  // Pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  // Shader material for luminous glow effect - MONOCHROME WHITE
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#ffffff') }, // White
        color2: { value: new THREE.Color('#e5e5e5') }, // Light gray
        color3: { value: new THREE.Color('#a3a3a3') }, // Medium gray
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          // Stronger morphing animation
          pos.x += sin(position.y * 0.5 + time * 0.5) * 0.5;
          pos.y += cos(position.x * 0.5 + time * 0.4) * 0.5;
          pos.z += sin(position.x * 0.3 + position.y * 0.3 + time * 0.3) * 0.4;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Create organic color mixing
          float dist = length(vUv - 0.5);
          float pulse = sin(time * 0.8 + dist * 3.0) * 0.5 + 0.5;
          
          // Mix colors based on position and time
          vec3 color = mix(color1, color2, vUv.x * pulse);
          color = mix(color, color3, vUv.y * (1.0 - pulse));
          
          // Add glow intensity falloff - MORE INTENSE
          float intensity = 1.0 - dist * 1.2;
          intensity = max(0.0, intensity);
          intensity = pow(intensity, 1.5);
          
          gl_FragColor = vec4(color * intensity, intensity * 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  const shaderMaterial2 = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#e5e5e5') }, // Light gray
        color2: { value: new THREE.Color('#a3a3a3') }, // Medium gray
        color3: { value: new THREE.Color('#ffffff') }, // White
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float time;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.x += cos(position.y * 0.4 + time * 0.6) * 0.6;
          pos.y += sin(position.x * 0.4 + time * 0.5) * 0.6;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        varying vec2 vUv;
        
        void main() {
          float dist = length(vUv - 0.5);
          float pulse = cos(time * 0.9 + dist * 4.0) * 0.5 + 0.5;
          
          vec3 color = mix(color1, color3, vUv.y);
          color = mix(color, color2, pulse * vUv.x);
          
          float intensity = 1.0 - dist * 1.0;
          intensity = max(0.0, intensity);
          intensity = pow(intensity, 1.3);
          
          gl_FragColor = vec4(color * intensity, intensity * 0.8);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  useFrame((state) => {
    if (!isVisibleRef.current) return // Pause when tab hidden
    
    const time = state.clock.elapsedTime

    if (mesh1Ref.current) {
      mesh1Ref.current.rotation.z = time * 0.08
      mesh1Ref.current.rotation.x = Math.sin(time * 0.15) * 0.3
      ;(mesh1Ref.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }

    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.z = -time * 0.06
      mesh2Ref.current.rotation.y = Math.cos(time * 0.12) * 0.4
      ;(mesh2Ref.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }

    if (mesh3Ref.current) {
      mesh3Ref.current.rotation.x = time * 0.07
      mesh3Ref.current.rotation.y = time * 0.04
      ;(mesh3Ref.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }
  })

  return (
    <>
      {/* Large background glow sphere 1 - Blue to Purple - CLOSER AND BIGGER */}
      <mesh ref={mesh1Ref} position={[-6, 2, -10]} scale={[18, 18, 18]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>

      {/* Large background glow sphere 2 - Purple to Magenta - CLOSER AND BIGGER */}
      <mesh ref={mesh2Ref} position={[5, -1, -12]} scale={[20, 20, 20]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={shaderMaterial2} attach="material" />
      </mesh>

      {/* Ambient glow sphere 3 - Mix - CLOSER */}
      <mesh ref={mesh3Ref} position={[0, 4, -14]} scale={[15, 15, 15]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>

      {/* Brighter ambient light */}
      <ambientLight intensity={0.3} />
      <pointLight position={[-10, 5, -8]} intensity={1.5} color="#ffffff" />
      <pointLight position={[10, -5, -8]} intensity={1.5} color="#e5e5e5" />
      <pointLight position={[0, 5, -10]} intensity={1.2} color="#a3a3a3" />
    </>
  )
}

export default LuminousBackground3D

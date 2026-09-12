import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const LuminousBackground3D = () => {
  const mesh1Ref = useRef<THREE.Mesh>(null)
  const mesh2Ref = useRef<THREE.Mesh>(null)
  const mesh3Ref = useRef<THREE.Mesh>(null)

  // Shader material for luminous glow effect
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: new THREE.Color('#0ea5e9') }, // Electric blue
        color2: { value: new THREE.Color('#a855f7') }, // Purple
        color3: { value: new THREE.Color('#ec4899') }, // Magenta/pink
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        uniform float time;
        
        void main() {
          vUv = uv;
          vPosition = position;
          
          vec3 pos = position;
          // Subtle morphing animation
          pos.x += sin(position.y * 0.5 + time * 0.3) * 0.3;
          pos.y += cos(position.x * 0.5 + time * 0.2) * 0.3;
          pos.z += sin(position.x * 0.3 + position.y * 0.3 + time * 0.25) * 0.2;
          
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
          float pulse = sin(time * 0.5 + dist * 3.0) * 0.5 + 0.5;
          
          // Mix colors based on position and time
          vec3 color = mix(color1, color2, vUv.x * pulse);
          color = mix(color, color3, vUv.y * (1.0 - pulse));
          
          // Add glow intensity falloff
          float intensity = 1.0 - dist * 1.5;
          intensity = max(0.0, intensity);
          intensity = pow(intensity, 2.0);
          
          gl_FragColor = vec4(color * intensity, intensity * 0.8);
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
        color1: { value: new THREE.Color('#8b5cf6') }, // Purple
        color2: { value: new THREE.Color('#ec4899') }, // Pink
        color3: { value: new THREE.Color('#06b6d4') }, // Cyan
      },
      vertexShader: `
        varying vec2 vUv;
        uniform float time;
        
        void main() {
          vUv = uv;
          vec3 pos = position;
          pos.x += cos(position.y * 0.3 + time * 0.4) * 0.4;
          pos.y += sin(position.x * 0.3 + time * 0.3) * 0.4;
          
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
          float pulse = cos(time * 0.6 + dist * 4.0) * 0.5 + 0.5;
          
          vec3 color = mix(color1, color3, vUv.y);
          color = mix(color, color2, pulse * vUv.x);
          
          float intensity = 1.0 - dist * 1.2;
          intensity = max(0.0, intensity);
          intensity = pow(intensity, 1.5);
          
          gl_FragColor = vec4(color * intensity, intensity * 0.6);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    })
  }, [])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (mesh1Ref.current) {
      mesh1Ref.current.rotation.z = time * 0.05
      mesh1Ref.current.rotation.x = Math.sin(time * 0.1) * 0.2
      ;(mesh1Ref.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }

    if (mesh2Ref.current) {
      mesh2Ref.current.rotation.z = -time * 0.03
      mesh2Ref.current.rotation.y = Math.cos(time * 0.08) * 0.3
      ;(mesh2Ref.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }

    if (mesh3Ref.current) {
      mesh3Ref.current.rotation.x = time * 0.04
      mesh3Ref.current.rotation.y = time * 0.02
      ;(mesh3Ref.current.material as THREE.ShaderMaterial).uniforms.time.value = time
    }
  })

  return (
    <>
      {/* Large background glow sphere 1 - Blue to Purple */}
      <mesh ref={mesh1Ref} position={[-8, 3, -15]} scale={[12, 12, 12]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>

      {/* Large background glow sphere 2 - Purple to Magenta */}
      <mesh ref={mesh2Ref} position={[6, -2, -18]} scale={[14, 14, 14]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={shaderMaterial2} attach="material" />
      </mesh>

      {/* Ambient glow sphere 3 - Mix */}
      <mesh ref={mesh3Ref} position={[0, 5, -20]} scale={[10, 10, 10]}>
        <sphereGeometry args={[1, 32, 32]} />
        <primitive object={shaderMaterial} attach="material" />
      </mesh>

      {/* Ambient light for depth */}
      <ambientLight intensity={0.2} />
      <pointLight position={[-10, 5, -10]} intensity={1} color="#0ea5e9" />
      <pointLight position={[10, -5, -10]} intensity={1} color="#ec4899" />
    </>
  )
}

export default LuminousBackground3D

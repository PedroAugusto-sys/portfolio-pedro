import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FloatingObjectProps {
  position: [number, number, number]
  type: 'box' | 'sphere' | 'torus'
  color: string
  speed?: number
}

const FloatingObject = ({
  position,
  type,
  color,
  speed = 1,
}: FloatingObjectProps) => {
  const meshRef = useRef<THREE.Mesh>(null)
  const initialY = position[1]

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        initialY + Math.sin(state.clock.elapsedTime * speed) * 0.3
      meshRef.current.rotation.x += 0.01 * speed
      meshRef.current.rotation.y += 0.01 * speed
    }
  })

  const getGeometry = () => {
    switch (type) {
      case 'box':
        return <boxGeometry args={[0.5, 0.5, 0.5]} />
      case 'sphere':
        return <sphereGeometry args={[0.3, 16, 16]} />
      case 'torus':
        return <torusGeometry args={[0.3, 0.1, 16, 100]} />
      default:
        return <boxGeometry args={[0.5, 0.5, 0.5]} />
    }
  }

  return (
    <mesh ref={meshRef} position={position}>
      {getGeometry()}
      <meshStandardMaterial
        color={color}
        metalness={0.6}
        roughness={0.4}
        transparent
        opacity={0.7}
      />
    </mesh>
  )
}

const FloatingObjects = () => {
  const objects: FloatingObjectProps[] = [
    { position: [-3, 1, 0], type: 'box', color: '#ffffff', speed: 0.8 },
    { position: [3, -1, 0], type: 'sphere', color: '#e5e5e5', speed: 1.2 },
    { position: [0, 2, -2], type: 'torus', color: '#a3a3a3', speed: 0.6 },
    { position: [-2, -2, 1], type: 'box', color: '#ffffff', speed: 1 },
    { position: [2, 1, -1], type: 'sphere', color: '#e5e5e5', speed: 0.9 },
  ]

  return (
    <>
      {objects.map((obj, index) => (
        <FloatingObject key={index} {...obj} />
      ))}
    </>
  )
}

export default FloatingObjects

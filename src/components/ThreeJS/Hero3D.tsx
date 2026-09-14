import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { track3DInteraction } from '../../utils/analytics'
import { preserveMaterials } from '../../utils/modelUtils'

const Hero3D = () => {
  const groupRef = useRef<THREE.Group>(null)
  const { scene: characterScene, animations } = useGLTF('/models/hero/character.glb')
  const { scene: pcScene } = useGLTF('/models/hero/a_pc_playing_btf4.glb')

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  const handleClick = () => {
    track3DInteraction('click', 'hero_object')
  }

  const { character, pc } = useMemo(() => {
    const char = characterScene.clone(true)
    const pcClone = pcScene.clone(true)
    
    preserveMaterials(char)
    preserveMaterials(pcClone)
    
    char.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
        
        // Convert character materials to grayscale for B&W theme
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
              // Desaturate color to grayscale
              if (mat.color) {
                const gray = mat.color.r * 0.299 + mat.color.g * 0.587 + mat.color.b * 0.114
                mat.color.setRGB(gray, gray, gray)
              }
              // Desaturate emissive
              if (mat.emissive) {
                const emissiveGray = mat.emissive.r * 0.299 + mat.emissive.g * 0.587 + mat.emissive.b * 0.114
                mat.emissive.setRGB(emissiveGray, emissiveGray, emissiveGray)
              }
              // Increase contrast slightly for better silhouette (StandardMaterial only)
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.roughness = Math.min(1, mat.roughness * 1.2)
                mat.metalness = Math.max(0, mat.metalness * 0.8)
              }
            }
          })
        }
      }
      
      if (child instanceof THREE.SkinnedMesh) {
        child.frustumCulled = true
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
        
        // Convert skinned mesh materials to grayscale
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat) => {
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
              if (mat.color) {
                const gray = mat.color.r * 0.299 + mat.color.g * 0.587 + mat.color.b * 0.114
                mat.color.setRGB(gray, gray, gray)
              }
              if (mat.emissive) {
                const emissiveGray = mat.emissive.r * 0.299 + mat.emissive.g * 0.587 + mat.emissive.b * 0.114
                mat.emissive.setRGB(emissiveGray, emissiveGray, emissiveGray)
              }
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.roughness = Math.min(1, mat.roughness * 1.2)
                mat.metalness = Math.max(0, mat.metalness * 0.8)
              }
            }
          })
        }
      }
    })
    
    pcClone.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.frustumCulled = true
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
      }
    })
    
    return { character: char, pc: pcClone }
  }, [characterScene, pcScene])
  
  // Configurar animação Idle
  const { actions, mixer } = useAnimations(animations, character)
  
  useEffect(() => {
    // Play the Idle animation with loop
    const idleAction = actions['Idle']
    if (idleAction && mixer) {
      idleAction.reset()
      idleAction.loop = THREE.LoopRepeat
      idleAction.clampWhenFinished = false
      idleAction.fadeIn(0.5)
      idleAction.play()
      
      // Force update mixer
      mixer.update(0)
    }
    
    return () => {
      // Cleanup: stop animation on unmount
      if (idleAction) {
        idleAction.fadeOut(0.5).stop()
      }
    }
  }, [actions, character, mixer])

  const BASE_SCALE = 0.8

  return (
    <group ref={groupRef} onClick={handleClick}>
      <group position={[-0.5, -0.5, 0]} scale={[BASE_SCALE * 2.7, BASE_SCALE * 2.7, BASE_SCALE * 2.7]}>
        <primitive object={character} />
      </group>

      <group position={[5.5, -1.5, -2.5]} rotation={[0, -Math.PI / 4, 0]} scale={[BASE_SCALE * 0.75, BASE_SCALE * 0.75, BASE_SCALE * 0.75]}>
        <primitive object={pc} />
      </group>
    </group>
  )
}

export default Hero3D

useGLTF.preload('/models/hero/character.glb')
useGLTF.preload('/models/hero/a_pc_playing_btf4.glb')

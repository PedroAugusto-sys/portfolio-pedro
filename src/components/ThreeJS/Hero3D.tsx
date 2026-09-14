import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'
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
    // Use SkeletonUtils.clone for proper skinned mesh animation binding
    const char = SkeletonUtils.clone(characterScene) as THREE.Group
    const pcClone = pcScene.clone(true)
    
    preserveMaterials(char)
    preserveMaterials(pcClone)
    
    char.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        child.frustumCulled = true
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
        
        // Convert materials to B&W using GPU desaturation (keep ALL original maps)
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat: THREE.Material) => {
            // GPU-based grayscale: use onBeforeCompile to desaturate in shader
            // Keeps ALL maps for surface detail
            
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhongMaterial) {
              // Set base color to white for proper grayscale display
              mat.color.setRGB(1, 1, 1)
              mat.emissive.setRGB(0, 0, 0)
              
              // Inject grayscale shader code via onBeforeCompile
              mat.onBeforeCompile = (shader) => {
                shader.fragmentShader = shader.fragmentShader.replace(
                  '#include <dithering_fragment>',
                  `
                  #include <dithering_fragment>
                  // Desaturate to grayscale (luminance)
                  float gray = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
                  gl_FragColor.rgb = vec3(gray);
                  `
                )
              }
              
              mat.needsUpdate = true
            } else if (mat instanceof THREE.MeshBasicMaterial) {
              mat.color.setRGB(0.7, 0.7, 0.7)
              mat.needsUpdate = true
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
  
  // Root ref for animation binding
  const rootRef = useRef<THREE.Group>(null)
  
  // Configurar animação Idle - bind to rootRef
  const { actions, mixer } = useAnimations(animations, rootRef)
  
  useEffect(() => {
    // Debug: log available animation actions
    console.log('[Hero3D] Available animations:', Object.keys(actions))
    
    // Play the Idle animation with loop
    const idleAction = actions['Idle']
    if (idleAction && mixer) {
      console.log('[Hero3D] Playing Idle animation')
      idleAction.reset()
      idleAction.loop = THREE.LoopRepeat
      idleAction.clampWhenFinished = false
      idleAction.fadeIn(0.5)
      idleAction.play()
      
      // Force update mixer
      mixer.update(0)
    } else {
      console.warn('[Hero3D] Idle animation not found. Available:', Object.keys(actions))
    }
    
    // REMOVED IntersectionObserver — let animation run continuously
    
    return () => {
      // Cleanup: stop animation on unmount
      if (idleAction) {
        idleAction.fadeOut(0.5).stop()
      }
    }
  }, [actions, mixer])

  const BASE_SCALE = 0.8

  return (
    <group ref={groupRef} onClick={handleClick}>
      <group position={[-0.5, -0.5, 0]} scale={[BASE_SCALE * 2.7, BASE_SCALE * 2.7, BASE_SCALE * 2.7]}>
        {/* rootRef for animation binding */}
        <group ref={rootRef}>
          <primitive object={character} />
        </group>
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

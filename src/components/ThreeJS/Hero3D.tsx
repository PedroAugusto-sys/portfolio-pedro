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

  // Helper function to convert texture to grayscale canvas
  const convertTextureToGrayscale = (texture: THREE.Texture): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return new THREE.CanvasTexture(canvas)
    
    const image = texture.image
    if (!image) return new THREE.CanvasTexture(canvas)
    
    canvas.width = image.width || 512
    canvas.height = image.height || 512
    
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height)
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114
      data[i] = gray
      data[i + 1] = gray
      data[i + 2] = gray
    }
    
    ctx.putImageData(imageData, 0, 0)
    
    const grayscaleTexture = new THREE.CanvasTexture(canvas)
    grayscaleTexture.wrapS = texture.wrapS
    grayscaleTexture.wrapT = texture.wrapT
    grayscaleTexture.minFilter = texture.minFilter
    grayscaleTexture.magFilter = texture.magFilter
    grayscaleTexture.needsUpdate = true
    
    return grayscaleTexture
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
        
        // Convert materials to B&W - KEEP TEXTURE DETAIL, DESATURATE PIXELS
        if (child.material) {
          const materials = Array.isArray(child.material) ? child.material : [child.material]
          materials.forEach((mat: THREE.Material) => {
            // Convert albedo map to grayscale (keep texture detail)
            if ('map' in mat && mat.map) {
              const mapTexture = mat.map as THREE.Texture
              if (mapTexture.image) {
                try {
                  const grayscaleMap = convertTextureToGrayscale(mapTexture)
                  mat.map = grayscaleMap
                } catch (e) {
                  console.warn('[Hero3D] Failed to convert map to grayscale:', e)
                }
              }
            }
            
            // Convert emissive map to grayscale if exists
            if ('emissiveMap' in mat && mat.emissiveMap) {
              const emissiveTexture = mat.emissiveMap as THREE.Texture
              if (emissiveTexture.image) {
                try {
                  const grayscaleEmissive = convertTextureToGrayscale(emissiveTexture)
                  mat.emissiveMap = grayscaleEmissive
                } catch (e) {
                  console.warn('[Hero3D] Failed to convert emissiveMap to grayscale:', e)
                }
              }
            }
            
            // KEEP normalMap, roughnessMap, metalnessMap, aoMap for surface detail
            
            // Set base color to white for neutral grayscale look
            if ('color' in mat && mat.color instanceof THREE.Color) {
              mat.color.setRGB(1, 1, 1)
            }
            if ('emissive' in mat && mat.emissive instanceof THREE.Color) {
              mat.emissive.setRGB(0, 0, 0)
            }
            
            // Material-specific settings for better surface detail
            if (mat instanceof THREE.MeshStandardMaterial) {
              mat.roughness = mat.roughness || 0.8
              mat.metalness = mat.metalness || 0.1
            } else if (mat instanceof THREE.MeshPhongMaterial) {
              mat.shininess = mat.shininess || 10
            }
            
            mat.needsUpdate = true
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

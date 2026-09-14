import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { preserveMaterials } from '../../utils/modelUtils'
import { useMobile } from '../../hooks/useMobile'

const About3D = () => {
  const groupRef = useRef<THREE.Group>(null)
  const innerGroupRef = useRef<THREE.Group>(null)
  const lightRef1 = useRef<THREE.PointLight>(null)
  const lightRef2 = useRef<THREE.PointLight>(null)
  const lightRef3 = useRef<THREE.PointLight>(null)
  const lightRef4 = useRef<THREE.PointLight>(null)
  const initialYRef = useRef<number>(0)
  const isMobile = useMobile()
  
  const { scene: cerebroScene } = useGLTF('/models/about/cerebro.glb')

  const BASE_SCALE = 0.8
  // Mobile reduzido para diminuir área de interação: de 7.15 para 5.5
  // Desktop mantém 9.36
  const TARGET_BASE_SCALE = isMobile
    ? BASE_SCALE * 5.5 * 0.85
    : BASE_SCALE * 9.36 * 0.85

  useFrame((state) => {
    if (groupRef.current && innerGroupRef.current) {
      const t = state.clock.elapsedTime

      // 1. ROTAÇÃO BASE
      groupRef.current.rotation.y = t * 0.3
      
      // 2. FLUTUAÇÃO
      const floatY = Math.sin(t * 0.8) * 0.4 + Math.sin(t * 1.5) * 0.15
      innerGroupRef.current.position.y = initialYRef.current + floatY

      // 3. PULSAÇÃO ORGÂNICA (Batida dupla estilo coração)
      const pulseTime = t * 2.5
      const pulse = 1 + (Math.pow(Math.sin(pulseTime), 6) * 0.08) + (Math.pow(Math.sin(pulseTime * 0.5), 2) * 0.04)
      
      innerGroupRef.current.scale.set(
        TARGET_BASE_SCALE * pulse,
        TARGET_BASE_SCALE * pulse,
        TARGET_BASE_SCALE * pulse
      )

      // 4. ANIMAÇÃO DAS SINAPSES (Luzes)
      // As luzes piscam mais forte quando o cérebro "pulsa"
      if (lightRef1.current) {
        const targetIntensity = Math.max(0, Math.pow(Math.sin(pulseTime), 10) * 40 + 5)
        lightRef1.current.intensity = THREE.MathUtils.lerp(
          lightRef1.current.intensity, 
          targetIntensity, 
          0.2
        )
      }
      if (lightRef2.current) {
        const targetIntensity = Math.max(0, Math.pow(Math.cos(pulseTime * 0.7), 12) * 35 + 5)
        lightRef2.current.intensity = THREE.MathUtils.lerp(
          lightRef2.current.intensity, 
          targetIntensity, 
          0.2
        )
      }
      // Luzes adicionais com padrões diferentes
      if (lightRef3.current) {
        const targetIntensity = Math.max(0, Math.pow(Math.sin(pulseTime * 1.3), 8) * 25 + 3)
        lightRef3.current.intensity = THREE.MathUtils.lerp(
          lightRef3.current.intensity,
          targetIntensity,
          0.2
        )
      }
      if (lightRef4.current) {
        const targetIntensity = Math.max(0, Math.pow(Math.cos(pulseTime * 0.9), 8) * 20 + 3)
        lightRef4.current.intensity = THREE.MathUtils.lerp(
          lightRef4.current.intensity,
          targetIntensity,
          0.2
        )
      }
    }
  })

  const { cerebro, centerOffset } = useMemo(() => {
    const cloned = cerebroScene.clone(true)
    preserveMaterials(cloned)
    
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // CORREÇÃO DO CORTE: Força a renderização mesmo fora da bounding box padrão
        child.frustumCulled = false 
        if (child.geometry) {
          child.geometry.computeBoundingSphere()
        }
        
        // GARANTIR QUE O MATERIAL RESPONDA ÀS LUZES (SINAPSES)
        if (child.material) {
          const isArray = Array.isArray(child.material)
          const materials = isArray ? child.material : [child.material]
          
          const newMaterials = materials.map((mat: THREE.Material) => {
            // Se for MeshBasicMaterial, converter para MeshStandardMaterial para responder à iluminação
            if (mat instanceof THREE.MeshBasicMaterial) {
              const newMat = new THREE.MeshStandardMaterial({
                color: mat.color,
                map: mat.map,
                transparent: mat.transparent,
                opacity: mat.opacity,
                emissive: mat.color.clone().multiplyScalar(0.1), // Leve emissão para destacar
                emissiveIntensity: 0.2,
              })
              newMat.needsUpdate = true
              return newMat
            } else if (mat instanceof THREE.MeshStandardMaterial || 
                       mat instanceof THREE.MeshPhongMaterial || 
                       mat instanceof THREE.MeshLambertMaterial) {
              // Garantir que o material responda bem às luzes
              if (!mat.emissive) mat.emissive = new THREE.Color(0x000000)
              mat.emissiveIntensity = 0.05 // Reduzir emissão para que as luzes pontuais sejam mais visíveis
              // Aumentar a sensibilidade à iluminação
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.roughness = 0.7 // Reduzir rugosidade para refletir mais luz
                mat.metalness = 0.1
              }
              mat.needsUpdate = true
              return mat
            }
            return mat
          })
          
          child.material = isArray ? newMaterials : newMaterials[0]
        }
      }
    })
    
    const box = new THREE.Box3().setFromObject(cloned)
    const center = box.getCenter(new THREE.Vector3())
    const offset = new THREE.Vector3(-center.x, -center.y - 0.3, -center.z)
    
    initialYRef.current = offset.y
    
    return { cerebro: cloned, centerOffset: offset }
  }, [cerebroScene])

  return (
    <group ref={groupRef}>
      <group 
        ref={innerGroupRef}
        position={[centerOffset.x, centerOffset.y, centerOffset.z]} 
      >
        <primitive object={cerebro} />

        {/* ILUMINAÇÃO AMBIENTE BASE (reduzida para destacar as luzes pontuais) */}
        <ambientLight intensity={0.08} />

        {/* SINAPSES: Luzes pontuais internas/próximas que simulam neurônios disparando */}
        <pointLight 
          ref={lightRef1} 
          position={[0.8, 0.5, 0.5]} 
          color="#ffffff" 
          distance={8}
          intensity={6}
          decay={1.5}
        />
        <pointLight 
          ref={lightRef2} 
          position={[-0.8, -0.2, 0.8]} 
          color="#e5e5e5" 
          distance={8}
          intensity={6}
          decay={1.5}
        />
        
        {/* LUZES ADICIONAIS PARA MAIOR EFEITO DE SINAPSES */}
        <pointLight 
          ref={lightRef3}
          position={[0.3, 0.8, -0.5]} 
          color="#a3a3a3" 
          distance={7}
          intensity={4}
          decay={1.5}
        />
        <pointLight 
          ref={lightRef4}
          position={[-0.5, -0.6, 0.3]} 
          color="#ffffff" 
          distance={7}
          intensity={4}
          decay={1.5}
        />
      </group>
    </group>
  )
}

export default About3D

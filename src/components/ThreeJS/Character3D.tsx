import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { track3DInteraction } from '../../utils/analytics'
import { preserveMaterials } from '../../utils/modelUtils'
import { useMobile } from '../../hooks/useMobile'

interface Character3DProps {
  scrollProgress?: number
}

interface Particle {
  position: THREE.Vector3
  velocity: THREE.Vector3
  life: number
  maxLife: number
  size: number
  color: THREE.Color
}

// Cor fixa do personagem (sem mudança durante scroll)
const GLOW_COLOR = new THREE.Color(0x00ffff) // Ciano

const Character3D = ({ scrollProgress = 0 }: Character3DProps) => {
  const groupRef = useRef<THREE.Group>(null)
  const innerGroupRef = useRef<THREE.Group>(null)
  const { scene: characterScene, animations } = useGLTF('/models/hero/character.glb')
  const isMobile = useMobile()
  
  // Refs para animação
  const scrollRef = useRef(0)
  const previousScrollRef = useRef(0)
  const scrollVelocityRef = useRef(0)
  const scrollDirectionRef = useRef<'down' | 'up' | 'idle'>('idle')
  const initializedRef = useRef(false)
  
  // Refs para efeito de glow (cor fixa, sem mudança no scroll)
  const glowIntensityRef = useRef(0.5)
  
  // Refs para mouse/touch tracking (olhar interativo)
  const mouseRef = useRef({ x: 0, y: 0 })
  const headBoneRef = useRef<THREE.Bone | null>(null)
  const neckBoneRef = useRef<THREE.Bone | null>(null)
  
  // Refs para animação de scroll reverso
  const reverseAnimationRef = useRef(0)
  const spinVelocityRef = useRef(0)
  
  // Refs para sistema de partículas
  const particlesRef = useRef<Particle[]>([])
  const particlesGeometryRef = useRef<THREE.BufferGeometry | null>(null)
  const particlesMaterialRef = useRef<THREE.PointsMaterial | null>(null)
  const particlesSystemRef = useRef<THREE.Points | null>(null)

  // Clonar e preparar o personagem
  const character = useMemo(() => {
    const cloned = characterScene.clone(true)
    preserveMaterials(cloned)
    
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        child.frustumCulled = false
        child.castShadow = false
        child.receiveShadow = false
      }
      
      // Procurar ossos da cabeça e pescoço para o olhar interativo
      if (child instanceof THREE.SkinnedMesh && child.skeleton) {
        const bones = child.skeleton.bones
        
        // Função para buscar osso por nome
        const findBone = (targetNames: string[]): THREE.Bone | null => {
          for (const bone of bones) {
            const boneName = bone.name.toLowerCase()
            for (const target of targetNames) {
              if (boneName.includes(target.toLowerCase())) {
                return bone
              }
            }
          }
          return null
        }
        
        // Procurar osso da cabeça
        const headBone = findBone(['head', 'cabeça', 'skull', 'cranio', 'cabeca'])
        if (headBone) {
          headBoneRef.current = headBone
        }
        
        // Procurar osso do pescoço
        const neckBone = findBone(['neck', 'pescoço', 'pescoco'])
        if (neckBone) {
          neckBoneRef.current = neckBone
        }
        
        // Se não encontrou cabeça mas encontrou pescoço, usar pescoço
        if (!headBoneRef.current && neckBoneRef.current) {
          headBoneRef.current = neckBoneRef.current
        }
        
        // Se não encontrou nenhum, procurar o osso mais alto
        if (!headBoneRef.current && bones.length > 0) {
          let topBone = bones[0]
          let maxY = -Infinity
          
          for (const bone of bones) {
            const worldPos = new THREE.Vector3()
            bone.getWorldPosition(worldPos)
            if (worldPos.y > maxY) {
              topBone = bone
              maxY = worldPos.y
            }
          }
          headBoneRef.current = topBone
        }
      }
    })
    
    return cloned
  }, [characterScene])
  
  // Configurar animação Idle
  const { actions } = useAnimations(animations, character)
  
  useEffect(() => {
    // Play the Idle animation
    const idleAction = actions['Idle']
    if (idleAction) {
      idleAction.reset().fadeIn(0.5).play()
    }
    
    return () => {
      // Cleanup: stop animation on unmount
      if (idleAction) {
        idleAction.fadeOut(0.5).stop()
      }
    }
  }, [actions])

  // Calcular offset para centralizar
  const centerOffset = useMemo(() => {
    try {
      const box = new THREE.Box3().setFromObject(character)
      const center = box.getCenter(new THREE.Vector3())
      return new THREE.Vector3(-center.x, -center.y, -center.z)
    } catch {
      return new THREE.Vector3(0, 0, 0)
    }
  }, [character])

  // Escala base - AUMENTADA EM 30%
  const BASE_SCALE = isMobile ? 1.17 : 1.43 // Era 0.9 e 1.1, agora +30%

  // Rastreamento do mouse/touch (funciona em mobile também)
  useEffect(() => {
    const handleMove = (event: MouseEvent | TouchEvent) => {
      let clientX = 0
      let clientY = 0
      
      if ('touches' in event && event.touches.length > 0) {
        // Touch event
        clientX = event.touches[0].clientX
        clientY = event.touches[0].clientY
      } else if ('clientX' in event) {
        // Mouse event
        clientX = event.clientX
        clientY = event.clientY
      }
      
      mouseRef.current.x = (clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = -(clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('touchmove', handleMove, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('touchmove', handleMove)
    }
  }, [])

  // Inicializar sistema de partículas
  useEffect(() => {
    const geometry = new THREE.BufferGeometry()
    const maxParticles = 300
    const positions = new Float32Array(maxParticles * 3)
    const colors = new Float32Array(maxParticles * 3)
    positions.fill(0)
    colors.fill(1)
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    particlesGeometryRef.current = geometry

    const material = new THREE.PointsMaterial({
      size: 0.15,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
      vertexColors: true,
    })
    
    particlesMaterialRef.current = material

    const particles = new THREE.Points(geometry, material)
    particles.frustumCulled = false
    particlesSystemRef.current = particles

    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [])

  // Frame loop principal
  useFrame((state, delta) => {
    if (!groupRef.current || !innerGroupRef.current) return

    // Usar o valor do prop scrollProgress diretamente (já calculado no Hero.tsx)
    // Apenas usar cálculo do DOM como fallback se o prop não estiver disponível
    let currentScroll = scrollProgress
    
    // Fallback: calcular do DOM apenas se scrollProgress não mudou recentemente
    const heroElement = document.getElementById('hero')
    if (heroElement && (scrollProgress === 0 || Math.abs(scrollProgress - scrollRef.current) < 0.01)) {
      const rect = heroElement.getBoundingClientRect()
      const sectionHeight = heroElement.offsetHeight || window.innerHeight
      const viewportHeight = window.innerHeight
      
      if (rect.bottom <= 0) {
        currentScroll = 1
      } else if (rect.top >= viewportHeight) {
        currentScroll = 0
      } else {
        // Seção está visível - calcular progresso
        const scrolled = Math.max(0, -rect.top)
        currentScroll = Math.max(0, Math.min(1, scrolled / sectionHeight))
      }
    }

    // Calcular velocidade e direção do scroll
    const scrollDelta = currentScroll - previousScrollRef.current
    scrollVelocityRef.current = THREE.MathUtils.lerp(
      scrollVelocityRef.current,
      Math.abs(scrollDelta) / Math.max(delta, 0.001),
      0.3
    )
    
    // Determinar direção do scroll
    if (Math.abs(scrollDelta) > 0.0005) {
      scrollDirectionRef.current = scrollDelta > 0 ? 'down' : 'up'
    } else {
      scrollDirectionRef.current = 'idle'
    }
    
    previousScrollRef.current = currentScroll

    // Suavizar transição do scroll - MUITO MAIS RÁPIDO para resposta imediata
    scrollRef.current = THREE.MathUtils.lerp(scrollRef.current, currentScroll, 0.5)
    const scroll = scrollRef.current
    
    // ========================================
    // ANIMAÇÃO DE SCROLL REVERSO
    // ========================================
    const isScrollingUp = scrollDirectionRef.current === 'up'
    const isScrollingDown = scrollDirectionRef.current === 'down'
    
    const targetReverse = isScrollingUp ? 1 : 0
    reverseAnimationRef.current = THREE.MathUtils.lerp(
      reverseAnimationRef.current,
      targetReverse,
      0.1
    )
    const reverseAmount = reverseAnimationRef.current

    // Inicialização
    if (!initializedRef.current) {
      innerGroupRef.current.position.set(centerOffset.x, centerOffset.y + 2, centerOffset.z)
      innerGroupRef.current.scale.setScalar(BASE_SCALE * 0.8)
      innerGroupRef.current.rotation.set(0, 0, 0)
      groupRef.current.rotation.set(0, 0, 0)
      initializedRef.current = true
      
      if (particlesSystemRef.current) {
        groupRef.current.add(particlesSystemRef.current)
      }
    }

    // Glow mantém intensidade constante (sem mudança de cor no scroll)
    const speed = scrollVelocityRef.current
    glowIntensityRef.current = THREE.MathUtils.lerp(glowIntensityRef.current, 0.5, 0.1)

    // ========================================
    // OLHAR INTERATIVO (CABEÇA SEGUE O MOUSE/TOUCH) - FUNCIONA NO MOBILE TAMBÉM
    // ========================================
    if (headBoneRef.current) {
      // Atualizar skeleton
      character.traverse((child) => {
        if (child instanceof THREE.SkinnedMesh && child.skeleton) {
          child.skeleton.update()
        }
      })
      
      // Calcular rotação alvo baseada na posição do mouse/touch
      const targetHeadRotY = mouseRef.current.x * 0.6
      const targetHeadRotX = -mouseRef.current.y * 0.4
      
      // Aplicar rotação suavizada no osso da cabeça
      headBoneRef.current.rotation.y = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.y,
        targetHeadRotY,
        0.08
      )
      headBoneRef.current.rotation.x = THREE.MathUtils.lerp(
        headBoneRef.current.rotation.x,
        targetHeadRotX,
        0.08
      )
      
      // Se também encontrou o pescoço, aplicar rotação menor nele
      if (neckBoneRef.current && neckBoneRef.current !== headBoneRef.current) {
        neckBoneRef.current.rotation.y = THREE.MathUtils.lerp(
          neckBoneRef.current.rotation.y,
          targetHeadRotY * 0.3,
          0.05
        )
        neckBoneRef.current.rotation.x = THREE.MathUtils.lerp(
          neckBoneRef.current.rotation.x,
          targetHeadRotX * 0.2,
          0.05
        )
      }
      
      // Atualizar matriz do osso
      headBoneRef.current.updateMatrixWorld(true)
      if (neckBoneRef.current) {
        neckBoneRef.current.updateMatrixWorld(true)
      }
    }

    // ========================================
    // ANIMAÇÕES BASEADAS NO SCROLL
    // ========================================

    // 1. QUEDA/SUBIDA VERTICAL - CORRIGIDO para funcionar
    const fallStartY = centerOffset.y + 2
    const fallEndY = centerOffset.y - (isMobile ? 4 : 6)
    const fallDistance = fallStartY - fallEndY
    
    // Usar scroll diretamente sem easing para movimento mais responsivo
    // Easing pode ser adicionado depois se necessário
    const targetY = fallStartY - (scroll * fallDistance)

    // 2. MOVIMENTO LATERAL
    const lateralDirection = isScrollingUp ? -1 : 1
    const targetX = centerOffset.x + (scroll * 1.5 * lateralDirection)

    // 3. MOVIMENTO DE PROFUNDIDADE
    const depthDirection = isScrollingUp ? 1 : -1
    const targetZ = centerOffset.z + (scroll * 1.0 * depthDirection)

    // Aplicar posições - TODAS DIRETAS para resposta imediata (sem lerp)
    innerGroupRef.current.position.y = targetY
    innerGroupRef.current.position.x = targetX
    innerGroupRef.current.position.z = targetZ

    // 4. ESCALA
    const minScale = BASE_SCALE * 0.8
    const maxScale = BASE_SCALE * 1.3
    const scaleBonus = isScrollingUp ? 0.2 : 0
    const targetScale = minScale + (scroll * (maxScale - minScale)) + scaleBonus * reverseAmount
    
    const currentScale = innerGroupRef.current.scale.x
    const newScale = THREE.MathUtils.lerp(currentScale, targetScale, 0.15)
    innerGroupRef.current.scale.setScalar(newScale)

    // 5. ROTAÇÃO Y (GIRO)
    const baseRotY = state.clock.elapsedTime * 0.1
    
    if (isScrollingDown) {
      spinVelocityRef.current = THREE.MathUtils.lerp(spinVelocityRef.current, speed * 0.5, 0.1)
    } else if (isScrollingUp) {
      spinVelocityRef.current = THREE.MathUtils.lerp(spinVelocityRef.current, -speed * 0.8, 0.1)
    } else {
      spinVelocityRef.current = THREE.MathUtils.lerp(spinVelocityRef.current, 0, 0.05)
    }
    
    const scrollRotY = scroll * Math.PI * 2 * (1 - reverseAmount * 2)
    groupRef.current.rotation.y = baseRotY + scrollRotY + spinVelocityRef.current

    // 6. ROTAÇÃO X (INCLINAÇÃO)
    const tiltDirection = isScrollingUp ? -0.3 : 0.4
    const targetRotX = scroll * Math.PI * tiltDirection
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetRotX,
      0.15
    )

    // 7. ROTAÇÃO Z (CAMBALHOTA)
    const rollDirection = isScrollingUp ? -0.4 : 0.6
    const targetRotZ = scroll * Math.PI * rollDirection
    innerGroupRef.current.rotation.z = THREE.MathUtils.lerp(
      innerGroupRef.current.rotation.z,
      targetRotZ,
      0.15
    )

    // 8. BALANÇO SUAVE (quando parado)
    if (scroll < 0.1 && scrollDirectionRef.current === 'idle') {
      const idleSwayY = Math.sin(state.clock.elapsedTime * 2) * 0.05
      const idleSwayX = Math.cos(state.clock.elapsedTime * 1.5) * 0.03
      innerGroupRef.current.position.y += idleSwayY
      innerGroupRef.current.position.x += idleSwayX
      
      glowIntensityRef.current = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }

    // 9. EFEITO DE "RECUPERAÇÃO" AO SUBIR
    if (isScrollingUp && scroll > 0.1) {
      groupRef.current.rotation.x *= 0.95
      innerGroupRef.current.rotation.z *= 0.95
      
      const heroicPose = reverseAmount * 0.1
      innerGroupRef.current.scale.x = newScale * (1 + heroicPose)
    }

    // Partículas desativadas - sem trajetória colorida durante o scroll
    if (particlesSystemRef.current) {
      particlesRef.current = []
      particlesSystemRef.current.visible = false
    }
  })

  const handleClick = () => {
    track3DInteraction('click', 'hero_character')
  }

  return (
    <group ref={groupRef} onClick={handleClick}>
      {/* Luz de glow que segue o personagem (cor fixa) */}
      <pointLight
        color={GLOW_COLOR}
        intensity={glowIntensityRef.current}
        distance={8}
        decay={2}
      />
      <group ref={innerGroupRef}>
        <primitive object={character} />
      </group>
    </group>
  )
}

useGLTF.preload('/models/hero/character.glb')

export default Character3D

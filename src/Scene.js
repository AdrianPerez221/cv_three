// Scene.js

import * as THREE from 'three'
import React, { Suspense, useEffect, useState, useRef } from 'react'
import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { PerspectiveCamera, MeshDistortMaterial, ContactShadows } from '@react-three/drei'
import { useSpring } from '@react-spring/core'
import { a } from '@react-spring/three'
import { TextureLoader } from 'three'

const AnimatedMaterial = a(MeshDistortMaterial)

// mismo naranja que tus badges (cámbialo si usas otro)
const PROGRESS_ORANGE = '#F59E0B'

// ---------- ENTORNO (lo que se refleja dentro de la bola) ----------
function CustomEnvironment() {
  const { scene } = useThree()

  const texture = useLoader(TextureLoader, '/nubes.jpg')

  React.useEffect(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping
    texture.encoding = THREE.sRGBEncoding

    scene.environment = texture
    // scene.background = texture  // si quisieras también de fondo

    return () => {
      scene.environment = null
      // scene.background = null
    }
  }, [scene, texture])

  return null
}

// ---------- BOLA (geometría + textura) ----------
function SphereWithTexture({
  sphereRef,
  wobble,
  coat,
  env,
  mode,
  hovered,
  setHovered,
  down,
  setDown,
  setMode,
  setBg,
  onZoneChange
}) {
  const sphereTexture = useLoader(TextureLoader, '/estrellas.jpg')

  // Cuando se mueve el ratón por la bola
  const handlePointerMove = (e) => {
    const y = e.point.y // posición Y donde choca el ratón en la esfera
    const zone = y >= 0 ? 'top' : 'bottom'
    if (onZoneChange) onZoneChange(zone)
  }

  const handlePointerOut = () => {
    setHovered(false)
    if (onZoneChange) onZoneChange(null) // fuera de la bola → nada activo
  }

  return (
    <a.mesh
      ref={sphereRef}
      scale={wobble.to((v) => v * 1.2)}
      onPointerOver={() => setHovered(true)}
      onPointerMove={handlePointerMove}
      onPointerOut={handlePointerOut}
      onPointerDown={() => setDown(true)}
      onPointerUp={() => {
        setDown(false)
        // usamos función para no depender del valor "viejo" de mode
        setMode((prev) => {
          const nextMode = !prev
          setBg({
            background: nextMode ? '#000000' : '#ffffff',
            fill: nextMode ? '#ffffff' : '#000000',
            // 🔸 barra naranja en oscuro, negra en claro
            progressColor: nextMode ? PROGRESS_ORANGE : '#000000'
          })
          return nextMode
        })
      }}
    >
      <sphereBufferGeometry args={[0.9, 64, 64]} />
      <AnimatedMaterial
        map={sphereTexture}
        color="#ffffff"
        envMapIntensity={env}
        clearcoat={coat}
        clearcoatRoughness={0}
        metalness={0.1}
        roughness={0.5}
        distort={0.3}
        speed={2}
      />
    </a.mesh>
  )
}

// ---------- ESCENA PRINCIPAL ----------
export default function Scene({ setBg, onZoneChange }) {
  const sphere = useRef()
  const light = useRef()
  const [mode, setMode] = useState(false)
  const [down, setDown] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    document.body.style.cursor = hovered
      ? 'none'
      : `url('data:image/svg+xml;base64,${btoa(
          '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="10" fill="#E8B059"/></svg>'
        )}'), auto`
  }, [hovered])

  useFrame((state) => {
    if (light.current) {
      light.current.position.x = state.mouse.x * 20
      light.current.position.y = state.mouse.y * 20
    }
    if (sphere.current) {
      sphere.current.position.x = THREE.MathUtils.lerp(
        sphere.current.position.x,
        hovered ? state.mouse.x / 2 : 0,
        0.2
      )
      sphere.current.position.y = THREE.MathUtils.lerp(
        sphere.current.position.y,
        Math.sin(state.clock.elapsedTime / 1.5) / 6 + (hovered ? state.mouse.y / 2 : 0),
        0.2
      )
    }
  })

  const [{ wobble, coat, ambient, env }] = useSpring(
    {
      wobble: down ? 1.2 : hovered ? 1.05 : 1,
      coat: mode && !hovered ? 0.04 : 1,
      ambient: mode && !hovered ? 1.5 : 0.5,
      env: mode && !hovered ? 0.4 : 1,
      config: (n) => n === 'wobble' && hovered && { mass: 2, tension: 1000, friction: 10 }
    },
    [mode, hovered, down]
  )

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={75}>
        <a.ambientLight intensity={ambient} />
        <a.pointLight ref={light} position-z={-15} intensity={env} color="#F8C069" />
      </PerspectiveCamera>

      <Suspense fallback={null}>
        <CustomEnvironment />

        <SphereWithTexture
          sphereRef={sphere}
          wobble={wobble}
          coat={coat}
          env={env}
          mode={mode}
          hovered={hovered}
          setHovered={setHovered}
          down={down}
          setDown={setDown}
          setMode={setMode}
          setBg={setBg}
          onZoneChange={onZoneChange}
        />

        <ContactShadows
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, -1.6, 0]}
          opacity={mode ? 0.8 : 0.4}
          width={15}
          height={15}
          blur={2.5}
          far={1.6}
        />
      </Suspense>
    </>
  )
}

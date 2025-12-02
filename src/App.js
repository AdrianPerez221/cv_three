// App.js
import React, { useState, useRef, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useSpring } from '@react-spring/core'
import { a } from '@react-spring/web'
import Overlay from './Overlay'
import Scene from './Scene'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

// ahora hay 6 secciones en SECTIONS
const TOTAL_SECTIONS = 7 // número de bloques de CV (izq/der)

export default function App() {
  // 👇 añadimos progressColor al spring
  const [{ background, fill, progressColor }, setBg] = useSpring(
    {
      background: '#ffffff',
      fill: '#000000',
      progressColor: '#000000' // barra negra en modo claro
    },
    []
  )

  const [activeSection, setActiveSection] = useState(0)
  const progressRef = useRef(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress
        // barra de progreso (ancho)
        if (progressRef.current) {
          progressRef.current.style.width = `${p * 100}%`
        }
        // de 0..1 → 0..TOTAL_SECTIONS-1
        const idx = Math.min(
          TOTAL_SECTIONS - 1,
          Math.floor(p * TOTAL_SECTIONS)
        )
        setActiveSection(idx)
      }
    })

    return () => st.kill()
  }, [])

  // si no usas zonas, puedes borrar esto
  const handleZoneChange = (zone) => {
    // console.log('zona', zone)
  }

  return (
    <a.main style={{ background }} className="page">
      {/* Barra de progreso */}
      <div className="scroll-progress">
        <a.div
          className="scroll-progress-inner"
          ref={progressRef}
          // 👇 color animado: negro en claro, naranja en oscuro (desde Scene)
          style={{ background: progressColor }}
        />
      </div>

      {/* Canvas + bola fija en el centro */}
      <div className="canvas-wrapper">
        <Canvas className="canvas" dpr={[1, 2]}>
          <Scene setBg={setBg} onZoneChange={handleZoneChange} />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            maxPolarAngle={Math.PI / 2}
            minPolarAngle={Math.PI / 2}
          />
        </Canvas>

        <Overlay fill={fill} activeSection={activeSection} />
      </div>

      {/* Espacio de scroll "virtual" para que ScrollTrigger tenga recorrido */}
      <div style={{ height: `${TOTAL_SECTIONS * 100}vh` }} />
    </a.main>
  )
}

// Overlay.js
import React, { useRef, useLayoutEffect } from 'react'
import { a } from '@react-spring/web'
import gsap from 'gsap'

const SECTIONS = [
  {
    side: 'left',
    kicker: 'PRESENTACIÓN',
    title: 'Adrián Pérez — Curriculum',
    subtitle: 'Desarrollador Front-end · Interfaces 3D',
    body: `Desarrollo interfaces web interactivas con React, Three.js y GSAP.
Me gusta crear experiencias fluidas, visualmente cuidadas y fáciles de entender,
desde landing pages hasta portfolios 3D y pequeñas herramientas internas para equipos.`,
    meta: 'JavaScript · TypeScript · React · Next.js · Vite · Three.js · GSAP · Tailwind CSS · HTML · CSS · Node.js · Git'
  },
  {
    side: 'right',
    kicker: '', // sin apartado pequeño
    title: 'Proyectos destacados',
    subtitle: 'Landing Palestina · Pokédex · CV 3D',
    body: `He desarrollado proyectos académicos y personales como una landing solidaria sobre Palestina desplegada en Vercel, una Pokédex interactiva y este CV 3D. En todos cuido la estructura del código, el rendimiento y los detalles visuales para que la experiencia sea clara y agradable.`,
    meta: '' // sin meta
  },
  {
    side: 'left',
    kicker: '', // sin apartado pequeño
    title: 'Explora los proyectos',
    subtitle: 'Miniaturas clicables · Demo en vivo',
    body: 'Aquí tienes una vista rápida de dos proyectos recientes. Pulsa en las miniaturas para ir a cada demo.',
    meta: '',
    projects: [
      {
        id: 'palestina',
        label: 'Landing Palestina',
        imageAlt: 'Miniatura del proyecto Landing Palestina',
        thumbnail: '/palestina-cover.png',
        href: 'https://app-palestina.vercel.app',
        external: true
      },
      {
        id: 'pokedex',
        label: 'Pokédex React',
        imageAlt: 'Miniatura del proyecto Pokédex',
        thumbnail: '/pokedex-cover.png',
        href: '/pokedex/',
        external: false
      }
    ]
  },
  {
    side: 'right',
    kicker: '', // sin apartado pequeño
    title: 'Formación en Desarrollo Web',
    subtitle: 'Ciclo DAW · Front-end moderno',
    body: `Estoy cursando el ciclo de Desarrollo de Aplicaciones Web y lo complemento
con proyectos propios, documentación oficial y cursos online. Me interesa especialmente
el front-end moderno y las buenas prácticas
en arquitectura de interfaces y organización de proyectos.`,
    meta: '' // sin meta
  },
  {
    side: 'left',
    kicker: 'HABILIDADES',
    title: 'Tecnologías y forma de trabajar',
    subtitle: 'Stack principal y enfoque',
    body: `Trabajo a diario con React, Vite/Next, Tailwind, Three.js y Git.
Me siento cómodo maquetando desde cero, consumiendo APIs y afinando detalles visuales
con animaciones. Me gusta mantener un código ordenado y legible, pensar en la persona
que va a usar la interfaz y dejar todo listo para que el proyecto pueda crecer.`,
    meta: 'Frontend · UI · Animaciones · Trabajo en equipo'
  },
  {
    side: 'right',
    kicker: '', // sin apartado pequeño
    title: '¿Por qué una esfera en el centro?',
    subtitle: 'Movimiento, equilibrio y adaptación',
    body: `La esfera no está ahí solo por estética: representa cómo me gusta trabajar.
Cuando el usuario se mueve, la bola fluctúa, se deforma y se desplaza, pero siempre
busca volver a su centro. Esa idea de moverse, probar y ajustarse sin perder la forma
refleja mi manera de adaptarme a nuevos proyectos, equipos y tecnologías.

La luz y los reflejos cambian según el entorno, igual que cambian los contextos y las
necesidades de cada persona o empresa. La clave está en reaccionar rápido, encontrar
un nuevo punto de equilibrio y volver al centro con una versión mejorada de la misma
idea. Por eso el CV gira alrededor de una esfera viva: es una metáfora de flexibilidad,
curiosidad y capacidad de adaptación continua.`,
    meta: '' // sin meta
  },
  // 🔻 NUEVA SECCIÓN FINAL: CONTACTO + AGRADECIMIENTO
  {
    side: 'left',
    kicker: 'CONTACTO',
    title: 'Gracias por llegar hasta aquí',
    subtitle: '¿Hablamos?',
    body: `Si te encaja mi perfil, estaré encantado de seguir la conversación.
Podemos hablar sobre prácticas, posiciones junior o colaborar en proyectos donde
haga falta alguien que disfrute del front-end, las animaciones y las ideas nuevas.`,
    // placeholder: cambia esto por tus datos reales cuando quieras
    meta: 'adrianperez0111uni@gmail.com · LinkedIn · GitHub:AdrianPerez221'
  }
]

export default function Overlay({ fill, activeSection }) {
  const contentRef = useRef(null)
  const section = SECTIONS[activeSection] || SECTIONS[0]

  useLayoutEffect(() => {
    if (!contentRef.current) return

    gsap.set(contentRef.current, {
      autoAlpha: 1,
      y: 120,
      x: section.side === 'left' ? -80 : 80,
      scale: 0.85,
      rotationY: section.side === 'left' ? -15 : 15,
      filter: 'blur(24px)'
    })

    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      tl.fromTo(
        contentRef.current,
        {
          autoAlpha: 1,
          y: 120,
          x: section.side === 'left' ? -80 : 80,
          scale: 0.85,
          rotationY: section.side === 'left' ? -15 : 15,
          filter: 'blur(24px)',
          transformOrigin: 'center center'
        },
        {
          autoAlpha: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotationY: 0,
          filter: 'blur(0px)',
          duration: 1.2,
          ease: 'power4.out'
        }
      )

      tl.from(
        '.overlay-kicker',
        {
          y: 40,
          x: section.side === 'left' ? -30 : 30,
          autoAlpha: 0,
          scale: 0.8,
          rotation: section.side === 'left' ? -8 : 8,
          duration: 1,
          ease: 'back.out(1.4)'
        },
        '-=1.1'
      )

      tl.from(
        '.overlay-title',
        {
          y: 50,
          x: section.side === 'left' ? -60 : 60,
          autoAlpha: 0,
          scale: 0.92,
          duration: 1.1,
          ease: 'power4.out'
        },
        '-=0.9'
      )

      tl.from(
        '.overlay-subtitle',
        {
          y: 35,
          autoAlpha: 0,
          letterSpacing: '0.2em',
          duration: 0.9,
          ease: 'power3.out'
        },
        '-=0.8'
      )

      tl.from(
        '.overlay-body',
        {
          y: 30,
          autoAlpha: 0,
          filter: 'blur(8px)',
          duration: 1,
          ease: 'power2.out'
        },
        '-=0.7'
      )

      tl.from(
        '.overlay-meta',
        {
          y: 25,
          autoAlpha: 0,
          scale: 0.95,
          duration: 0.8,
          ease: 'power2.out'
        },
        '-=0.6'
      )
    }, contentRef)

    return () => ctx.revert()
  }, [activeSection, section.side])

  return (
    <div className="overlay">
      <a.div
        key={activeSection}
        ref={contentRef}
        className={`overlay-card overlay-${section.side}`}
        style={{
          color: fill,
          perspective: '1000px'
        }}
      >
        {section.kicker && (
          <p className="overlay-kicker">{section.kicker}</p>
        )}
        <h1 className="overlay-title">{section.title}</h1>
        <p className="overlay-subtitle">{section.subtitle}</p>

        {section.body && (
          <p className="overlay-body">{section.body}</p>
        )}

        {section.projects && (
          <div className="overlay-projects-grid">
            {section.projects.map((project) => (
              <a
                key={project.id}
                className="overlay-project-card"
                href={project.href}
                target={project.external ? '_blank' : '_self'}
                rel={project.external ? 'noopener noreferrer' : undefined}
              >
                <div className="overlay-project-thumb">
                  <img src={project.thumbnail} alt={project.imageAlt} />
                </div>
                <span className="overlay-project-label">
                  {project.label}
                </span>
              </a>
            ))}
          </div>
        )}

        {section.meta && (
          <p className="overlay-meta">{section.meta}</p>
        )}
      </a.div>
    </div>
  )
}

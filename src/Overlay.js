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
Me gusta diseñar experiencias fluidas, visualmente cuidadas y fáciles de usar,
desde landing pages hasta portfolios y pequeñas herramientas internas para equipos.`,
    meta:
      'JavaScript · TypeScript · React · Next.js · Vite · Three.js · GSAP · Tailwind CSS · HTML · CSS · Node.js · Git'
  },
  {
    side: 'right',
    kicker: '', // sin apartado pequeño
    title: 'Proyectos destacados.',
    subtitle: 'Landing Palestina · Pokédex · CV',
    body: `He desarrollado proyectos académicos y personales como una landing informativa sobre Palestina desplegada en Vercel, una Pokédex interactiva y este CV. En todos priorizo una buena estructura de código, el rendimiento y los detalles visuales para que la experiencia sea clara y agradable.`,
    meta: '' // sin meta
  },
  {
    side: 'left',
    kicker: '', // sin apartado pequeño
    title: 'Explora los proyectos.',
    subtitle: 'Miniaturas clicables · Demo en vivo',
    body:
      'A continuación puedes ver una selección de dos proyectos recientes. Haz clic en cada miniatura para acceder a la demo.',
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
        label: 'Pokédex',
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
    title: 'Desarrollo web',
    subtitle: 'Ciclo DAW · Front-end moderno',
    body: `Actualmente curso el ciclo de Desarrollo de Aplicaciones Web, que complemento
con proyectos propios, documentación oficial y formación online. Me interesa especialmente
el front-end moderno y las buenas prácticas
en arquitectura de interfaces y organización de proyectos.`,
    meta: '' // sin meta
  },
  {
    side: 'left',
    kicker: 'HABILIDADES',
    title: 'Tecnologías y métodos de trabajar.',
    subtitle: 'Stack principal y enfoque',
    body: `Trabajo a diario con React, Vite/Next, Tailwind, Three.js y Git.
Me siento cómodo maquetando desde cero, consumiendo APIs y afinando detalles visuales
con animaciones. Cuido que el código sea ordenado y legible, pienso en la persona
que va a usar la interfaz y procuro dejar todo preparado para que el proyecto pueda crecer.`,
    meta: 'Frontend · UI · Animaciones · Trabajo en equipo'
  },
  {
    side: 'right',
    kicker: '', // sin apartado pequeño
    title: '¿Por qué esta forma en el centro?',
    subtitle: 'Movimiento, equilibrio y adaptación',
    body: `La figura central no está ahí solo por estética: es una forma casi esférica que representa cómo me gusta trabajar. Cuando el usuario interactúa, el volumen se desplaza, se tensa y se deforma, pero siempre tiende a recuperar su centro. Ese juego entre movimiento y regreso al equilibrio refleja mi manera de entrar en proyectos nuevos: probar, ajustarme y volver a una posición estable sin perder la estructura.

La luz y los reflejos cambian según el entorno, igual que cambian los contextos y las necesidades de cada equipo. La clave está en reaccionar, encontrar un nuevo punto de apoyo y volver al centro con una versión mejorada de la misma idea. Por eso el CV gira alrededor de esta forma viva: como metáfora de flexibilidad, curiosidad y capacidad de adaptación continua.`,
    meta: '' // sin meta
  },

  // 🔻 SECCIÓN FINAL: CONTACTO + ICONOS
  {
    side: 'left',
    kicker: 'CONTACTO',
    title: 'Gracias por llegar hasta aquí.',
    subtitle: '¿Hablamos?',
    body: `Si te encaja mi perfil, estaré encantado de seguir la conversación.
Podemos hablar sobre prácticas, posiciones junior o colaborar en proyectos donde
haga falta alguien que disfrute del front-end, las animaciones y las ideas nuevas.`,
    meta: '', // ya no mostramos texto, solo iconos
    links: {
      email:
        'https://mail.google.com/mail/?view=cm&fs=1&to=adrianperez0111uni@gmail.com&su=Contacto%20desde%20tu%20CV%20&body=Hola%20Adri%C3%A1n%2C%0A%0AHe%20visto%20tu%20CV%20y%20me%20gustar%C3%ADa%20hablar%20contigo%20sobre...',
      github: 'https://github.com/AdrianPerez221',
      linkedin: 'https://www.linkedin.com/in/adrián-pérez-745a1a366'
    }
  }
]

// Iconos SVG sencillos para no depender de librerías externas
const MailIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    {...props}
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
      ry="2"
      stroke="currentColor"
      strokeWidth="1.8"
    />
    <path
      d="M5 7.5L12 12.5L19 7.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const GithubIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.58 2 12.18C2 16.56 4.87 20.23 8.84 21.5C9.34 21.59 9.52 21.3 9.52 21.05C9.52 20.83 9.51 20.22 9.51 19.47C7 19.99 6.35 18.53 6.35 18.53C5.89 17.39 5.2 17.08 5.2 17.08C4.27 16.45 5.27 16.46 5.27 16.46C6.3 16.54 6.84 17.53 6.84 17.53C7.75 19.16 9.3 18.69 9.9 18.44C9.99 17.74 10.27 17.27 10.57 17.03C8.61 16.79 6.53 16.01 6.53 12.72C6.53 11.76 6.86 10.99 7.41 10.4C7.32 10.16 7.03 9.27 7.49 8.03C7.49 8.03 8.21 7.77 9.5 8.69C10.18 8.5 10.9 8.41 11.62 8.41C12.34 8.41 13.06 8.5 13.74 8.69C15.03 7.77 15.74 8.03 15.74 8.03C16.2 9.27 15.91 10.16 15.82 10.4C16.37 10.99 16.7 11.76 16.7 12.72C16.7 16.02 14.61 16.78 12.64 17.02C13.01 17.34 13.34 17.96 13.34 18.92C13.34 20.23 13.33 21.24 13.33 21.05C13.33 21.3 13.51 21.6 14.02 21.5C17.98 20.23 20.86 16.56 20.86 12.18C20.86 6.58 16.38 2 10.86 2H12Z" />
  </svg>
)

const LinkedinIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M4.98 3.5C4.98 4.6 4.09 5.5 3 5.5C1.91 5.5 1.02 4.6 1.02 3.5C1.02 2.4 1.91 1.5 3 1.5C4.09 1.5 4.98 2.4 4.98 3.5ZM5.2 7.5H0.8V22.5H5.2V7.5ZM13.2 7.5H8.92V22.5H13.2V14.6C13.2 11.7 17 11.5 17 14.6V22.5H21.3V13.2C21.3 7.9 15.2 8.1 13.2 10.7V7.5Z" />
  </svg>
)

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
      {/* Hint flotante solo en Proyectos destacados. */}
      {section.title &&
        section.title.startsWith('Proyectos destacados') && (
          <div className="overlay-press-hint">
            <span className="overlay-press-label">Press me</span>
            <span className="overlay-press-arrow">↓</span>
          </div>
        )}

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

        {/* ICONOS DE CONTACTO SOLO EN LA SECCIÓN "CONTACTO" */}
        {section.kicker === 'CONTACTO' && section.links && (
          <div
            className="overlay-meta overlay-contact-icons"
            style={{
              display: 'flex',
              gap: '1.5rem',
              marginTop: '1.5rem',
              color: '#a3a3a3' // gris medio claro para dark y light
            }}
          >
            {/* Gmail con mensaje preparado */}
            <a
              href={section.links.email}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Enviar email"
              title="Enviar email"
              style={{ display: 'inline-flex' }}
            >
              <MailIcon width={28} height={28} />
            </a>

            {/* GitHub */}
            <a
              href={section.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              style={{ display: 'inline-flex' }}
            >
              <GithubIcon width={28} height={28} />
            </a>

            {/* LinkedIn */}
            <a
              href={section.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
              style={{ display: 'inline-flex' }}
            >
              <LinkedinIcon width={28} height={28} />
            </a>
          </div>
        )}

        {/* meta normal para el resto de secciones */}
        {section.meta && section.meta !== '' && (
          <p className="overlay-meta">{section.meta}</p>
        )}
      </a.div>
    </div>
  )
}

'use client';

import { useState } from 'react';
import {
  ArrowDown,
  ArrowUpRight,
  BookOpen,
  Coffee,
  Guitar,
  Headphones,
  Leaf,
  Target,
  Timer,
} from 'lucide-react';
import ThemeToggle from '@/components/ui/theme-toggle';
import styles from './landing-page.module.css';

const moments = [
  {
    name: 'Música',
    icon: Headphones,
    position: 'music',
    title: 'Dale play a tu pausa.',
    description: 'Escucha esa canción que te encanta. Por unos minutos, solo disfruta.',
    alt: 'Una persona disfruta de la música con audífonos.',
  },
  {
    name: 'Guitarra',
    icon: Guitar,
    position: 'guitar',
    title: 'Vuelve a tus acordes favoritos.',
    description: 'Haz espacio para crear, practicar y tocar algo que te haga sonreír.',
    alt: 'Manos tocando una guitarra acústica.',
  },
  {
    name: 'Lectura',
    icon: BookOpen,
    position: 'reading',
    title: 'Un capítulo para ti.',
    description: 'Deja que una buena historia te acompañe. Tu tiempo también es para lo que amas.',
    alt: 'Una persona lee un libro junto a una ventana.',
  },
] as const;

export default function LandingPage() {
  const [selected, setSelected] = useState(0);
  const moment = moments[selected];
  return (
    <div className={styles.landing}>
      <header className={styles.header}>
        <a href="#inicio" className={styles.brand}>
          <Timer aria-hidden="true" /> Step by step<span>un paso a la vez</span>
        </a>
        <nav aria-label="Navegación de inicio" className={styles.nav}>
          <a href="#beneficios">Por qué Pomodoro</a>
          <a href="#tus-momentos">Tu tiempo</a>
          <ThemeToggle />
          <a href="/acceso" className="secondary-button">
            Entrar <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <section id="inicio" className={styles.hero} aria-labelledby="landing-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>
            <span /> MENOS PRISA. MÁS VIDA.
          </p>
          <h1 id="landing-title">
            Enfócate en lo importante.
            <br />
            <span className={styles.accentText}>Disfruta lo que amas.</span>
          </h1>
          <p className={styles.intro}>
            Hay un tiempo para avanzar y otro para saborear un café. Encuentra tu ritmo con Pomodoro
            y haz espacio para ambos.
          </p>
          <div className={styles.actions}>
            <a href="/acceso#registro" className="primary">
              Encuentra tu ritmo <ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href="#que-es-step-by-step" className={styles.textLink}>
              Descubre cómo <ArrowDown size={16} aria-hidden="true" />
            </a>
          </div>
          <p className={styles.smallNote}>Tu enfoque. Tus pausas. Tu propio ritmo.</p>
        </div>
        <div className={styles.heroVisual}>
          <div
            role="img"
            aria-label="Una persona toma café tranquilamente junto a una ventana soleada."
            className={`${styles.photo} ${styles.coffee}`}
          />
          <div className={styles.photoLabel}>
            <Coffee size={18} aria-hidden="true" /> Una pausa también es avanzar.
          </div>
          <div className={styles.rhythm}>
            <Timer size={22} aria-hidden="true" />
            <div>
              <strong>25 min de enfoque</strong>
              <span>Después, una pausa para ti.</span>
            </div>
            <span className={styles.rhythmDot} />
          </div>
        </div>
      </section>

      <section id="que-es-step-by-step" className={styles.benefits} aria-labelledby="about-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>TUS TAREAS Y TU TIEMPO, EN UN SOLO LUGAR</p>
          <h2 id="about-title">Qué es Step by Step</h2>
          <p>
            Step by Step es una herramienta que combina una lista de tareas (ToDo) con la técnica
            Pomodoro para organizar nuestras tareas diarias. Anota tus pendientes, elige una tarea y
            avanza en bloques de concentración con pausas. Lleva el seguimiento de lo que completas
            y del tiempo que dedicas a cada tarea, paso a paso.
          </p>
        </div>
      </section>

      <section id="beneficios" className={styles.benefits} aria-labelledby="benefits-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>PEQUEÑOS BLOQUES, GRANDES PASOS</p>
          <h2 id="benefits-title">
            La productividad también
            <br />
            puede sentirse tranquila.
          </h2>
          <p>No necesitas hacerlo todo de una vez. Empieza con una tarea y dale su momento.</p>
        </div>
        <div className={styles.benefitGrid}>
          {[
            {
              icon: Target,
              title: 'Una cosa a la vez',
              text: 'Dedica un bloque a una tarea concreta y deja las distracciones para después.',
              number: '01',
            },
            {
              icon: Leaf,
              title: 'Pausas con intención',
              text: 'Alterna el esfuerzo con momentos para levantarte, respirar y volver a empezar.',
              number: '02',
            },
            {
              icon: Timer,
              title: 'Avances que puedes ver',
              text: 'Divide lo grande en pasos pequeños y reconoce el tiempo que dedicas a tus tareas.',
              number: '03',
            },
          ].map(({ icon: Icon, title, text, number }) => (
            <article key={number} className={styles.benefit}>
              <div className={styles.benefitTop}>
                <Icon size={24} aria-hidden="true" />
                <span>{number}</span>
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className={styles.cycle}>
          <span>
            <strong>25</strong> min · enfócate
          </span>
          <span aria-hidden="true">→</span>
          <span>
            <strong>5</strong> min · respira
          </span>
          <span aria-hidden="true">→</span>
          <span>Repite a tu ritmo</span>
          <p>Un punto de partida: puedes ajustar los tiempos en tu espacio.</p>
        </div>
      </section>

      <section id="tus-momentos" className={styles.moments} aria-labelledby="moments-title">
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>EL TIEMPO TAMBIÉN ES TUYO</p>
          <h2 id="moments-title">
            Disfruta lo que te gusta,
            <br />
            <span className={styles.accentText}>con el tiempo que merece.</span>
          </h2>
          <p>Organizar tu día también es reservar espacio para las cosas que te hacen bien.</p>
        </div>
        <div className={styles.momentGrid}>
          {moments.map(({ name, icon: Icon, position, alt }, index) => (
            <button
              type="button"
              key={name}
              aria-label={name}
              aria-pressed={selected === index}
              onClick={() => setSelected(index)}
              className={`${styles.momentCard} ${selected === index ? styles.selected : ''}`}
            >
              <div role="img" aria-label={alt} className={`${styles.photo} ${styles[position]}`} />
              <span>
                <Icon size={20} aria-hidden="true" />
                {name}
                <ArrowUpRight size={18} aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
        <div className={styles.momentDetail} aria-live="polite" aria-atomic="true">
          <h3>{moment.title}</h3>
          <p>{moment.description}</p>
        </div>
      </section>

      <section className={styles.invitation}>
        <Coffee size={28} aria-hidden="true" />
        <h2>
          Un día con enfoque.
          <br />
          Una vida con espacio para ti.
        </h2>
        <p>Empieza con un pequeño paso. El siguiente puede ser una buena pausa.</p>
        <a href="/acceso#registro" className="primary">
          Crear mi espacio <ArrowUpRight size={18} aria-hidden="true" />
        </a>
      </section>
    </div>
  );
}

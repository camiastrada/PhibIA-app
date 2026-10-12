import { useState } from "react";
import logo from "/images/whiteLogo.webp";
import UNRC from "/images/UNRC-logo.webp";
import facultad from "/images/facultad.webp";

interface Collaborator {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  links?: { label: string; url: string }[];
}

interface ProjectSection {
  id: string;
  title: string;
  paragraphs: string[];
  items?: string[];
}

const PROJECT = {
  name: "PhibIA",
  tagline: "Detección y reconocimiento de anfibios con inteligencia artificial",
  description: [
    "PhibIA es una aplicación desarrollada por estudiantes la Universidad Nacional de Río Cuarto (UNRC) originalmente pensada como proyecto final de la carrera de Analista en computación, combina visión por computadora y aprendizaje automático para identificar especies de anfibios a partir de imágenes y sonidos.",
    "El proyecto busca facilitar el monitoreo de la biodiversidad y contribuir a la conservación de los anfibios de la región, acercando la ciencia a la comunidad a través de una herramienta accesible y fácil de usar.",
    "El objetivo principal es el de identificar especies regionales a traves de su canto y poder mejorar la precisión del modelo de IA por medio de la recolección de audios de la comunidad.",
  ],
  // highlights: [
  //   { label: "Especies registradas", value: "20+" },
  //   { label: "Modelos de IA", value: "2" },
  //   { label: "Plataformas", value: "Web" },
  //   { label: "Institución", value: "UNRC" },
  // ],
  sections: [
    {
      id: "objetivos",
      title: "Objetivos",
      paragraphs: [],
      items: [
        "Identificar especies de anfibios a partir de grabaciones de audio.",
        "Promover el monitoreo participativo de la biodiversidad regional.",
        "Generar un conjunto de datos abierto sobre anfibios de la zona.",
        "Acercar herramientas de inteligencia artificial a la comunidad científica y al público general.",
      ],
    },
    {
      id: "tecnologias",
      title: "Tecnologías",
      paragraphs: [
        "Desarrollada con React y TypeScript en el frontend, y un backend en Flask que expone los modelos de machine learning entrenados con datos de campo.",
      ],
      items: [
        "Frontend: React, TypeScript, Tailwind CSS, Vite",
        "Backend: Python, Flask",
        "IA: modelos de clasificación de imágenes y audio CNN",
        "Infraestructura: Docker, Nginx",
      ],
    },
  ] as ProjectSection[],
  repository: "https://github.com/",
  contactEmail: "phibia@unc.edu.ar",
};

const COLLABORATORS: Collaborator[] = [
  {
    id: "colab-1",
    name: "Nombre Apellido",
    role: "Líder del proyecto",
    bio: "Responsable general del proyecto y del entrenamiento de los modelos de inteligencia artificial.",
    links: [{ label: "GitHub", url: "https://github.com/" }],
  },
  {
    id: "colab-2",
    name: "Nombre Apellido",
    role: "Desarrollo backend",
    bio: "Diseño e implementación de la API, integración de modelos y despliegue de la infraestructura.",
    links: [{ label: "GitHub", url: "https://github.com/" }],
  },
  {
    id: "colab-3",
    name: "Nombre Apellido",
    role: "Desarrollo frontend",
    bio: "Diseño de la interfaz de usuario, componentes y experiencia de uso de la aplicación.",
    links: [{ label: "GitHub", url: "https://github.com/" }],
  },
  {
    id: "colab-4",
    name: "Nombre Apellido",
    role: "Recolección de datos",
    bio: "Captura de fotografías y grabaciones de campo, y curación del conjunto de datos.",
  },
  {
    id: "colab-5",
    name: "Nombre Apellido",
    role: "Recolección de datos",
    bio: "Captura de fotografías y grabaciones de campo, y curación del conjunto de datos.",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function ProjectInfo() {
  const [activeSection, setActiveSection] = useState<string>("proyecto");

  const goTo = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const navItems = [
    { id: "proyecto", label: "Proyecto" },
    ...PROJECT.sections.map((s) => ({ id: s.id, label: s.title })),
    { id: "colaboradores", label: "Colaboradores" },
  ];

  return (
    <div className="flex-1 min-h-0 h-full px-3 md:px-4 py-4 md:py-8 overflow-hidden">
      <div className="w-full h-full max-w-6xl mx-auto bg-[#004D40]/30 backdrop-blur-sm rounded-3xl shadow-2xl flex flex-col overflow-hidden">

        {/* ============ HEADER ============ */}
        <header className="shrink-0 bg-[#004D40]/80 border-b border-white/10 px-4 md:px-8 py-4">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-xl md:text-3xl font-bold text-white truncate">¿Quiénes somos?</h1>
          </div>

          {/* Nav del dashboard */}
          <nav className="flex justify-center gap-1 md:gap-2 mt-4 overflow-x-auto scrollbar-hidden">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={`shrink-0 text-xs md:text-sm font-semibold py-1.5 px-3 md:px-4 rounded-full transition-colors ${
                  activeSection === item.id
                    ? "bg-[#43A047] text-white"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </header>

        {/* ============ CUERPO ============ */}
        <main className="flex-1 overflow-y-auto scrollbar-hidden px-4 md:px-8 py-6 md:py-10 space-y-10 md:space-y-14">
          <div className="flex flex-col justify-center items-center">
            <img src={logo} alt="Logo PhibIA" className="relative size-30 md:size-50 object-contain -my-7 md:-my-12" />
            <p className="text-xs md:text-sm text-white truncate">{PROJECT.tagline}</p>
          </div>
          {/* Sección: Proyecto */}
          <section id="proyecto" className="scroll-mt-4">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">Sobre el proyecto</h2>
            <div className="bg-white/80 rounded-2xl shadow-lg p-4 md:p-6 text-[#004D40] space-y-3">
              {PROJECT.description.map((paragraph, index) => (
                <p key={index} className="text-sm md:text-base leading-relaxed">{paragraph}</p>
              ))}
            </div>

            {/* Métricas destacadas */}
            {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-4">
              {PROJECT.highlights.map((stat) => (
                <div key={stat.label} className="bg-white/90 rounded-2xl shadow-lg p-4 text-center">
                  <p className="text-xl md:text-3xl font-bold text-[#43A047]">{stat.value}</p>
                  <p className="text-xs md:text-sm text-[#004D40]/80 mt-1">{stat.label}</p>
                </div>
              ))}
            </div> */}
          </section>

          {/* Secciones dinámicas (objetivos, tecnologías, ...) */}
          {PROJECT.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-4">
              <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">{section.title}</h2>
              <div className="bg-white/90 rounded-2xl shadow-lg p-4 md:p-6 text-[#004D40]">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm md:text-base leading-relaxed mb-3">{paragraph}</p>
                ))}
                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm md:text-base">
                        <span className="mt-1.5 w-2 h-2 shrink-0 rounded-full bg-[#43A047]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}

          {/* Sección: Colaboradores */}
          <section id="colaboradores" className="scroll-mt-4">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">Colaboradores</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {COLLABORATORS.map((person) => (
                <div
                  key={person.id}
                  className="bg-white/90 rounded-2xl shadow-lg p-4 md:p-5 text-[#004D40] flex flex-col items-center text-center"
                >
                  {person.avatar ? (
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[#43A047] text-white flex items-center justify-center text-2xl font-bold mb-3">
                      {getInitials(person.name)}
                    </div>
                  )}

                  <h3 className="text-base md:text-lg font-bold">{person.name}</h3>
                  <p className="text-xs md:text-sm font-semibold text-[#43A047] mb-2">{person.role}</p>
                  <p className="text-xs md:text-sm text-[#004D40]/80 flex-1">{person.bio}</p>

                  {person.links && person.links.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {person.links.map((link) => (
                        <a
                          key={link.label}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold bg-[#004D40]/10 hover:bg-[#004D40]/20 text-[#004D40] py-1 px-3 rounded-lg transition-colors"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Sección: Institución */}
          <section id="institucion" className="scroll-mt-4">
            <h2 className="text-lg md:text-2xl font-bold text-white mb-3 md:mb-4">Institución</h2>
            <div className="bg-white/90 rounded-2xl shadow-lg p-4 md:p-6 text-[#004D40] flex flex-row items-center justify-around text-center">
              <a href="https://www.unrc.edu.ar/index.php" target="_blank" rel="noopener noreferrer">
                <img src={UNRC} alt="Logo UNRC" className="w-32 md:w-48 object-contain mb-3" />
              </a>
              <a href="https://www.exa.unrc.edu.ar/" target="_blank" rel="noopener noreferrer">
                <img src={facultad} alt="Logo Facultad de Ciencias Exactas" className="w-50 md:w-48 object-contain mb-3" />
              </a>
            </div>
          </section>
        </main>

        {/* ============ FOOTER ============ */}
        <footer className="shrink-0 bg-[#004D40]/80 border-t border-white/10 px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
            <div className="flex flex-row justify-around items-center gap-2 text-white/80 text-xs md:text-sm">
              <img src={logo} alt="Logo PhibIA" className="relative mx-5 -mt-2 size-15 object-contain" />
              <span>
                {PROJECT.name} © {new Date().getFullYear()} — Universidad Nacional de Río Cuarto
              </span>
            </div>

            <div className="flex items-center gap-3 md:gap-4 text-xs md:text-sm">
              <a
                href={`mailto:${PROJECT.contactEmail}`}
                className="text-white/80 hover:text-white transition-colors"
              >
                Contacto
              </a>
              <a
                href={PROJECT.repository}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/80 hover:text-white transition-colors"
              >
                Repositorio
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default ProjectInfo;

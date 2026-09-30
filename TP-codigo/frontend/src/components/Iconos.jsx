export function IconoLogo(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3v7a5 5 0 0 0 10 0V3" />
      <path d="M6 3H4M16 3h2" />
      <circle cx="19" cy="15" r="2.4" />
      <path d="M16 10v2a3 3 0 0 1-3 3" />
    </svg>
  );
}

export function IconoCalendario(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export function IconoCalendarioCheck(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M9 15l2 2 4-4" />
    </svg>
  );
}

export function IconoPortapapeles(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="6" y="4" width="12" height="17" rx="2" />
      <rect x="9" y="2" width="6" height="4" rx="1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  );
}

export function IconoGrafico(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
      <path d="M2 20h20" />
    </svg>
  );
}

export function IconoHistorial(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 12a8 8 0 1 1-2.4-5.7" />
      <path d="M20 4v5h-5" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}

export function IconoPersona(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" />
    </svg>
  );
}

export function IconoMedico(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="7" r="3.2" />
      <path d="M5.5 21c0-4 3-6.5 6.5-6.5s6.5 2.5 6.5 6.5" />
      <path d="M10.4 14.7v2a1.6 1.6 0 0 0 3.2 0v-2" />
    </svg>
  );
}

export function IconoReceta(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 3h10v18l-5-3-5 3z" />
      <path d="M9.5 8h5M9.5 11.5h5" />
    </svg>
  );
}

export function IconoHospital(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 21V7l8-4 8 4v14" />
      <path d="M9 21v-6h6v6" />
      <path d="M12 7v4M10 9h4" />
    </svg>
  );
}

export function IconoFrasco(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 2h6M10 2v6l-4.5 8.5A2 2 0 0 0 7.3 20h9.4a2 2 0 0 0 1.8-3.5L14 8V2" />
      <path d="M8 14h8" />
    </svg>
  );
}

export function IconoUrgencia(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 16V9a2 2 0 0 1 2-2h6l4 4h4a2 2 0 0 1 2 2v3" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
      <path d="M9 7v6M6 10h6" />
    </svg>
  );
}

export function IconoCandado(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

const mapa = {
  calendario: IconoCalendario,
  calendarioCheck: IconoCalendarioCheck,
  portapapeles: IconoPortapapeles,
  grafico: IconoGrafico,
  historial: IconoHistorial,
  persona: IconoPersona,
  medico: IconoMedico,
  receta: IconoReceta,
  hospital: IconoHospital,
  frasco: IconoFrasco,
  urgencia: IconoUrgencia,
  candado: IconoCandado,
};

export function Icono({ nombre, ...props }) {
  const Componente = mapa[nombre];
  if (!Componente) return null;
  return <Componente {...props} />;
}
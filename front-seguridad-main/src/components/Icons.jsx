import React from 'react';

// Detallado Icono de Flor (Logo y Placeholder de Producto)
export function FlowerIcon({ size = 24, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <radialGradient id="petalGrad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FB7185" />
          <stop offset="70%" stopColor="#E11D48" />
          <stop offset="100%" stopColor="#9F1239" />
        </radialGradient>
        <radialGradient id="petalGrad2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="70%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#831843" />
        </radialGradient>
        <linearGradient id="stemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
      </defs>
      {/* Tallo */}
      <path d="M32 32 C32 45, 26 52, 28 60" stroke="url(#stemGrad)" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Hojas */}
      <path d="M29 46 C20 46, 18 38, 28 40" fill="url(#stemGrad)" />
      <path d="M31 52 C40 52, 42 44, 32 46" fill="url(#stemGrad)" />
      {/* Pétalos de atrás */}
      <circle cx="32" cy="18" r="10" fill="url(#petalGrad1)" opacity="0.9" />
      <circle cx="20" cy="28" r="10" fill="url(#petalGrad1)" opacity="0.9" />
      <circle cx="44" cy="28" r="10" fill="url(#petalGrad1)" opacity="0.9" />
      <circle cx="24" cy="40" r="10" fill="url(#petalGrad1)" opacity="0.9" />
      <circle cx="40" cy="40" r="10" fill="url(#petalGrad1)" opacity="0.9" />
      {/* Pétalos de adelante */}
      <circle cx="32" cy="24" r="9" fill="url(#petalGrad2)" />
      <circle cx="24" cy="32" r="9" fill="url(#petalGrad2)" />
      <circle cx="40" cy="32" r="9" fill="url(#petalGrad2)" />
      {/* Centro de la flor */}
      <circle cx="32" cy="32" r="7" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
      <circle cx="30" cy="30" r="2" fill="#FFE082" />
    </svg>
  );
}

// Detallado Icono de Dashboard (Gráficos)
export function DashboardIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="dbGrad1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="dbGrad2" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#67E8F9" />
        </linearGradient>
        <linearGradient id="dbGrad3" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#B91C5C" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
      {/* Cuadrícula de fondo */}
      <rect x="6" y="6" width="52" height="52" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
      <line x1="6" y1="46" x2="58" y2="46" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="6" y1="32" x2="58" y2="32" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="6" y1="18" x2="58" y2="18" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" />
      {/* Columnas */}
      <rect x="14" y="28" width="8" height="24" rx="2" fill="url(#dbGrad1)" />
      <rect x="28" y="14" width="8" height="38" rx="2" fill="url(#dbGrad2)" />
      <rect x="42" y="22" width="8" height="30" rx="2" fill="url(#dbGrad3)" />
      {/* Línea de tendencia */}
      <path d="M18 34 L32 20 L46 26" stroke="#FBBF24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="46" cy="26" r="3" fill="#FBBF24" />
    </svg>
  );
}

// Detallado Icono de Catálogo (Ramo/Floreria)
export function CatalogIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="catFlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DB2777" />
          <stop offset="100%" stopColor="#9D174D" />
        </linearGradient>
        <linearGradient id="catWrap" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>
      {/* Envoltura del ramo */}
      <path d="M32 60 L14 30 L50 30 Z" fill="url(#catWrap)" opacity="0.85" stroke="#A16207" strokeWidth="1.5" />
      {/* Lazito */}
      <path d="M28 44 C24 40, 20 48, 28 44" fill="#E11D48" />
      <path d="M36 44 C40 40, 44 48, 36 44" fill="#E11D48" />
      <circle cx="32" cy="44" r="3" fill="#9F1239" />
      {/* Flores dentro */}
      <circle cx="24" cy="22" r="9" fill="#F43F5E" stroke="#BE123C" strokeWidth="1" />
      <circle cx="24" cy="22" r="3" fill="#FEF08A" />
      <circle cx="40" cy="22" r="9" fill="#F43F5E" stroke="#BE123C" strokeWidth="1" />
      <circle cx="40" cy="22" r="3" fill="#FEF08A" />
      <circle cx="32" cy="14" r="10" fill="url(#catFlGrad)" stroke="#701A75" strokeWidth="1" />
      <circle cx="32" cy="14" r="3" fill="#FEF08A" />
      <circle cx="16" cy="30" r="7" fill="#FB8C00" stroke="#E65100" strokeWidth="1" />
      <circle cx="48" cy="30" r="7" fill="#FB8C00" stroke="#E65100" strokeWidth="1" />
      {/* Hojas decorativas */}
      <path d="M16 18 C10 16, 12 8, 20 14" fill="#10B981" />
      <path d="M48 18 C54 16, 52 8, 44 14" fill="#10B981" />
    </svg>
  );
}

// Detallado Icono de Productos (Caja / Paquete)
export function ProductsIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="boxFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="boxTop" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
      </defs>
      {/* Tapa abierta izquierda */}
      <path d="M10 20 L24 8 L32 24 L18 36 Z" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
      {/* Tapa abierta derecha */}
      <path d="M54 20 L40 8 L32 24 L46 36 Z" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
      {/* Cuerpo de la caja (frente izquierdo) */}
      <path d="M10 28 L32 38 L32 60 L10 50 Z" fill="url(#boxFront)" stroke="#78350F" strokeWidth="1.5" />
      {/* Cuerpo de la caja (frente derecho) */}
      <path d="M54 28 L32 38 L32 60 L54 50 Z" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
      {/* Interior oscuro de la caja */}
      <path d="M10 28 L32 20 L54 28 L32 38 Z" fill="#451A03" />
      {/* Relleno que asoma (ej: flores/regalo) */}
      <circle cx="32" cy="22" r="8" fill="#EC4899" />
      <circle cx="26" cy="26" r="6" fill="#F472B6" />
      <circle cx="38" cy="26" r="6" fill="#14B8A6" />
      {/* Cinta/Lazo en el frente */}
      <path d="M20 32.5 L20 54.5" stroke="#EF4444" strokeWidth="3" />
      <path d="M44 32.5 L44 54.5" stroke="#EF4444" strokeWidth="3" />
    </svg>
  );
}

// Detallado Icono de Reportes (Tendencias / PDF)
export function ReportsIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="repPaper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>
      {/* Hoja de Reporte */}
      <rect x="10" y="6" width="44" height="52" rx="4" fill="url(#repPaper)" stroke="#94A3B8" strokeWidth="2.5" />
      {/* Esquina doblada */}
      <path d="M42 6 L54 18 L42 18 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="1.5" />
      {/* Líneas de texto */}
      <line x1="16" y1="16" x2="36" y2="16" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="24" x2="48" y2="24" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      <line x1="16" y1="32" x2="48" y2="32" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
      {/* Gráfico circular pequeño en la hoja */}
      <circle cx="24" cy="46" r="8" stroke="#10B981" strokeWidth="4" fill="none" />
      <circle cx="24" cy="46" r="8" stroke="#3B82F6" strokeWidth="4" strokeDasharray="30 50" fill="none" />
      {/* Líneas al lado del gráfico */}
      <line x1="36" y1="42" x2="48" y2="42" stroke="#94A3B8" strokeWidth="2.5" />
      <line x1="36" y1="48" x2="45" y2="48" stroke="#CBD5E1" strokeWidth="2.5" />
    </svg>
  );
}

// Detallado Icono de Usuarios (Grupo / Personas)
export function UsersIcon({ size = 20, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="userBlue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="userPink" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F472B6" />
          <stop offset="100%" stopColor="#DB2777" />
        </linearGradient>
      </defs>
      {/* Usuario Atrás Izquierda */}
      <circle cx="20" cy="28" r="8" fill="#94A3B8" />
      <path d="M8 46 C8 38, 32 38, 32 46 Z" fill="#94A3B8" />

      {/* Usuario Atrás Derecha */}
      <circle cx="44" cy="28" r="8" fill="#64748B" />
      <path d="M32 46 C32 38, 56 38, 56 46 Z" fill="#64748B" />

      {/* Usuario Delante Centro */}
      <circle cx="32" cy="20" r="10" fill="url(#userBlue)" stroke="#FFFFFF" strokeWidth="2" />
      <path d="M16 42 C16 32, 48 32, 48 42 C48 44, 46 48, 32 48 C18 48, 16 44, 16 42 Z" fill="url(#userBlue)" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

// Detallado Icono de Búsqueda (Lupa)
export function SearchIcon({ size = 18, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
      <circle cx="11" cy="11" r="8" stroke="url(#searchGlass)" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <defs>
        <linearGradient id="searchGlass" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="var(--rosa-profundo)" />
          <stop offset="100%" stopColor="var(--rosa-suave)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// Detallado Icono de Planta Potted (🌿)
export function PlantIcon({ size = 32, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#065F46" />
        </linearGradient>
        <linearGradient id="potGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#9A3412" />
        </linearGradient>
      </defs>
      {/* Hojas */}
      <path d="M32 32 C32 14, 14 18, 22 28 C28 36, 32 32, 32 32 Z" fill="url(#leafGrad)" />
      <path d="M32 32 C32 14, 50 18, 42 28 C36 36, 32 32, 32 32 Z" fill="url(#leafGrad)" />
      <path d="M32 32 C32 6, 24 10, 32 20 C40 10, 32 6, 32 32 Z" fill="#059669" />
      <path d="M32 32 C20 28, 16 36, 26 38 C32 38, 32 32, 32 32 Z" fill="url(#leafGrad)" opacity="0.9" />
      <path d="M32 32 C44 28, 48 36, 38 38 C32 38, 32 32, 32 32 Z" fill="url(#leafGrad)" opacity="0.9" />
      {/* Maceta */}
      <path d="M20 40 L44 40 L40 60 L24 60 Z" fill="url(#potGrad)" stroke="#7C2D12" strokeWidth="1.5" />
      {/* Borde superior maceta */}
      <rect x="17" y="36" width="30" height="5" rx="1.5" fill="#EA580C" stroke="#7C2D12" strokeWidth="1.5" />
    </svg>
  );
}

// Detallado Icono de Sparkle / Decoración (✨)
export function SparkleIcon({ size = 32, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#EAB308" />
          <stop offset="100%" stopColor="#CA8A04" />
        </linearGradient>
      </defs>
      {/* Destello Principal */}
      <path d="M32 4 L36 24 L56 28 L36 32 L32 52 L28 32 L8 28 L28 24 Z" fill="url(#goldGrad)" />
      {/* Destello Secundario */}
      <path d="M48 40 L50 48 L58 50 L50 52 L48 60 L46 52 L38 50 L46 48 Z" fill="url(#goldGrad)" opacity="0.8" />
      {/* Destello Pequeño */}
      <path d="M16 12 L17 17 L22 18 L17 19 L16 24 L15 19 L10 18 L15 17 Z" fill="#FEF08A" />
    </svg>
  );
}

// Detallado Icono de Regalo / Sets (🎁)
export function GiftIcon({ size = 32, className = '', ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" className={className} {...props}>
      <defs>
        <linearGradient id="giftBox" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>
        <linearGradient id="giftRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
      </defs>
      {/* Caja (cuerpo) */}
      <rect x="12" y="26" width="40" height="32" rx="3" fill="url(#giftBox)" stroke="#9F1239" strokeWidth="1.5" />
      {/* Tapa */}
      <rect x="9" y="20" width="46" height="8" rx="2" fill="#F43F5E" stroke="#9F1239" strokeWidth="1.5" />
      {/* Cinta Vertical */}
      <rect x="29" y="20" width="6" height="38" fill="url(#giftRibbon)" stroke="#B45309" strokeWidth="0.5" />
      {/* Cinta Horizontal */}
      <rect x="12" y="38" width="40" height="6" fill="url(#giftRibbon)" stroke="#B45309" strokeWidth="0.5" />
      {/* Moño / Lazo superior */}
      <path d="M32 20 C24 10, 28 4, 32 20 Z" fill="url(#giftRibbon)" stroke="#B45309" strokeWidth="1" />
      <path d="M32 20 C40 10, 36 4, 32 20 Z" fill="url(#giftRibbon)" stroke="#B45309" strokeWidth="1" />
      <circle cx="32" cy="20" r="4" fill="#D97706" />
    </svg>
  );
}

// Detallado Icono de Ramos (💐)
export function BouquetIcon({ size = 32, className = '', ...props }) {
  return <CatalogIcon size={size} className={className} {...props} />;
}

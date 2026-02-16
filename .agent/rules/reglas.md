---
trigger: always_on
---

# PROTOCOLO DE INICIALIZACIÓN: FORDRAX ANTIGRAVITY ENVIRONMENT

**ROL:** Actúa como **Lead Design Systems Architect, Senior Frontend Engineer & Principal Security Engineer**.
- Diseño futurista, Atractivo, Profesional, Corporativo
- Estética tecnológica y Psicología visual
- UX avanzado y Branding disruptivo
- Arquitectura Zero-Trust y Seguridad Militar (Anti-hacking)

**OBJETIVO:** Configurar el entorno de desarrollo, la arquitectura de carpetas, el Sistema de Diseño "Antigravity B2B" y las Fundaciones de Seguridad Absoluta antes de implementar la lógica de negocio. Crear interfaces, piezas gráficas y un entorno de ejecución que transmitan: Innovación, poder, velocidad, inteligencia artificial y liderazgo tecnológico, siendo virtualmente impenetrables.

Tu tarea es preparar el "lienzo digital" para Fordrax Solutions. No escribas lógica de negocio aún, solo estructura, estilos, seguridad y configuración base.

---

### 1. INSTALACIÓN DE PRERREQUISITOS VISUALES Y DE SEGURIDAD
Ejecuta la instalación de las dependencias obligatorias:
- **Motor Gráfico:** `framer-motion`, `clsx`, `tailwind-merge`, `lucide-react`, `mini-svg-data-uri`.
- **Seguridad y Validación:** `zod` (para validación estricta de esquemas y payloads), `dompurify` (sanitización anti-XSS en cliente/servidor).

---

### 2. CONFIGURACIÓN DEL SISTEMA DE DISEÑO (TAILWIND.CONFIG.TS)
Reemplaza la configuración por defecto. Define las variables del **Fordrax Design Token System**:

**A. Paleta de Colores (Strict B2B Premium):**
- `fordrax-black`: #0B0F14 (Fondo Base - Deep Space)
- `fordrax-panel`: #151921 (Paneles flotantes - Slightly Lighter)
- `fordrax-blue`: #0057FF (Acción Primaria - Electric Authority)
- `fordrax-cyan`: #00E5FF (Inteligencia Artificial / Data - Glow)
- `fordrax-titanium`: #64748B (Texto secundario / Bordes inactivos)
- `fordrax-danger`: #FF3333 (Alertas Críticas - Cyber Threat)

**B. Efectos Antigravity (Utilities):**
- **Box Shadows:** Define una sombra personalizada `glow-blue` y `glow-cyan` coloreada para simular luz volumétrica.
- **Animations:**
  - `float`: Animación suave de `transform: translateY` (6s) para elementos en reposo.
  - `pulse-slow`: Para los indicadores de estado de los servidores/agentes.

---

### 3. ARQUITECTURA ZERO-TRUST Y AGENTES DE SEGURIDAD (ANTI-HACKING FOUNDATION)
Como plataforma de Ciberseguridad, el entorno debe diseñarse bajo el principio de "Confianza Cero". Todo input es malicioso hasta que se demuestre lo contrario. 

**A. Defensas Pasivas (Configuración Base):**
- **Security Headers Estrictos:** Configura en `next.config.ts` las cabeceras de seguridad: Content Security Policy (CSP) restrictivo, Strict-Transport-Security (HSTS), X-Frame-Options (DENY para evitar Clickjacking) y X-Content-Type-Options (nosniff).
- **Sanitización Total:** Ningún dato se renderiza o se envía a la BD sin pasar por una validación estricta (Zod).

**B. Agentes Activos de Seguridad (Estructura Base):**
Crea la arquitectura de carpetas y los "placeholders" funcionales para los siguientes Agentes Internos que patrullarán el sistema:
1. **Agente Sentinel (WAF & Rate Limiting):** Un middleware inteligente encargado de analizar patrones de tráfico. Si detecta fuerza bruta o anomalías, bloquea temporalmente la IP o el acceso al Tenant.
2. **Agente Guardian (Identity & RLS Enforcer):** Validador constante que asegura que en cada transición de pantalla o petición API, el `auth.uid()` pertenezca estrictamente al `TenantId`. Principio Fail-Safe: ante la duda, deniega el acceso.
3. **Agente Inspector (Payload Validator):** Analiza toda entrada de datos sanitizando inputs para evitar inyecciones SQL/NoSQL, XSS y CSRF.

---

### 4. FLUJO DE TRABAJO
Crea el flujo de trabajo justificando cada una de las definiciones:
1. Analiza el objetivo del proyecto.
2. Define usuario objetivo.
3. Diseña arquitectura visual y de seguridad.
4. Propón wireframe conceptual.
5. Crea versión final.
6. Justifica cada decisión.

Siempre debes:
- Explicar el razonamiento creativo y de ciberseguridad.
- Proponer mejoras.
- Anticipar problemas UX y vulnerabilidades.
- Pensar como diseñador senior + CISO (Chief Information Security Officer).

---

### 5. ARQUITECTURA DE CARPETAS (SCAFFOLDING)
Crea la siguiente estructura de directorios física:

```text
src/
├── components/
│   ├── ui/               # Componentes base modificados al estilo Fordrax
│   ├── antigravity/      # Componentes Visuales Exclusivos (GlassPanel, NeonGradient, FloatingCard)
│   └── layout/
│       ├── Sidebar.tsx
│       └── Topbar.tsx
├── lib/
│   ├── utils.ts          # cn() helper
│   ├── design-system.ts  # Constantes de animación
│   └── security/         # Core Anti-Hacking
│       ├── sentinel.ts   # Lógica base del Agente Sentinel (Rate Limit/Traffic)
│       ├── guardian.ts   # Lógica base del Agente Guardian (Tenant Isolation)
│       └── inspector.ts  # Lógica base del Agente Inspector (Sanitización Zod)
├── styles/
│   └── globals.css       # Reset CSS y variables CSS root
└── middleware.ts         # Orquestador principal de seguridad perimetral

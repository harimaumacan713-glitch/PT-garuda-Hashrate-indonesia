// OFFICIAL HIGH-FIDELITY VECTOR SVG LOGOS FOR ALL ASSETS
// Formatted as crisp data-URIs / SVG so they render instantly with 100% reliability, zero network latency, and razor-sharp clarity.

const svgDataUri = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim().replace(/\n\s*/g, ''))}`;

// ==========================================
// 1. INDONESIAN STOCKS (IDX) - OFFICIAL LOGOS
// ==========================================

export const LOGO_BBCA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bbca_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0060B2"/>
      <stop offset="100%" stop-color="#003366"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#bbca_grad)"/>
  <!-- BCA Diamond Emblem -->
  <g transform="translate(50, 40) scale(0.65)">
    <path d="M0 -34 C12 -20, 20 -12, 34 0 C20 12, 12 20, 0 34 C-12 20, -20 12, -34 0 C-20 -12, -12 -20, 0 -34 Z" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="10" fill="#003366"/>
    <circle cx="0" cy="-21" r="4.5" fill="#003366"/>
    <circle cx="0" cy="21" r="4.5" fill="#003366"/>
    <circle cx="-21" cy="0" r="4.5" fill="#003366"/>
    <circle cx="21" cy="0" r="4.5" fill="#003366"/>
  </g>
  <text x="50" y="78" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="16" font-weight="900" text-anchor="middle" letter-spacing="1">BCA</text>
</svg>
`);

export const LOGO_BBRI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="bri_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00529C"/>
      <stop offset="100%" stop-color="#002D62"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#bri_grad)"/>
  <!-- BRI Orange Card Emblem -->
  <rect x="20" y="30" width="60" height="40" rx="8" fill="#F37021"/>
  <rect x="25" y="35" width="50" height="30" rx="5" fill="#00529C"/>
  <text x="50" y="57" fill="#FFFFFF" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" text-anchor="middle" letter-spacing="1">BRI</text>
</svg>
`);

export const LOGO_BMRI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#002855"/>
  <!-- Mandiri Golden Arc Ribbon -->
  <path d="M22 42 C36 28, 64 28, 78 42 C64 34, 36 34, 22 42 Z" fill="#F8A01A"/>
  <path d="M25 45 C38 33, 62 33, 75 45 C62 38, 38 38, 25 45 Z" fill="#FFC72C"/>
  <!-- Mandiri Typography -->
  <text x="50" y="65" fill="#FFFFFF" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle" letter-spacing="0.5">mandiri</text>
</svg>
`);

export const LOGO_BBNI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- BNI Turquoise Badge -->
  <rect x="16" y="28" width="68" height="44" rx="8" fill="#00667F"/>
  <text x="40" y="58" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="22" font-weight="900" text-anchor="middle">BNI</text>
  <!-- Orange 46 Badge -->
  <circle cx="68" cy="42" r="9" fill="#F15A24"/>
  <text x="68" y="46" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="10" font-weight="900" text-anchor="middle">46</text>
</svg>
`);

export const LOGO_TLKM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Telkom Red Sphere Swirl & Grey Crescent -->
  <g transform="translate(50, 45) scale(0.9)">
    <circle cx="0" cy="0" r="26" fill="#EE2737"/>
    <path d="M-6 -20 C14 -20, 26 -4, 24 14 C16 6, 2 2, -6 -2 Z" fill="#6D6E71"/>
    <circle cx="-4" cy="-2" r="14" fill="#FFFFFF"/>
    <circle cx="-6" cy="-2" r="10" fill="#EE2737"/>
  </g>
  <text x="50" y="84" fill="#EE2737" font-family="Arial, sans-serif" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="1">TELKOM</text>
</svg>
`);

export const LOGO_ASII = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#003B70"/>
  <!-- Astra International 10-point Star Compass -->
  <g transform="translate(50, 42) scale(0.68)">
    <polygon points="0,-38 11,-12 36,-12 16,3 23,28 0,13 -23,28 -16,3 -36,-12 -11,-12" fill="#FFFFFF"/>
  </g>
  <text x="50" y="78" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="13" font-weight="900" text-anchor="middle" letter-spacing="1.5">ASTRA</text>
</svg>
`);

export const LOGO_BREN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#00875A"/>
  <!-- Barito Renewables Energy Leaf & Flame -->
  <path d="M50 20 C32 36, 28 58, 50 80 C72 58, 68 36, 50 20 Z" fill="#E3FCEF"/>
  <path d="M50 32 C40 44, 38 58, 50 70 C62 58, 60 44, 50 32 Z" fill="#00875A"/>
  <circle cx="50" cy="50" r="6" fill="#36B37E"/>
</svg>
`);

export const LOGO_AMMN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#1C2B39"/>
  <!-- Amman Mineral Copper Gold Peak -->
  <polygon points="50,22 76,70 24,70" fill="#C59B27"/>
  <polygon points="50,38 68,70 32,70" fill="#1C2B39"/>
  <polygon points="50,48 60,70 40,70" fill="#E5A93C"/>
</svg>
`);

export const LOGO_GOTO = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#00AA13"/>
  <!-- GoTo Official Target Dot Symbol -->
  <circle cx="50" cy="50" r="28" fill="#FFFFFF"/>
  <circle cx="50" cy="50" r="16" fill="#00AA13"/>
  <circle cx="50" cy="50" r="6" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_ICBP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#004380"/>
  <!-- Indofood CBP Ribbon -->
  <path d="M18 38 L82 38 L72 66 L28 66 Z" fill="#E31B23"/>
  <text x="50" y="58" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="13" font-weight="900" font-style="italic" text-anchor="middle">Indofood</text>
</svg>
`);

export const LOGO_ANTM = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#004D40"/>
  <!-- Antam Gold Cube / Diamond Emblem -->
  <circle cx="50" cy="50" r="32" fill="#D4AF37"/>
  <polygon points="50,26 64,50 50,74 36,50" fill="#004D40"/>
  <circle cx="50" cy="50" r="7" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_ADRO = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#0E4B33"/>
  <path d="M50 20 C28 42, 34 70, 50 80 C66 70, 72 42, 50 20 Z" fill="#48BB78"/>
  <circle cx="50" cy="54" r="11" fill="#ECC94B"/>
</svg>
`);

export const LOGO_PTBA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#1B365D"/>
  <polygon points="50,22 78,74 22,74" fill="#EAA221"/>
  <polygon points="50,38 70,74 30,74" fill="#1B365D"/>
  <polygon points="50,52 62,74 38,74" fill="#EAA221"/>
</svg>
`);

export const LOGO_UNVR = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#1F36C7"/>
  <!-- Unilever Stylized U Emblem -->
  <path d="M32 26 C32 26, 28 52, 42 68 C50 78, 64 74, 68 64 C72 52, 70 26, 70 26 C65 35, 60 50, 56 52 C52 54, 48 52, 44 42 C42 36, 38 30, 32 26 Z" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_KLBF = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#009639"/>
  <path d="M50 20 C30 38, 30 64, 50 80 C70 64, 70 38, 50 20 Z" fill="#FFFFFF"/>
  <path d="M50 30 C38 44, 38 60, 50 70 C62 60, 62 44, 50 30 Z" fill="#009639"/>
</svg>
`);

export const LOGO_TPIA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="tpia_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#006699"/>
      <stop offset="100%" stop-color="#009966"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#tpia_grad)"/>
  <!-- Chandra Asri Chemical Molecule Arc -->
  <circle cx="50" cy="40" r="16" fill="none" stroke="#FFFFFF" stroke-width="4"/>
  <circle cx="50" cy="40" r="8" fill="#FFFFFF"/>
  <circle cx="34" cy="54" r="5" fill="#A8FFD4"/>
  <circle cx="66" cy="54" r="5" fill="#A8FFD4"/>
  <line x1="40" y1="48" x2="34" y2="54" stroke="#FFFFFF" stroke-width="3"/>
  <line x1="60" y1="48" x2="66" y2="54" stroke="#FFFFFF" stroke-width="3"/>
  <text x="50" y="78" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="14" font-weight="900" text-anchor="middle" letter-spacing="1">TPIA</text>
</svg>
`);

export const LOGO_SMGR = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#CC0000"/>
  <!-- Semen Indonesia SIG Hexagon Emblem -->
  <polygon points="50,22 72,35 72,61 50,74 28,61 28,35" fill="#FFFFFF"/>
  <polygon points="50,28 66,38 66,58 50,68 34,58 34,38" fill="#CC0000"/>
  <text x="50" y="54" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="12" font-weight="900" text-anchor="middle">SIG</text>
  <text x="50" y="86" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="10" font-weight="900" text-anchor="middle">SMGR</text>
</svg>
`);

export const LOGO_LABA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#059669"/>
  <circle cx="50" cy="50" r="30" fill="#FFFFFF"/>
  <path d="M50 26 L64 64 L36 64 Z" fill="#059669"/>
  <text x="50" y="85" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="10" font-weight="900" text-anchor="middle">LABA</text>
</svg>
`);

// ==========================================
// 2. CRYPTOCURRENCY - OFFICIAL EMBEDDED VECTOR SVGS
// ==========================================

export const LOGO_BTC = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#F7931A"/>
  <!-- Official Bitcoin Symbol tilted 14 degrees -->
  <g transform="translate(50, 50) rotate(14) translate(-50, -50)">
    <path d="M63 43 C65 38, 62 33, 54 31 L54 24 L48 24 L48 31 L44 31 L44 24 L38 24 L38 31 L28 31 L28 37 L33 37 C35 37, 36 38, 36 40 L36 60 C36 62, 35 63, 33 63 L28 63 L28 69 L38 69 L38 76 L44 76 L44 69 L48 69 L48 76 L54 76 L54 69 C65 67, 69 61, 67 52 C65 47, 60 44, 55 44 C60 44, 64 41, 63 43 Z M44 37 L52 37 C56 37, 58 39, 58 43 C58 47, 56 49, 52 49 L44 49 L44 37 Z M44 63 L44 55 L54 55 C58 55, 60 57, 60 61 C60 65, 58 67, 54 67 L44 63 Z" fill="#FFFFFF"/>
  </g>
</svg>
`);

export const LOGO_ETH = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#627EEA"/>
  <!-- Official Ethereum Faceted Diamond -->
  <g transform="translate(50, 50) scale(0.68) translate(-50, -50)">
    <polygon points="50,15 50,48 24,59" fill="#FFFFFF" fill-opacity="0.6"/>
    <polygon points="50,15 76,59 50,48" fill="#FFFFFF"/>
    <polygon points="50,48 50,85 24,59" fill="#FFFFFF" fill-opacity="0.6"/>
    <polygon points="50,48 76,59 50,85" fill="#FFFFFF"/>
    <polygon points="50,48 24,59 50,54" fill="#C0CBF6"/>
    <polygon points="50,48 50,54 76,59" fill="#FFFFFF" fill-opacity="0.8"/>
  </g>
</svg>
`);

export const LOGO_BNB = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#F3BA2F"/>
  <!-- Official BNB Interlocking Diamonds -->
  <g transform="translate(50, 50) scale(0.7) translate(-50, -50)">
    <polygon points="50,22 62,34 50,46 38,34" fill="#FFFFFF"/>
    <polygon points="26,46 38,58 26,70 14,58" fill="#FFFFFF"/>
    <polygon points="74,46 86,58 74,70 62,58" fill="#FFFFFF"/>
    <polygon points="50,70 62,82 50,94 38,82" fill="#FFFFFF"/>
    <polygon points="50,49 61,60 50,71 39,60" fill="#FFFFFF"/>
  </g>
</svg>
`);

export const LOGO_SOL = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="sol_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00FFA3"/>
      <stop offset="100%" stop-color="#DC1FFF"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="#141414"/>
  <!-- Official Solana 3 Speed Bars -->
  <g transform="translate(50, 50) scale(0.65) translate(-50, -50)">
    <path d="M22 36 L70 36 L78 24 L30 24 Z" fill="url(#sol_grad)"/>
    <path d="M30 56 L78 56 L70 44 L22 44 Z" fill="url(#sol_grad)"/>
    <path d="M22 76 L70 76 L78 64 L30 64 Z" fill="url(#sol_grad)"/>
  </g>
</svg>
`);

export const LOGO_XRP = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#23292F"/>
  <!-- Official XRP Stylized X -->
  <path d="M30 28 C34 28, 44 38, 50 44 C56 38, 66 28, 70 28 L78 28 C72 34, 58 48, 50 56 C42 48, 28 34, 22 28 Z M30 72 C34 72, 44 62, 50 56 C56 62, 66 72, 70 72 L78 72 C72 66, 58 52, 50 44 C42 52, 28 66, 22 72 Z" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_ADA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#0033AD"/>
  <circle cx="50" cy="50" r="10" fill="#FFFFFF"/>
  <circle cx="50" cy="24" r="5" fill="#FFFFFF"/>
  <circle cx="50" cy="76" r="5" fill="#FFFFFF"/>
  <circle cx="24" cy="50" r="5" fill="#FFFFFF"/>
  <circle cx="76" cy="50" r="5" fill="#FFFFFF"/>
  <circle cx="32" cy="32" r="4" fill="#FFFFFF" fill-opacity="0.8"/>
  <circle cx="68" cy="32" r="4" fill="#FFFFFF" fill-opacity="0.8"/>
  <circle cx="32" cy="68" r="4" fill="#FFFFFF" fill-opacity="0.8"/>
  <circle cx="68" cy="68" r="4" fill="#FFFFFF" fill-opacity="0.8"/>
</svg>
`);

export const LOGO_DOGE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#C2A633"/>
  <text x="46" y="68" fill="#FFFFFF" font-family="'Times New Roman', Georgia, serif" font-size="52" font-weight="bold" text-anchor="middle">Ð</text>
  <rect x="42" y="44" width="22" height="7" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_AVAX = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#E84142"/>
  <polygon points="50,22 76,74 62,74 50,48 38,74 24,74" fill="#FFFFFF"/>
  <polygon points="68,54 78,74 58,74" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_MATIC = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#8247E5"/>
  <g transform="translate(50, 50) scale(0.65) translate(-50, -50)">
    <path d="M50 30 L66 40 L66 60 L50 70 L34 60 L34 40 Z" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>
    <circle cx="50" cy="50" r="8" fill="#FFFFFF"/>
  </g>
</svg>
`);

export const LOGO_LINK = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#375BD2"/>
  <polygon points="50,22 74,36 74,64 50,78 26,64 26,36" fill="none" stroke="#FFFFFF" stroke-width="8" stroke-linejoin="round"/>
  <rect x="44" y="38" width="12" height="24" rx="3" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_DOT = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#E6007A"/>
  <circle cx="50" cy="38" r="16" fill="#FFFFFF"/>
  <rect x="34" y="38" width="12" height="36" rx="6" fill="#FFFFFF"/>
  <circle cx="50" cy="68" r="6" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_NEAR = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#000000"/>
  <path d="M30 72 L30 28 L46 28 L64 56 L64 28 L74 28 L74 72 L58 72 L40 44 L40 72 Z" fill="#00EC97"/>
</svg>
`);

export const LOGO_SUI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#4DA2FF"/>
  <!-- Sui Water Drop -->
  <path d="M50 20 C50 20, 26 50, 26 64 C26 77, 37 86, 50 86 C63 86, 74 77, 74 64 C74 50, 50 20, 50 20 Z" fill="#FFFFFF"/>
  <path d="M50 36 C50 36, 36 56, 36 66 C36 74, 42 78, 50 78 Z" fill="#4DA2FF"/>
</svg>
`);

export const LOGO_PEPE = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#48A342"/>
  <circle cx="36" cy="38" r="14" fill="#FFFFFF"/>
  <circle cx="64" cy="38" r="14" fill="#FFFFFF"/>
  <circle cx="36" cy="38" r="6" fill="#000000"/>
  <circle cx="64" cy="38" r="6" fill="#000000"/>
  <path d="M26 62 C34 74, 66 74, 74 62" stroke="#B81414" stroke-width="8" stroke-linecap="round" fill="none"/>
</svg>
`);

export const LOGO_SHIB = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#FFA409"/>
  <!-- Shiba Inu Silhouette -->
  <polygon points="50,30 68,52 62,74 38,74 32,52" fill="#FFFFFF"/>
  <polygon points="26,30 36,50 22,50" fill="#E84142"/>
  <polygon points="74,30 64,50 78,50" fill="#E84142"/>
  <circle cx="42" cy="52" r="3" fill="#000000"/>
  <circle cx="58" cy="52" r="3" fill="#000000"/>
  <polygon points="50,60 54,66 46,66" fill="#000000"/>
</svg>
`);

export const LOGO_TON = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#0098EA"/>
  <!-- TON Crystal / Paper Airplane -->
  <polygon points="50,22 76,46 50,78 24,46" fill="#FFFFFF"/>
  <polygon points="50,22 50,78 24,46" fill="#D0EFFE"/>
</svg>
`);

export const LOGO_LTC = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#345D9D"/>
  <text x="48" y="70" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="52" font-weight="bold" font-style="italic" text-anchor="middle">Ł</text>
</svg>
`);

export const LOGO_UNI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#FF007A"/>
  <!-- Uniswap Unicorn Horn -->
  <path d="M50 22 C56 38, 70 48, 76 66 C70 76, 56 78, 44 74 C34 70, 30 58, 38 46 C44 38, 48 30, 50 22 Z" fill="#FFFFFF"/>
</svg>
`);

// ==========================================
// 3. US GLOBAL STOCKS - OFFICIAL LOGOS
// ==========================================

export const LOGO_NVDA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#111111"/>
  <!-- NVIDIA Green Claw Eye -->
  <path d="M50 24 C64 24, 76 35, 76 50 C76 65, 64 76, 50 76 C41 76, 32 70, 27 63 L42 63 C44 67, 47 69, 50 69 C61 69, 69 60, 69 50 C69 40, 61 31, 50 31 C44 31, 39 34, 36 38 L26 28 C32 23, 41 24, 50 24 Z" fill="#76B900"/>
  <circle cx="50" cy="50" r="9" fill="#76B900"/>
</svg>
`);

export const LOGO_AAPL = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#000000"/>
  <!-- Apple Bitten Silhouette -->
  <path d="M52 23 C55 20, 58 18, 62 17 C62 21, 59 24, 56 26 C53 28, 50 28, 49 25 C49 24, 50 23, 52 23 Z M65 52 C65 43, 72 38, 72 38 C67 31, 59 31, 56 31 C50 31, 45 34, 42 34 C38 34, 34 31, 29 31 C21 31, 14 37, 14 47 C14 59, 25 75, 31 75 C35 75, 37 72, 42 72 C47 72, 48 75, 53 75 C59 75, 64 64, 67 59 C62 57, 65 52, 65 52 Z" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_TSLA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#E82127"/>
  <!-- Tesla T Shield Logo -->
  <g transform="translate(50, 50) scale(0.8) translate(-50, -50)">
    <path d="M50 26 L74 26 C70 31, 62 33, 50 33 C38 33, 30 31, 26 26 Z" fill="#FFFFFF"/>
    <path d="M50 36 C58 36, 66 40, 68 47 L56 47 L54 74 L46 74 L44 47 L32 47 C34 40, 42 36, 50 36 Z" fill="#FFFFFF"/>
  </g>
</svg>
`);

export const LOGO_MSFT = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Microsoft 4-Color Tiles -->
  <rect x="25" y="25" width="22" height="22" rx="2" fill="#F25022"/>
  <rect x="53" y="25" width="22" height="22" rx="2" fill="#7FBA00"/>
  <rect x="25" y="53" width="22" height="22" rx="2" fill="#00A4EF"/>
  <rect x="53" y="53" width="22" height="22" rx="2" fill="#FFB900"/>
</svg>
`);

export const LOGO_AMZN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#232F3E"/>
  <text x="50" y="47" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle">amazon</text>
  <!-- Amazon Orange Smile Arrow -->
  <path d="M28 56 C42 66, 58 66, 72 56" stroke="#FF9900" stroke-width="4.5" stroke-linecap="round" fill="none"/>
  <polygon points="72,56 65,52 68,60" fill="#FF9900"/>
</svg>
`);

export const LOGO_GOOGL = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- Google Multi-color G -->
  <path d="M72 50 C72 48.5, 71.8 46.8, 71.5 45.2 L50 45.2 L50 54.8 L62.5 54.8 C62 57.8, 60 60.8, 57 62.8 L65 68.8 C70 64.2, 72 57.8, 72 50 Z" fill="#4285F4"/>
  <path d="M50 72 C56.5 72, 62 69.8, 65 68.8 L57 62.8 C55 64.2, 52.8 65, 50 65 C43.5 65, 38 60.5, 36 54.8 L28 60.8 C32 68.2, 40.5 72, 50 72 Z" fill="#34A853"/>
  <path d="M36 54.8 C35.5 53.2, 35.2 51.6, 35.2 50 C35.2 48.4, 35.5 46.8, 36 45.2 L28 39.2 C26.5 42.4, 25.5 46, 25.5 50 C25.5 54, 26.5 57.6, 28 60.8 L36 54.8 Z" fill="#FBBC05"/>
  <path d="M50 35 C53.8 35, 57 36.4, 59.5 38.8 L66.5 31.8 C62 27.6, 56.5 25.5, 50 25.5 C40.5 25.5, 32 29.8, 28 39.2 L36 45.2 C38 39.5, 43.5 35, 50 35 Z" fill="#EA4335"/>
</svg>
`);

export const LOGO_META = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#0668E1"/>
  <!-- Meta Infinity Loop -->
  <path d="M50 56 C44 42, 36 34, 28 34 C20 34, 16 42, 16 52 C16 62, 22 70, 30 70 C38 70, 46 62, 50 56 C54 62, 62 70, 70 70 C78 70, 84 62, 84 52 C84 42, 80 34, 72 34 C64 34, 56 42, 50 56 Z M28 42 C33 42, 38 48, 42 54 C37 60, 33 62, 29 62 C24 62, 23 58, 23 52 C23 46, 25 42, 28 42 Z M72 42 C75 42, 77 46, 77 52 C77 58, 76 62, 71 62 C67 62, 63 60, 58 54 C62 48, 67 42, 72 42 Z" fill="#FFFFFF"/>
</svg>
`);

export const LOGO_NFLX = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#141414"/>
  <!-- Netflix Red N Ribbon -->
  <path d="M30 22 L42 22 L42 78 L30 78 Z" fill="#E50914"/>
  <path d="M58 22 L70 22 L70 78 L58 78 Z" fill="#E50914"/>
  <path d="M30 22 L70 78 L58 78 L30 38 Z" fill="#B81D24"/>
</svg>
`);

export const LOGO_AMD = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#000000"/>
  <rect x="22" y="22" width="24" height="24" fill="#ED1C24"/>
  <polygon points="50,22 78,22 78,50 66,50 66,34 50,34" fill="#ED1C24"/>
  <polygon points="78,54 78,78 54,78 54,66 66,66 66,54" fill="#ED1C24"/>
  <text x="50" y="90" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="11" font-weight="900" text-anchor="middle">AMD</text>
</svg>
`);

export const LOGO_INTC = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#0068B5"/>
  <text x="50" y="58" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="22" font-weight="bold" text-anchor="middle" letter-spacing="-0.5">intel</text>
</svg>
`);

export const LOGO_COIN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#0052FF"/>
  <circle cx="50" cy="50" r="26" fill="#FFFFFF"/>
  <circle cx="50" cy="50" r="14" fill="#0052FF"/>
  <rect x="48" y="24" width="20" height="52" fill="#0052FF"/>
</svg>
`);

// ==========================================
// 4. COMMODITIES & FOREX - OFFICIAL LOGOS
// ==========================================

export const LOGO_GOLD = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="gold_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF099"/>
      <stop offset="35%" stop-color="#D4AF37"/>
      <stop offset="70%" stop-color="#AA771C"/>
      <stop offset="100%" stop-color="#553A08"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#gold_grad)"/>
  <!-- Gold Ingot Bar -->
  <polygon points="25,36 75,36 68,64 32,64" fill="#FFE175"/>
  <polygon points="25,36 32,64 22,60 16,38" fill="#D4AF37"/>
  <polygon points="75,36 84,38 78,60 68,64" fill="#AA771C"/>
  <text x="50" y="53" fill="#855806" font-family="Arial, sans-serif" font-size="10" font-weight="900" text-anchor="middle">999.9</text>
  <text x="50" y="80" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="11" font-weight="900" text-anchor="middle" letter-spacing="1">GOLD</text>
</svg>
`);

export const LOGO_SILVER = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="silver_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="50%" stop-color="#CFD8DC"/>
      <stop offset="100%" stop-color="#78909C"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#silver_grad)"/>
  <polygon points="25,36 75,36 68,64 32,64" fill="#ECEFF1"/>
  <text x="50" y="53" fill="#455A64" font-family="Arial, sans-serif" font-size="10" font-weight="900" text-anchor="middle">999</text>
  <text x="50" y="80" fill="#37474F" font-family="Arial, sans-serif" font-size="10" font-weight="900" text-anchor="middle" letter-spacing="1">SILVER</text>
</svg>
`);

export const LOGO_SPX = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#002D62"/>
  <rect x="20" y="34" width="60" height="32" rx="4" fill="#C8102E"/>
  <text x="50" y="55" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="13" font-weight="900" text-anchor="middle">S&amp;P 500</text>
</svg>
`);

export const LOGO_NDX = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#003366"/>
  <text x="50" y="58" fill="#00B2FE" font-family="Arial, sans-serif" font-size="28" font-weight="900" font-style="italic" text-anchor="middle">N</text>
</svg>
`);

export const LOGO_EURUSD = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="48" fill="#001489"/>
  <circle cx="38" cy="50" r="22" fill="#00209F" stroke="#FFCC00" stroke-width="2"/>
  <text x="38" y="57" fill="#FFCC00" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">€</text>
  <circle cx="62" cy="50" r="22" fill="#16A34A" stroke="#FFFFFF" stroke-width="2"/>
  <text x="62" y="57" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="20" font-weight="bold" text-anchor="middle">$</text>
</svg>
`);

// ==========================================
// MASTER ASSET DATABASE & LOGO RESOLVER
// ==========================================

export type IDXSector = 
  | 'BASIC-IND'
  | 'CYCLICAL'
  | 'ENERGY'
  | 'FINANCE'
  | 'HEALTH'
  | 'INDUSTRIAL'
  | 'INFRASTRUC'
  | 'NON-CYCLICAL'
  | 'PROPERTY'
  | 'TRANSPORT'
  | 'TECHNOLOGY';

export interface AssetMeta {
  symbol: string;
  name: string;
  category: 'Saham IDX' | 'Crypto' | 'Saham Global' | 'Komoditas & Forex';
  logo: string;
  basePrice: number;
  currency: 'IDR' | 'USD';
  sector?: string;
  idxSector?: IDXSector;
  marketCap?: string;
  indices?: string[];
  specialBoards?: string[];
}

export type GlobalAssetItem = AssetMeta;

export const ALL_GLOBAL_ASSETS: AssetMeta[] = [
  // ==========================================
  // SAHAM INDONESIA (IDX) - 11 SEKTOR RESMI
  // ==========================================

  // 1. BASIC-IND (Bahan Baku & Tambang Mineral)
  { symbol: 'ANTM', name: 'PT Aneka Tambang Tbk', category: 'Saham IDX', logo: LOGO_ANTM, basePrice: 3070, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 73 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'AMMN', name: 'PT Amman Mineral Internasional Tbk', category: 'Saham IDX', logo: LOGO_AMMN, basePrice: 4270, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 309 T', indices: ['IDX30', 'LQ45', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'INCO', name: 'PT Vale Indonesia Tbk', category: 'Saham IDX', logo: generateFallbackBadge('INCO'), basePrice: 5225, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 52 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'TPIA', name: 'PT Chandra Asri Pacific Tbk', category: 'Saham IDX', logo: LOGO_TPIA, basePrice: 2010, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 174 T', indices: ['KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'INKP', name: 'PT Indah Kiat Pulp & Paper Tbk', category: 'Saham IDX', logo: generateFallbackBadge('INKP'), basePrice: 8500, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 46 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'TKIM', name: 'PT Pabrik Kertas Tjiwi Kimia Tbk', category: 'Saham IDX', logo: generateFallbackBadge('TKIM'), basePrice: 7600, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 24 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'MDKA', name: 'PT Merdeka Copper Gold Tbk', category: 'Saham IDX', logo: generateFallbackBadge('MDKA'), basePrice: 2900, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 70 T', indices: ['LQ45', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'SMGR', name: 'PT Semen Indonesia (Persero) Tbk', category: 'Saham IDX', logo: LOGO_SMGR, basePrice: 1580, currency: 'IDR', sector: 'Basic Materials', idxSector: 'BASIC-IND', marketCap: 'Rp 10.7 T', indices: ['IDX30', 'LQ45', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 2. CYCLICAL (Barang Konsumen Siklikal)
  { symbol: 'CNMA', name: 'PT Nusantara Sejahtera Raya (Cinema XXI) Tbk', category: 'Saham IDX', logo: generateFallbackBadge('CNMA'), basePrice: 95, currency: 'IDR', sector: 'Consumer Cyclicals', idxSector: 'CYCLICAL', marketCap: 'Rp 7.9 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'MAPI', name: 'PT Mitra Adiperkasa Tbk', category: 'Saham IDX', logo: generateFallbackBadge('MAPI'), basePrice: 1495, currency: 'IDR', sector: 'Consumer Cyclicals', idxSector: 'CYCLICAL', marketCap: 'Rp 24.8 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'ACES', name: 'PT Aspirasi Hidup Indonesia (Ace) Tbk', category: 'Saham IDX', logo: generateFallbackBadge('ACES'), basePrice: 354, currency: 'IDR', sector: 'Consumer Cyclicals', idxSector: 'CYCLICAL', marketCap: 'Rp 6.1 T', indices: ['LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'ERAA', name: 'PT Erajaya Swasembada Tbk', category: 'Saham IDX', logo: generateFallbackBadge('ERAA'), basePrice: 458, currency: 'IDR', sector: 'Consumer Cyclicals', idxSector: 'CYCLICAL', marketCap: 'Rp 7.3 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'AUTO', name: 'PT Astra Otoparts Tbk', category: 'Saham IDX', logo: generateFallbackBadge('AUTO'), basePrice: 2900, currency: 'IDR', sector: 'Consumer Cyclicals', idxSector: 'CYCLICAL', marketCap: 'Rp 14.0 T', indices: ['SRI-KEHATI', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 3. ENERGY (Energi & Batu Bara & Migas)
  { symbol: 'DEWA', name: 'PT Darma Henwa Tbk', category: 'Saham IDX', logo: generateFallbackBadge('DEWA'), basePrice: 420, currency: 'IDR', sector: 'Energy & Mining Services', idxSector: 'ENERGY', marketCap: 'Rp 9.2 T', indices: ['KOMPAS100', 'ISSI', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BUMI', name: 'PT Bumi Resources Tbk', category: 'Saham IDX', logo: generateFallbackBadge('BUMI'), basePrice: 181, currency: 'IDR', sector: 'Energy & Coal', idxSector: 'ENERGY', marketCap: 'Rp 67.2 T', indices: ['KOMPAS100', 'ISSI', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'ADRO', name: 'PT Alamtri Resources Indonesia (Adaro) Tbk', category: 'Saham IDX', logo: LOGO_ADRO, basePrice: 2530, currency: 'IDR', sector: 'Energy & Coal', idxSector: 'ENERGY', marketCap: 'Rp 78 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'PTBA', name: 'PT Bukit Asam Tbk', category: 'Saham IDX', logo: LOGO_PTBA, basePrice: 2360, currency: 'IDR', sector: 'Energy & Coal', idxSector: 'ENERGY', marketCap: 'Rp 27 T', indices: ['IDX30', 'LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'PGAS', name: 'PT Perusahaan Gas Negara Tbk', category: 'Saham IDX', logo: generateFallbackBadge('PGAS'), basePrice: 1495, currency: 'IDR', sector: 'Energy & Utilities', idxSector: 'ENERGY', marketCap: 'Rp 36.2 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'MEDC', name: 'PT Medco Energi Internasional Tbk', category: 'Saham IDX', logo: generateFallbackBadge('MEDC'), basePrice: 1315, currency: 'IDR', sector: 'Energy & Oil/Gas', idxSector: 'ENERGY', marketCap: 'Rp 33.1 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'AKRA', name: 'PT AKR Corporindo Tbk', category: 'Saham IDX', logo: generateFallbackBadge('AKRA'), basePrice: 1400, currency: 'IDR', sector: 'Energy & Distribution', idxSector: 'ENERGY', marketCap: 'Rp 28.1 T', indices: ['LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BREN', name: 'PT Barito Renewables Energy Tbk', category: 'Saham IDX', logo: LOGO_BREN, basePrice: 3570, currency: 'IDR', sector: 'Renewable Energy', idxSector: 'ENERGY', marketCap: 'Rp 477 T', indices: ['KOMPAS100', 'IHSG'], specialBoards: ['Day Trade', 'Trading Limit'] },

  // 4. FINANCE (Keuangan & Perbankan)
  { symbol: 'BBCA', name: 'PT Bank Central Asia Tbk', category: 'Saham IDX', logo: LOGO_BBCA, basePrice: 6350, currency: 'IDR', sector: 'Financials / Banking', idxSector: 'FINANCE', marketCap: 'Rp 782 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BBRI', name: 'PT Bank Rakyat Indonesia (Persero) Tbk', category: 'Saham IDX', logo: LOGO_BBRI, basePrice: 3120, currency: 'IDR', sector: 'Financials / Banking', idxSector: 'FINANCE', marketCap: 'Rp 473 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BMRI', name: 'PT Bank Mandiri (Persero) Tbk', category: 'Saham IDX', logo: LOGO_BMRI, basePrice: 4170, currency: 'IDR', sector: 'Financials / Banking', idxSector: 'FINANCE', marketCap: 'Rp 389 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BBNI', name: 'PT Bank Negara Indonesia (Persero) Tbk', category: 'Saham IDX', logo: LOGO_BBNI, basePrice: 3630, currency: 'IDR', sector: 'Financials / Banking', idxSector: 'FINANCE', marketCap: 'Rp 135 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BBTN', name: 'PT Bank Tabungan Negara (Persero) Tbk', category: 'Saham IDX', logo: generateFallbackBadge('BBTN'), basePrice: 1220, currency: 'IDR', sector: 'Financials / Banking', idxSector: 'FINANCE', marketCap: 'Rp 17.1 T', indices: ['LQ45', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BDMN', name: 'PT Bank Danamon Indonesia Tbk', category: 'Saham IDX', logo: generateFallbackBadge('BDMN'), basePrice: 4150, currency: 'IDR', sector: 'Financials / Banking', idxSector: 'FINANCE', marketCap: 'Rp 40.6 T', indices: ['KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BRIS', name: 'PT Bank Syariah Indonesia Tbk', category: 'Saham IDX', logo: generateFallbackBadge('BRIS'), basePrice: 1790, currency: 'IDR', sector: 'Financials / Islamic Banking', idxSector: 'FINANCE', marketCap: 'Rp 82.6 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 5. HEALTH (Kesehatan & Farmasi & Rumah Sakit)
  { symbol: 'KLBF', name: 'PT Kalbe Farma Tbk', category: 'Saham IDX', logo: LOGO_KLBF, basePrice: 800, currency: 'IDR', sector: 'Healthcare & Pharma', idxSector: 'HEALTH', marketCap: 'Rp 37.5 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'MIKA', name: 'PT Mitra Keluarga Karyasehat Tbk', category: 'Saham IDX', logo: generateFallbackBadge('MIKA'), basePrice: 1760, currency: 'IDR', sector: 'Healthcare / Hospitals', idxSector: 'HEALTH', marketCap: 'Rp 25.1 T', indices: ['LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'HEAL', name: 'PT Medikaloka Hermina Tbk', category: 'Saham IDX', logo: generateFallbackBadge('HEAL'), basePrice: 710, currency: 'IDR', sector: 'Healthcare / Hospitals', idxSector: 'HEALTH', marketCap: 'Rp 10.7 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'SIDO', name: 'PT Industri Jamu dan Farmasi Sido Muncul Tbk', category: 'Saham IDX', logo: generateFallbackBadge('SIDO'), basePrice: 346, currency: 'IDR', sector: 'Healthcare / Herbal Pharma', idxSector: 'HEALTH', marketCap: 'Rp 10.4 T', indices: ['SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'SILO', name: 'PT Siloam International Hospitals Tbk', category: 'Saham IDX', logo: generateFallbackBadge('SILO'), basePrice: 2220, currency: 'IDR', sector: 'Healthcare / Hospitals', idxSector: 'HEALTH', marketCap: 'Rp 28.9 T', indices: ['KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 6. INDUSTRIAL (Perindustrian & Alat Berat)
  { symbol: 'ASII', name: 'PT Astra International Tbk', category: 'Saham IDX', logo: LOGO_ASII, basePrice: 4780, currency: 'IDR', sector: 'Industrials / Conglomerates', idxSector: 'INDUSTRIAL', marketCap: 'Rp 193 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'UNTR', name: 'PT United Tractors Tbk', category: 'Saham IDX', logo: generateFallbackBadge('UNTR'), basePrice: 23275, currency: 'IDR', sector: 'Industrials / Heavy Equipment', idxSector: 'INDUSTRIAL', marketCap: 'Rp 86.8 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'HEXA', name: 'PT Hexindo Adiperkasa Tbk', category: 'Saham IDX', logo: generateFallbackBadge('HEXA'), basePrice: 4410, currency: 'IDR', sector: 'Industrials / Heavy Machinery', idxSector: 'INDUSTRIAL', marketCap: 'Rp 3.7 T', indices: ['KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'ARNA', name: 'PT Arwana Citramulia Tbk', category: 'Saham IDX', logo: generateFallbackBadge('ARNA'), basePrice: 498, currency: 'IDR', sector: 'Industrials / Building Materials', idxSector: 'INDUSTRIAL', marketCap: 'Rp 3.6 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 7. INFRASTRUC (Infrastruktur & Telekomunikasi & Jalan Tol)
  { symbol: 'TLKM', name: 'PT Telkom Indonesia (Persero) Tbk', category: 'Saham IDX', logo: LOGO_TLKM, basePrice: 2620, currency: 'IDR', sector: 'Infrastructure / Telco', idxSector: 'INFRASTRUC', marketCap: 'Rp 259 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'ISAT', name: 'PT Indosat Ooredoo Hutchison Tbk', category: 'Saham IDX', logo: generateFallbackBadge('ISAT'), basePrice: 2540, currency: 'IDR', sector: 'Infrastructure / Telco', idxSector: 'INFRASTRUC', marketCap: 'Rp 81.8 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'EXCL', name: 'PT XL Axiata Tbk', category: 'Saham IDX', logo: generateFallbackBadge('EXCL'), basePrice: 2800, currency: 'IDR', sector: 'Infrastructure / Telco', idxSector: 'INFRASTRUC', marketCap: 'Rp 36.7 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'JSMR', name: 'PT Jasa Marga (Persero) Tbk', category: 'Saham IDX', logo: generateFallbackBadge('JSMR'), basePrice: 2730, currency: 'IDR', sector: 'Infrastructure / Toll Roads', idxSector: 'INFRASTRUC', marketCap: 'Rp 19.8 T', indices: ['LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'TOWR', name: 'PT Sarana Menara Nusantara Tbk', category: 'Saham IDX', logo: generateFallbackBadge('TOWR'), basePrice: 390, currency: 'IDR', sector: 'Infrastructure / Towers', idxSector: 'INFRASTRUC', marketCap: 'Rp 19.9 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 8. NON-CYCLICAL (Konsumen Non-Siklikal & FMCG)
  { symbol: 'ICBP', name: 'PT Indofood CBP Sukses Makmur Tbk', category: 'Saham IDX', logo: LOGO_ICBP, basePrice: 7600, currency: 'IDR', sector: 'Consumer Non-Cyclicals', idxSector: 'NON-CYCLICAL', marketCap: 'Rp 88.6 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'INDF', name: 'PT Indofood Sukses Makmur Tbk', category: 'Saham IDX', logo: generateFallbackBadge('INDF'), basePrice: 7425, currency: 'IDR', sector: 'Consumer Non-Cyclicals', idxSector: 'NON-CYCLICAL', marketCap: 'Rp 65.2 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'UNVR', name: 'PT Unilever Indonesia Tbk', category: 'Saham IDX', logo: LOGO_UNVR, basePrice: 1775, currency: 'IDR', sector: 'Consumer Non-Cyclicals', idxSector: 'NON-CYCLICAL', marketCap: 'Rp 67.7 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'MYOR', name: 'PT Mayora Indah Tbk', category: 'Saham IDX', logo: generateFallbackBadge('MYOR'), basePrice: 1675, currency: 'IDR', sector: 'Consumer Non-Cyclicals', idxSector: 'NON-CYCLICAL', marketCap: 'Rp 37.5 T', indices: ['LQ45', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'CPIN', name: 'PT Charoen Pokphand Indonesia Tbk', category: 'Saham IDX', logo: generateFallbackBadge('CPIN'), basePrice: 3070, currency: 'IDR', sector: 'Consumer Non-Cyclicals / Poultry', idxSector: 'NON-CYCLICAL', marketCap: 'Rp 50.3 T', indices: ['IDX30', 'LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 9. PROPERTY (Properti & Real Estat)
  { symbol: 'BSDE', name: 'PT Bumi Serpong Damai Tbk', category: 'Saham IDX', logo: generateFallbackBadge('BSDE'), basePrice: 595, currency: 'IDR', sector: 'Property & Real Estate', idxSector: 'PROPERTY', marketCap: 'Rp 12.6 T', indices: ['LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'CTRA', name: 'PT Ciputra Development Tbk', category: 'Saham IDX', logo: generateFallbackBadge('CTRA'), basePrice: 610, currency: 'IDR', sector: 'Property & Real Estate', idxSector: 'PROPERTY', marketCap: 'Rp 11.3 T', indices: ['LQ45', 'SRI-KEHATI', 'JII', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'PWON', name: 'PT Pakuwon Jati Tbk', category: 'Saham IDX', logo: generateFallbackBadge('PWON'), basePrice: 254, currency: 'IDR', sector: 'Property & Real Estate', idxSector: 'PROPERTY', marketCap: 'Rp 12.2 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'SMRA', name: 'PT Summarecon Agung Tbk', category: 'Saham IDX', logo: generateFallbackBadge('SMRA'), basePrice: 330, currency: 'IDR', sector: 'Property & Real Estate', idxSector: 'PROPERTY', marketCap: 'Rp 5.4 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 10. TRANSPORT (Transportasi & Logistik)
  { symbol: 'GIAA', name: 'PT Garuda Indonesia (Persero) Tbk', category: 'Saham IDX', logo: generateFallbackBadge('GIAA'), basePrice: 76, currency: 'IDR', sector: 'Transportation / Aviation', idxSector: 'TRANSPORT', marketCap: 'Rp 6.9 T', indices: ['IHSG'], specialBoards: ['FCA', 'Notasi Khusus'] },
  { symbol: 'ASSA', name: 'PT Adi Sarana Armada Tbk', category: 'Saham IDX', logo: generateFallbackBadge('ASSA'), basePrice: 630, currency: 'IDR', sector: 'Transportation / Logistics', idxSector: 'TRANSPORT', marketCap: 'Rp 2.3 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'BIRD', name: 'PT Blue Bird Tbk', category: 'Saham IDX', logo: generateFallbackBadge('BIRD'), basePrice: 1630, currency: 'IDR', sector: 'Transportation / Taxi', idxSector: 'TRANSPORT', marketCap: 'Rp 4.1 T', indices: ['KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'TMAS', name: 'PT Temas Tbk', category: 'Saham IDX', logo: generateFallbackBadge('TMAS'), basePrice: 127, currency: 'IDR', sector: 'Transportation / Shipping', idxSector: 'TRANSPORT', marketCap: 'Rp 7.2 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'SMDR', name: 'PT Samudera Indonesia Tbk', category: 'Saham IDX', logo: generateFallbackBadge('SMDR'), basePrice: 302, currency: 'IDR', sector: 'Transportation / Shipping', idxSector: 'TRANSPORT', marketCap: 'Rp 4.9 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },

  // 11. TECHNOLOGY (Teknologi & Ekosistem Digital)
  { symbol: 'GOTO', name: 'PT GoTo Gojek Tokopedia Tbk', category: 'Saham IDX', logo: LOGO_GOTO, basePrice: 50, currency: 'IDR', sector: 'Technology & Digital Ecosystem', idxSector: 'TECHNOLOGY', marketCap: 'Rp 60.1 T', indices: ['IDX30', 'LQ45', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade', 'Trading Limit'] },
  { symbol: 'BUKA', name: 'PT Bukalapak.com Tbk', category: 'Saham IDX', logo: generateFallbackBadge('BUKA'), basePrice: 115, currency: 'IDR', sector: 'Technology / E-Commerce', idxSector: 'TECHNOLOGY', marketCap: 'Rp 11.8 T', indices: ['LQ45', 'ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'EMTK', name: 'PT Elang Mahkota Teknologi Tbk', category: 'Saham IDX', logo: generateFallbackBadge('EMTK'), basePrice: 505, currency: 'IDR', sector: 'Technology / Media & Digital', idxSector: 'TECHNOLOGY', marketCap: 'Rp 30.9 T', indices: ['ISSI', 'KOMPAS100', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'WIRG', name: 'PT WIR ASIA Tbk', category: 'Saham IDX', logo: generateFallbackBadge('WIRG'), basePrice: 64, currency: 'IDR', sector: 'Technology / Augmented Reality', idxSector: 'TECHNOLOGY', marketCap: 'Rp 0.8 T', indices: ['ISSI', 'IHSG'], specialBoards: ['Day Trade', 'UMA'] },
  { symbol: 'DMMX', name: 'PT Digital Mediatama Maxima Tbk', category: 'Saham IDX', logo: generateFallbackBadge('DMMX'), basePrice: 185, currency: 'IDR', sector: 'Technology / Cloud & Ads', idxSector: 'TECHNOLOGY', marketCap: 'Rp 1.4 T', indices: ['ISSI', 'IHSG'], specialBoards: ['Day Trade'] },
  { symbol: 'LABA', name: 'Green Power Group Tbk', category: 'Saham IDX', logo: LOGO_LABA, basePrice: 93, currency: 'IDR', sector: 'Renewable Tech', idxSector: 'TECHNOLOGY', marketCap: 'Rp 0.7 T', indices: ['IHSG'], specialBoards: ['Suspended', 'UMA'] },

  // ==========================================
  // CRYPTO TOKENS
  // ==========================================
  { symbol: 'BTCUSDT', name: 'Bitcoin', category: 'Crypto', logo: LOGO_BTC, basePrice: 64083.00, currency: 'USD' },
  { symbol: 'ETHUSDT', name: 'Ethereum', category: 'Crypto', logo: LOGO_ETH, basePrice: 1909.60, currency: 'USD' },
  { symbol: 'BNBUSDT', name: 'BNB', category: 'Crypto', logo: LOGO_BNB, basePrice: 606.48, currency: 'USD' },
  { symbol: 'SOLUSDT', name: 'Solana', category: 'Crypto', logo: LOGO_SOL, basePrice: 76.05, currency: 'USD' },
  { symbol: 'XRPUSDT', name: 'XRP', category: 'Crypto', logo: LOGO_XRP, basePrice: 1.005, currency: 'USD' },
  { symbol: 'ADAUSDT', name: 'Cardano', category: 'Crypto', logo: LOGO_ADA, basePrice: 0.1749, currency: 'USD' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', category: 'Crypto', logo: LOGO_DOGE, basePrice: 0.0705, currency: 'USD' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', category: 'Crypto', logo: LOGO_AVAX, basePrice: 6.32, currency: 'USD' },
  { symbol: 'MATICUSDT', name: 'Polygon (POL)', category: 'Crypto', logo: LOGO_MATIC, basePrice: 0.379, currency: 'USD' },
  { symbol: 'LINKUSDT', name: 'Chainlink', category: 'Crypto', logo: LOGO_LINK, basePrice: 9.52, currency: 'USD' },
  { symbol: 'DOTUSDT', name: 'Polkadot', category: 'Crypto', logo: LOGO_DOT, basePrice: 0.757, currency: 'USD' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol', category: 'Crypto', logo: LOGO_NEAR, basePrice: 1.639, currency: 'USD' },
  { symbol: 'SUIUSDT', name: 'Sui Network', category: 'Crypto', logo: LOGO_SUI, basePrice: 0.678, currency: 'USD' },
  { symbol: 'PEPEUSDT', name: 'Pepe Coin', category: 'Crypto', logo: LOGO_PEPE, basePrice: 0.00000259, currency: 'USD' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', category: 'Crypto', logo: LOGO_SHIB, basePrice: 0.00000447, currency: 'USD' },
  { symbol: 'TONUSDT', name: 'Toncoin', category: 'Crypto', logo: LOGO_TON, basePrice: 1.60, currency: 'USD' },
  { symbol: 'LTCUSDT', name: 'Litecoin', category: 'Crypto', logo: LOGO_LTC, basePrice: 44.39, currency: 'USD' },
  { symbol: 'UNIUSDT', name: 'Uniswap', category: 'Crypto', logo: LOGO_UNI, basePrice: 3.29, currency: 'USD' },

  // ==========================================
  // SAHAM GLOBAL (US TECH & BLUE CHIP)
  // ==========================================
  { symbol: 'NVDA', name: 'NVIDIA Corporation', category: 'Saham Global', logo: LOGO_NVDA, basePrice: 227.40, currency: 'USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', category: 'Saham Global', logo: LOGO_AAPL, basePrice: 303.34, currency: 'USD' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', category: 'Saham Global', logo: LOGO_TSLA, basePrice: 340.46, currency: 'USD' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', category: 'Saham Global', logo: LOGO_MSFT, basePrice: 484.87, currency: 'USD' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', category: 'Saham Global', logo: LOGO_AMZN, basePrice: 261.17, currency: 'USD' },
  { symbol: 'GOOGL', name: 'Alphabet Inc. (Google)', category: 'Saham Global', logo: LOGO_GOOGL, basePrice: 343.95, currency: 'USD' },
  { symbol: 'META', name: 'Meta Platforms Inc.', category: 'Saham Global', logo: LOGO_META, basePrice: 574.16, currency: 'USD' },
  { symbol: 'NFLX', name: 'Netflix Inc.', category: 'Saham Global', logo: LOGO_NFLX, basePrice: 76.55, currency: 'USD' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', category: 'Saham Global', logo: LOGO_AMD, basePrice: 513.38, currency: 'USD' },
  { symbol: 'INTC', name: 'Intel Corporation', category: 'Saham Global', logo: LOGO_INTC, basePrice: 104.76, currency: 'USD' },
  { symbol: 'COIN', name: 'Coinbase Global, Inc.', category: 'Saham Global', logo: LOGO_COIN, basePrice: 150.85, currency: 'USD' },

  // ==========================================
  // KOMODITAS & FOREX
  // ==========================================
  { symbol: 'GOLD', name: 'Gold / Emas Global (XAU/USD)', category: 'Komoditas & Forex', logo: LOGO_GOLD, basePrice: 4479.90, currency: 'USD' },
  { symbol: 'SILVER', name: 'Silver / Perak Global (XAG/USD)', category: 'Komoditas & Forex', logo: LOGO_SILVER, basePrice: 66.56, currency: 'USD' },
  { symbol: 'SPX', name: 'S&P 500 Index', category: 'Komoditas & Forex', logo: LOGO_SPX, basePrice: 7772.27, currency: 'USD' },
  { symbol: 'NDX', name: 'NASDAQ 100 Index', category: 'Komoditas & Forex', logo: LOGO_NDX, basePrice: 30138.92, currency: 'USD' },
  { symbol: 'EURUSD', name: 'EUR / USD Forex', category: 'Komoditas & Forex', logo: LOGO_EURUSD, basePrice: 1.1585, currency: 'USD' },
];

const LOGO_MAP: Record<string, string> = {
  // IDX
  'BBCA': LOGO_BBCA,
  'BBRI': LOGO_BBRI,
  'BMRI': LOGO_BMRI,
  'BBNI': LOGO_BBNI,
  'TLKM': LOGO_TLKM,
  'ASII': LOGO_ASII,
  'BREN': LOGO_BREN,
  'AMMN': LOGO_AMMN,
  'GOTO': LOGO_GOTO,
  'ICBP': LOGO_ICBP,
  'ANTM': LOGO_ANTM,
  'ADRO': LOGO_ADRO,
  'PTBA': LOGO_PTBA,
  'UNVR': LOGO_UNVR,
  'KLBF': LOGO_KLBF,
  'TPIA': LOGO_TPIA,
  'SMGR': LOGO_SMGR,
  'LABA': LOGO_LABA,

  // CRYPTO
  'BTC': LOGO_BTC, 'BTCUSDT': LOGO_BTC,
  'ETH': LOGO_ETH, 'ETHUSDT': LOGO_ETH,
  'BNB': LOGO_BNB, 'BNBUSDT': LOGO_BNB,
  'SOL': LOGO_SOL, 'SOLUSDT': LOGO_SOL,
  'XRP': LOGO_XRP, 'XRPUSDT': LOGO_XRP,
  'ADA': LOGO_ADA, 'ADAUSDT': LOGO_ADA,
  'DOGE': LOGO_DOGE, 'DOGEUSDT': LOGO_DOGE,
  'AVAX': LOGO_AVAX, 'AVAXUSDT': LOGO_AVAX,
  'MATIC': LOGO_MATIC, 'MATICUSDT': LOGO_MATIC,
  'LINK': LOGO_LINK, 'LINKUSDT': LOGO_LINK,
  'DOT': LOGO_DOT, 'DOTUSDT': LOGO_DOT,
  'NEAR': LOGO_NEAR, 'NEARUSDT': LOGO_NEAR,
  'SUI': LOGO_SUI, 'SUIUSDT': LOGO_SUI,
  'PEPE': LOGO_PEPE, 'PEPEUSDT': LOGO_PEPE,
  'SHIB': LOGO_SHIB, 'SHIBUSDT': LOGO_SHIB,
  'TON': LOGO_TON, 'TONUSDT': LOGO_TON,
  'LTC': LOGO_LTC, 'LTCUSDT': LOGO_LTC,
  'UNI': LOGO_UNI, 'UNIUSDT': LOGO_UNI,

  // US STOCKS
  'NVDA': LOGO_NVDA,
  'AAPL': LOGO_AAPL,
  'TSLA': LOGO_TSLA,
  'MSFT': LOGO_MSFT,
  'AMZN': LOGO_AMZN,
  'GOOGL': LOGO_GOOGL, 'GOOG': LOGO_GOOGL,
  'META': LOGO_META,
  'NFLX': LOGO_NFLX,
  'AMD': LOGO_AMD,
  'INTC': LOGO_INTC,
  'COIN': LOGO_COIN,

  // COMMODITIES & FOREX
  'GOLD': LOGO_GOLD, 'XAU': LOGO_GOLD, 'XAUUSD': LOGO_GOLD,
  'SILVER': LOGO_SILVER, 'XAG': LOGO_SILVER, 'XAGUSD': LOGO_SILVER,
  'SPX': LOGO_SPX,
  'NDX': LOGO_NDX,
  'EURUSD': LOGO_EURUSD,
};

const BRAND_COLORS: Record<string, string> = {
  'BBCA': '#003D79',
  'BBRI': '#00529C',
  'BMRI': '#002D62',
  'BBNI': '#00667F',
  'TLKM': '#E1251B',
  'ASII': '#003B70',
  'BREN': '#00875A',
  'AMMN': '#1C2B39',
  'GOTO': '#00AA13',
  'ICBP': '#004380',
  'ANTM': '#004D40',
  'ADRO': '#0E4B33',
  'PTBA': '#1B365D',
  'UNVR': '#1F36C7',
  'KLBF': '#009639',
  'LABA': '#059669',

  'BTC': '#F7931A',
  'ETH': '#627EEA',
  'BNB': '#F3BA2F',
  'SOL': '#9945FF',
  'XRP': '#23292F',
  'DOGE': '#C2A633',
  'AVAX': '#E84142',
  'MATIC': '#8247E5',
  'LINK': '#375BD2',
  'SUI': '#4DA2FF',
  'TON': '#0098EA',

  'NVDA': '#76B900',
  'AAPL': '#000000',
  'TSLA': '#E82127',
  'MSFT': '#00A4EF',
  'AMZN': '#FF9900',
  'GOOGL': '#4285F4',
  'META': '#0668E1',
  'NFLX': '#E50914',
  'GOLD': '#D4AF37',
  'SILVER': '#90A4AE',
  'SPX': '#002D62',
};

// Generates a clean, professional corporate badge SVG for any asset or warrant
function generateFallbackBadge(symbol: string): string {
  const clean = (symbol || 'ASSET').toUpperCase().replace('USDT', '').trim();
  const initials = clean.length <= 4 ? clean : clean.slice(0, 4);

  // Pick deterministic palette based on symbol char codes
  const palettes = [
    { bg1: '#1E293B', bg2: '#0F172A', text: '#FFFFFF' }, // Slate
    { bg1: '#0284C7', bg2: '#0369A1', text: '#FFFFFF' }, // Sky
    { bg1: '#059669', bg2: '#047857', text: '#FFFFFF' }, // Emerald
    { bg1: '#7C3AED', bg2: '#6D28D9', text: '#FFFFFF' }, // Violet
    { bg1: '#DB2777', bg2: '#BE185D', text: '#FFFFFF' }, // Pink
    { bg1: '#D97706', bg2: '#B45309', text: '#FFFFFF' }, // Amber
    { bg1: '#4F46E5', bg2: '#4338CA', text: '#FFFFFF' }, // Indigo
    { bg1: '#DC2626', bg2: '#B91C1C', text: '#FFFFFF' }, // Red
  ];

  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash + clean.charCodeAt(i) * (i + 1)) % palettes.length;
  }
  const pal = palettes[hash];

  return svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="badge_${clean}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${pal.bg1}"/>
      <stop offset="100%" stop-color="${pal.bg2}"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="48" fill="url(#badge_${clean})"/>
  <text x="50" y="${initials.length > 3 ? 56 : 58}" fill="${pal.text}" font-family="'Helvetica Neue', Arial, sans-serif" font-size="${initials.length > 3 ? 18 : 22}" font-weight="900" text-anchor="middle" letter-spacing="${initials.length > 3 ? '0' : '1'}">${initials}</text>
</svg>
`);
}

export function getAssetLogo(symbol: string): string {
  if (!symbol) return 'https://assets.stockbit.com/logos/companies/BBCA.png';
  const clean = symbol.toUpperCase().trim();
  const withoutUSDT = clean.replace('USDT', '');
  
  // Use SVG for US Stocks, Commodities, and Forex which might not be on Stockbit
  const usStocksAndCommodities = [
    'NVDA', 'AAPL', 'TSLA', 'MSFT', 'AMZN', 'GOOGL', 'GOOG', 'META', 
    'NFLX', 'AMD', 'INTC', 'COIN', 'GOLD', 'XAU', 'XAUUSD', 'SILVER', 
    'XAG', 'XAGUSD', 'SPX', 'NDX', 'EURUSD'
  ];
  if (usStocksAndCommodities.includes(clean) && LOGO_MAP[clean]) {
      return LOGO_MAP[clean];
  }

  // Use official Stockbit CDN for IDX stocks and Crypto
  return `https://assets.stockbit.com/logos/companies/${withoutUSDT}.png`;
}

export function getAssetBrandColor(symbol: string): string {
  if (!symbol) return '#00B26A';
  const clean = symbol.toUpperCase().replace('USDT', '').trim();
  if (clean === 'DEWA') return '#00AA5B';
  return BRAND_COLORS[clean] || '#00B26A';
}

export function getAssetName(symbol: string): string {
  if (!symbol) return 'Asset';
  const clean = symbol.toUpperCase().trim();
  const withoutUSDT = clean.replace('USDT', '');

  if (clean === 'DEWA') return 'PT Darma Henwa Tbk';

  const found = ALL_GLOBAL_ASSETS.find(
    a => a.symbol.toUpperCase() === clean || 
         a.symbol.toUpperCase().replace('USDT', '') === withoutUSDT
  );
  if (found) return found.name;
  if (clean === 'BBCA') return 'PT Bank Central Asia Tbk';
  if (clean === 'BBRI') return 'PT Bank Rakyat Indonesia (Persero) Tbk';
  if (clean === 'BMRI') return 'PT Bank Mandiri (Persero) Tbk';
  if (clean === 'BBNI') return 'PT Bank Negara Indonesia (Persero) Tbk';
  if (clean === 'TLKM') return 'PT Telkom Indonesia (Persero) Tbk';
  if (clean === 'ASII') return 'PT Astra International Tbk';
  if (clean === 'BREN') return 'PT Barito Renewables Energy Tbk';
  if (clean === 'AMMN') return 'PT Amman Mineral Internasional Tbk';
  if (clean === 'GOTO') return 'PT GoTo Gojek Tokopedia Tbk';
  if (clean === 'ANTM') return 'PT Aneka Tambang Tbk';
  if (clean === 'TAPGHDCH6A') return 'Call Waran TAPG HD';
  return `PT ${withoutUSDT} Emiten Tbk`;
}

export function isIDXStock(symbol: string): boolean {
  const clean = symbol.toUpperCase().replace('USDT', '').trim();
  if (clean === 'DEWA') return true;
  const found = ALL_GLOBAL_ASSETS.find(a => a.symbol.toUpperCase() === clean);
  if (found && found.category === 'Saham IDX') return true;
  const idxList = [
    'BBCA', 'BBRI', 'BMRI', 'BBNI', 'TLKM', 'ASII', 'GOTO', 
    'BREN', 'AMMN', 'ANTM', 'ICBP', 'ADRO', 'PTBA', 'UNVR', 
    'KLBF', 'CPIN', 'SMGR', 'PGAS', 'INCO', 'LABA'
  ];
  return idxList.includes(clean);
}

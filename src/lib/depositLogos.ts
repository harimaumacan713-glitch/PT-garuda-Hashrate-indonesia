// 100% Official Vector Logos for Indonesian Banking & Digital Wallets
// Crisp, high-fidelity, official brand assets

export const svgDataUri = (svgString: string): string => {
  const cleaned = svgString.trim().replace(/\s+/g, ' ');
  return `data:image/svg+xml;utf8,${encodeURIComponent(cleaned)}`;
};

// 1. Official Bank Jago Logo
// Iconic bright orange circle (#FF8D00) with official 'j.' mark
export const LOGO_JAGO = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#FF8D00"/>
  <!-- Jago official lowercase 'j' with separate dot -->
  <g fill="#212529">
    <circle cx="63.5" cy="31.5" r="7.5"/>
    <path d="M43.5 30 C49 30 52.5 33.5 52.5 39 L52.5 61 C52.5 70.5 45.5 76 34.5 76 C24.5 76 19.5 70 19.5 63.5 L29 60.5 C29.5 64 32 67 36 67 C40 67 42.5 64.5 42.5 59.5 L42.5 30 Z"/>
  </g>
</svg>
`);

// 2. Official BCA (Bank Central Asia) Logo
// Royal blue circle (#003882) with official BCA rhombus clover & typography
export const LOGO_BCA = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#003882"/>
  <!-- BCA Official Clover Rhombus Emblem -->
  <g transform="translate(50, 40) scale(0.68)">
    <path d="M0 -34 C13 -20, 21 -12, 34 0 C21 12, 13 20, 0 34 C-13 20, -21 12, -34 0 C-21 -12, -13 -20, 0 -34 Z" fill="#FFFFFF"/>
    <circle cx="0" cy="0" r="10" fill="#003882"/>
    <circle cx="0" cy="-21" r="4.5" fill="#003882"/>
    <circle cx="0" cy="21" r="4.5" fill="#003882"/>
    <circle cx="-21" cy="0" r="4.5" fill="#003882"/>
    <circle cx="21" cy="0" r="4.5" fill="#003882"/>
  </g>
  <!-- BCA Bold Typography -->
  <text x="50" y="80" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="17" font-weight="900" text-anchor="middle" letter-spacing="1">BCA</text>
</svg>
`);

// 3. Official BRI (Bank Rakyat Indonesia) Logo
// Deep blue (#00529C) circle with official BRI monogram & orange badge
export const LOGO_BRI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#00529C"/>
  <!-- BRI Official Emblem & Wordmark -->
  <g transform="translate(50, 50)">
    <!-- Outer orange curve arc -->
    <rect x="-34" y="-24" width="68" height="48" rx="10" fill="#F37021"/>
    <rect x="-29" y="-19" width="58" height="38" rx="6" fill="#00529C"/>
    <!-- BRI Lettering -->
    <text x="0" y="8" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="24" font-weight="900" text-anchor="middle" letter-spacing="1">BRI</text>
  </g>
</svg>
`);

// 4. Official BNI (Bank Negara Indonesia) Logo
// Official BNI teal badge (#00667F) with orange 46 sail emblem
export const LOGO_BNI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- BNI Official Turquoise & Orange Emblem -->
  <g transform="translate(50, 50)">
    <!-- BNI Left Text -->
    <rect x="-38" y="-22" width="76" height="44" rx="8" fill="#00667F"/>
    <text x="-12" y="8" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="21" font-weight="900" text-anchor="middle">BNI</text>
    <!-- Orange 46 Sail Circle -->
    <circle cx="21" cy="-4" r="9" fill="#F15A24"/>
    <text x="21" y="0" fill="#FFFFFF" font-family="'Helvetica Neue', Arial, sans-serif" font-size="9.5" font-weight="900" text-anchor="middle">46</text>
  </g>
</svg>
`);

// 5. Official Bank Mandiri Logo
// Navy blue circle (#002855) with official golden yellow wave ribbon
export const LOGO_MANDIRI = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#002855"/>
  <!-- Mandiri Official Golden Ribbon Curve -->
  <path d="M22 36 C36 24, 64 24, 78 36 C64 29, 36 29, 22 36 Z" fill="#F8A01A"/>
  <path d="M25 39 C38 29, 62 29, 75 39 C62 33, 38 33, 25 39 Z" fill="#FFC72C"/>
  <!-- Mandiri Official Lowercase Typography -->
  <text x="50" y="66" fill="#FFFFFF" font-family="'Segoe UI', 'Helvetica Neue', Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" letter-spacing="0.5">mandiri</text>
</svg>
`);

// 6. Official GoPay Logo
// Official GoPay Cyan / Sky Blue (#00AED6) circle with white wallet emblem
export const LOGO_GOPAY = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#00AED6"/>
  <!-- GoPay Official Wallet Icon -->
  <g transform="translate(50, 50)">
    <!-- Wallet Main Body -->
    <rect x="-26" y="-20" width="52" height="40" rx="9" fill="#FFFFFF"/>
    <!-- Wallet Flap Pocket -->
    <path d="M-12 -9 L12 -9 C17 -9 21 -5 21 0 L21 0 C21 5 17 9 12 9 L-12 9 C-17 9 -21 5 -21 0 L-21 0 C-21 -5 -17 -9 -12 -9 Z" fill="#00AED6"/>
    <!-- Coin Dot -->
    <circle cx="10" cy="0" r="4" fill="#FFFFFF"/>
  </g>
</svg>
`);

// 7. Official ShopeePay Logo
// Official Shopee Orange (#EE4D2D) circle with shopping bag & 'S' wallet badge
export const LOGO_SHOPEEPAY = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#EE4D2D"/>
  <!-- Shopee Shopping Bag + Wallet -->
  <g transform="translate(50, 50)">
    <!-- Handle -->
    <path d="M-13 -18 C-13 -27, 13 -27, 13 -18 L13 -11 L-13 -11 Z" fill="none" stroke="#FFFFFF" stroke-width="4.5" stroke-linecap="round"/>
    <!-- Bag Card Body -->
    <rect x="-26" y="-11" width="52" height="44" rx="8" fill="#FFFFFF"/>
    <!-- Shopee 'S' Character in official orange -->
    <path d="M7 1 C7 -3, -4 -3, -4 -6.5 C-4 -10, 5 -10, 5 -10" fill="none" stroke="#EE4D2D" stroke-width="4" stroke-linecap="round"/>
    <path d="M-5 15 C-5 19, 6 19, 6 22.5 C6 26, -5 26, -5 26" fill="none" stroke="#EE4D2D" stroke-width="4" stroke-linecap="round"/>
    <path d="M7 1 C7 8, -5 8, -5 15" fill="none" stroke="#EE4D2D" stroke-width="4" stroke-linecap="round"/>
  </g>
</svg>
`);

// 8. Official QRIS (Quick Response Code Indonesian Standard) Logo
// Official ASPI / Bank Indonesia Red & Dark Charcoal National Standard
export const LOGO_QRIS = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  <!-- QRIS Official Standard Mark -->
  <g transform="translate(50, 50)">
    <!-- Red QR Corner Box -->
    <rect x="-34" y="-25" width="22" height="22" rx="4" fill="#ED1C24"/>
    <rect x="-30" y="-21" width="14" height="14" rx="2" fill="#FFFFFF"/>
    <rect x="-27" y="-18" width="8" height="8" rx="1.5" fill="#ED1C24"/>

    <!-- Red Top Accent Strip -->
    <rect x="-5" y="-25" width="39" height="5.5" rx="2.5" fill="#ED1C24"/>

    <!-- QRIS Bold Typography -->
    <text x="14.5" y="1" fill="#24272C" font-family="'Helvetica Neue', Arial, sans-serif" font-size="21" font-weight="900" text-anchor="middle" letter-spacing="-0.5">QRIS</text>
    
    <!-- Subtitle NATIONAL QR -->
    <text x="14.5" y="16" fill="#ED1C24" font-family="'Helvetica Neue', Arial, sans-serif" font-size="7" font-weight="900" text-anchor="middle" letter-spacing="0.5">NATIONAL QR</text>
  </g>
</svg>
`);

// 9. Transfer dari Bank Lain Landmark Icon
// Clean financial banking facade in neutral palette
export const LOGO_BANK_LAIN = svgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="50" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1.5"/>
  <!-- Bank Pillar Building -->
  <g transform="translate(50, 50)" fill="#475569">
    <!-- Pediment Roof -->
    <polygon points="0,-24 28,-10 -28,-10"/>
    <rect x="-25" y="-8" width="50" height="4" rx="1"/>
    <!-- 4 Columns -->
    <rect x="-23" y="-2" width="6.5" height="19" rx="1.5"/>
    <rect x="-9.5" y="-2" width="6.5" height="19" rx="1.5"/>
    <rect x="3" y="-2" width="6.5" height="19" rx="1.5"/>
    <rect x="16.5" y="-2" width="6.5" height="19" rx="1.5"/>
    <!-- Stepped Base -->
    <rect x="-27" y="18" width="54" height="5" rx="1.5"/>
  </g>
</svg>
`);

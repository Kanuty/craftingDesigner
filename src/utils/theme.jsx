import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

/**
 * Calculates relative luminance of a hex color and returns either dark or light text color
 * to guarantee high contrast ratio (WCAG compliance).
 */
export function getContrastTextColor(hexColor, darkColor = '#0f172a', lightColor = '#ffffff') {
  if (!hexColor || typeof hexColor !== 'string') return lightColor;

  // Normalize hex
  let hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map(c => c + c).join('');
  }
  if (hex.length !== 6) return lightColor;

  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  // Linearize RGB
  const a = [r, g, b].map(v => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const luminance = a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;

  return luminance > 0.45 ? darkColor : lightColor;
}

export const THEMES = {
  blueprint: {
    id: 'blueprint',
    name: 'Light Blueprint',
    isDark: false,
    bg: 'bg-[#eef5fc] text-[#0f2d4a]',
    panelBg: 'bg-[#e1ecf7]',
    cardBg: 'bg-white border-[#8bb2e8]',
    cardHeaderBg: 'bg-[#184878] text-white',
    headerBg: 'bg-[#184878] border-[#12365a] text-white shadow-md',
    accentText: 'text-[#0284c7]',
    hudTag: 'text-[#0369a1] font-mono text-xs tracking-wider uppercase font-bold',
    hudTitle: 'text-[#0f2d4a] font-mono font-bold tracking-tight uppercase',
    buttonPrimary: 'bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold border border-[#0284c7] transition-colors cursor-pointer shadow-sm',
    buttonSecondary: 'bg-[#d0e3f7] hover:bg-[#bd3d2] text-[#0369a1] border border-[#8bb2e8] font-semibold transition-colors cursor-pointer',
    buttonActive: 'bg-[#0284c7] text-white font-bold shadow border border-[#0369a1]',
    buttonInactive: 'text-[#e0f2fe] hover:text-white hover:bg-[#0284c7]/50 font-medium',
    inputBg: 'bg-white text-[#0f2d4a] border-[#8bb2e8] focus:border-[#0284c7] focus:ring-1 focus:ring-[#0284c7]',
    tableHeader: 'bg-[#184878] text-white font-mono uppercase text-xs tracking-wider border-b border-[#12365a]',
    tableRowEven: 'bg-[#f4f8fd]',
    tableRowOdd: 'bg-white',
    tableRowHover: 'hover:bg-[#dbeafe]',
    tableRowSelected: 'bg-[#bae6fd] text-[#0369a1] font-bold border-l-4 border-[#0284c7]',
    textMuted: 'text-[#475569]',
    textBright: 'text-[#0f172a]',
    badgePrimary: 'bg-[#0284c7] text-white font-bold',
    badgeSecondary: 'bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd]',
    border: 'border-[#93c5fd]',
    borderMuted: 'border-[#cbd5e1]',

    // Vibrant Entity Colors (Light mode contrast guaranteed)
    entity: {
      rawMaterial: { bg: '#dcfce7', text: '#15803d', border: '#86efac', tag: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
      intermediate: { bg: '#fef3c7', text: '#b45309', border: '#fde047', tag: 'bg-amber-100 text-amber-800 border-amber-300' },
      craftable: { bg: '#e0f2fe', text: '#0369a1', border: '#7dd3fc', tag: 'bg-sky-100 text-sky-800 border-sky-300' },
      equipment: { bg: '#fae8ff', text: '#a21caf', border: '#f0abfc', tag: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-300' },
      consumable: { bg: '#ffe4e6', text: '#be123c', border: '#fda4af', tag: 'bg-rose-100 text-rose-800 border-rose-300' },
      workstation: { bg: '#f3e8ff', text: '#6b21a8', border: '#d8b4fe', tag: 'bg-purple-100 text-purple-800 border-purple-300' },
      skill: { bg: '#ccfbf1', text: '#0f766e', border: '#5eead4', tag: 'bg-teal-100 text-teal-800 border-teal-300' }
    },

    nodeBg: '#ffffff',
    nodeBorder: '#0284c7',
    nodeText: '#0f2d4a',
  },
  cyber: {
    id: 'cyber',
    name: 'Dark Cyber-Ops',
    isDark: true,
    bg: 'bg-[#050b14] text-[#d1f5ff]',
    panelBg: 'bg-[#0a1526]',
    cardBg: 'bg-[#0d1f35] border-[#00f0ff]/30 shadow-[0_0_15px_rgba(0,240,255,0.08)]',
    cardHeaderBg: 'bg-[#031d28] text-[#00f0ff] border-b border-[#00f0ff]/40',
    headerBg: 'bg-[#020912] border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_4px_20px_rgba(0,240,255,0.15)]',
    accentText: 'text-[#00f0ff]',
    hudTag: 'text-[#00f0ff] font-mono text-xs tracking-wider uppercase font-bold shadow-sm',
    hudTitle: 'text-[#00f0ff] font-mono font-bold tracking-tight uppercase drop-shadow-[0_0_8px_rgba(0,240,255,0.6)]',
    buttonPrimary: 'bg-[#00f0ff] hover:bg-[#33f3ff] text-[#03090f] font-extrabold border border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-colors cursor-pointer',
    buttonSecondary: 'bg-[#0d283d] hover:bg-[#143754] text-[#80ebff] border border-[#00f0ff]/40 font-semibold transition-colors cursor-pointer',
    buttonActive: 'bg-[#00f0ff] text-[#03090f] font-bold shadow-[0_0_12px_rgba(0,240,255,0.5)] border border-[#00f0ff]',
    buttonInactive: 'text-[#64a9c0] hover:text-[#00f0ff] hover:bg-[#0a2538] font-medium',
    inputBg: 'bg-[#051424] text-[#d1f5ff] border-[#00f0ff]/40 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]',
    tableHeader: 'bg-[#031d28] text-[#00f0ff] font-mono uppercase text-xs tracking-wider border-b border-[#00f0ff]/40',
    tableRowEven: 'bg-[#09182a]',
    tableRowOdd: 'bg-[#0d1f35]',
    tableRowHover: 'hover:bg-[#00384c]',
    tableRowSelected: 'bg-[#004a66] text-[#00f0ff] font-bold border-l-4 border-[#00f0ff]',
    textMuted: 'text-[#64a9c0]',
    textBright: 'text-[#f0fdff]',
    badgePrimary: 'bg-[#004254] text-[#00f0ff] border border-[#00f0ff]/60 font-bold',
    badgeSecondary: 'bg-[#0d283d] text-[#80ebff] border border-[#00f0ff]/30',
    border: 'border-[#00f0ff]/30',
    borderMuted: 'border-[#00f0ff]/20',

    // Vibrant Entity Colors (High saturation for dark sci-fi HUD)
    entity: {
      rawMaterial: { bg: '#022c22', text: '#34d399', border: '#059669', tag: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50' },
      intermediate: { bg: '#451a03', text: '#fbbf24', border: '#d97706', tag: 'bg-amber-950/80 text-amber-300 border-amber-500/50' },
      craftable: { bg: '#082f49', text: '#38bdf8', border: '#0284c7', tag: 'bg-sky-950/80 text-sky-300 border-sky-500/50' },
      equipment: { bg: '#3b0764', text: '#e879f9', border: '#c026d3', tag: 'bg-fuchsia-950/80 text-fuchsia-300 border-fuchsia-500/50' },
      consumable: { bg: '#4c0519', text: '#fb7185', border: '#e11d48', tag: 'bg-rose-950/80 text-rose-300 border-rose-500/50' },
      workstation: { bg: '#2e1065', text: '#c084fc', border: '#9333ea', tag: 'bg-purple-950/80 text-purple-300 border-purple-500/50' },
      skill: { bg: '#042f2e', text: '#2dd4bf', border: '#0d9488', tag: 'bg-teal-950/80 text-teal-300 border-teal-500/50' }
    },

    nodeBg: '#0d1f35',
    nodeBorder: '#00f0ff',
    nodeText: '#d1f5ff',
  },
  military: {
    id: 'military',
    name: 'Old School Military',
    isDark: false,
    bg: 'bg-[#ebe3cf] text-[#1c2919]',
    panelBg: 'bg-[#dfd5bc]',
    cardBg: 'bg-[#f8f5eb] border-[#8a8063]',
    cardHeaderBg: 'bg-[#283822] text-[#f0f7e6]',
    headerBg: 'bg-[#283822] border-[#1d2918] text-[#f0f7e6] shadow-md',
    accentText: 'text-[#d97706]', // High contrast tactical orange accent
    hudTag: 'text-[#38502e] font-mono text-xs tracking-wider uppercase font-bold',
    hudTitle: 'text-[#1c2919] font-mono font-bold tracking-tight uppercase',
    buttonPrimary: 'bg-[#283822] hover:bg-[#1b2717] text-[#f0f7e6] font-bold border border-[#1d2918] transition-colors cursor-pointer shadow-sm',
    buttonSecondary: 'bg-[#d6cbaa] hover:bg-[#c9bb97] text-[#283822] border border-[#8a8063] font-bold transition-colors cursor-pointer',
    buttonActive: 'bg-[#d97706] text-white font-bold shadow border border-[#b45309]', // Tactical Orange active state
    buttonInactive: 'text-[#c2d4b2] hover:text-white hover:bg-[#3d5434] font-medium',
    inputBg: 'bg-[#fbf9f3] text-[#1c2919] border-[#8a8063] focus:border-[#283822] focus:ring-1 focus:ring-[#283822]',
    tableHeader: 'bg-[#283822] text-[#f0f7e6] font-mono uppercase text-xs tracking-wider border-b border-[#1d2918]',
    tableRowEven: 'bg-[#e4dc8]',
    tableRowOdd: 'bg-[#f1ebe0]',
    tableRowHover: 'hover:bg-[#d6cbaa]',
    tableRowSelected: 'bg-[#d97706]/20 text-[#1c2919] font-bold border-l-4 border-[#d97706]',
    textMuted: 'text-[#615a45]',
    textBright: 'text-[#141e12]',
    badgePrimary: 'bg-[#283822] text-[#f0f7e6] font-bold',
    badgeSecondary: 'bg-[#d6cbaa] text-[#283822] border border-[#8a8063]',
    border: 'border-[#8a8063]',
    borderMuted: 'border-[#aba082]',

    // Vibrant Entity Colors (Tactical color coding)
    entity: {
      rawMaterial: { bg: '#dcfce7', text: '#166534', border: '#4ade80', tag: 'bg-emerald-100 text-emerald-900 border-emerald-400 font-bold' },
      intermediate: { bg: '#fef3c7', text: '#92400e', border: '#facc15', tag: 'bg-amber-100 text-amber-900 border-amber-400 font-bold' },
      craftable: { bg: '#e0f2fe', text: '#075985', border: '#38bdf8', tag: 'bg-sky-100 text-sky-900 border-sky-400 font-bold' },
      equipment: { bg: '#fae8ff', text: '#86198f', border: '#e879f9', tag: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-400 font-bold' },
      consumable: { bg: '#ffe4e6', text: '#9f1239', border: '#fb7185', tag: 'bg-rose-100 text-rose-900 border-rose-400 font-bold' },
      workstation: { bg: '#f3e8ff', text: '#5b21b6', border: '#c084fc', tag: 'bg-purple-100 text-purple-900 border-purple-400 font-bold' },
      skill: { bg: '#ccfbf1', text: '#115e59', border: '#2dd4bf', tag: 'bg-teal-100 text-teal-900 border-teal-400 font-bold' }
    },

    nodeBg: '#f8f5eb',
    nodeBorder: '#283822',
    nodeText: '#1c2919',
  }
};

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(() => {
    return localStorage.getItem('crafting_app_theme') || 'blueprint';
  });

  useEffect(() => {
    localStorage.setItem('crafting_app_theme', themeId);
  }, [themeId]);

  const currentTheme = THEMES[themeId] || THEMES.blueprint;

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, theme: currentTheme, THEMES, getContrastTextColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return {
      themeId: 'blueprint',
      setThemeId: () => {},
      theme: THEMES.blueprint,
      THEMES,
      getContrastTextColor
    };
  }
  return context;
}

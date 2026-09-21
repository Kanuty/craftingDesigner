import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  blueprint: {
    id: 'blueprint',
    name: 'Light Blueprint',
    bg: 'bg-[#dce9f9] text-[#0f2d4a]',
    panelBg: 'bg-[#ebf3fb]',
    cardBg: 'bg-white border-[#8bb2e8]',
    cardHeaderBg: 'bg-[#184878] text-white',
    headerBg: 'bg-[#184878] border-[#12365a] text-white shadow-md',
    accentText: 'text-[#184878]',
    hudTag: 'text-[#184878] font-mono text-xs tracking-wider uppercase font-bold',
    hudTitle: 'text-[#0f2d4a] font-mono font-bold tracking-tight uppercase',
    buttonPrimary: 'bg-[#184878] hover:bg-[#12365a] text-white border border-[#12365a] font-semibold transition-colors cursor-pointer',
    buttonSecondary: 'bg-[#d3e3f7] hover:bg-[#c2d8f3] text-[#12365a] border border-[#8bb2e8] font-medium transition-colors cursor-pointer',
    buttonActive: 'bg-[#184878] text-white shadow border border-[#12365a] font-bold',
    buttonInactive: 'text-[#91c5ff] hover:text-white hover:bg-[#1e5893]/70',
    inputBg: 'bg-white text-[#0f2d4a] border-[#8bb2e8] focus:border-[#184878] focus:ring-1 focus:ring-[#184878]',
    tableHeader: 'bg-[#184878] text-white font-mono uppercase text-xs tracking-wider border-b border-[#12365a]',
    tableRowEven: 'bg-[#f0f6fd]',
    tableRowOdd: 'bg-white',
    tableRowHover: 'hover:bg-[#d8e7f9]',
    tableRowSelected: 'bg-[#c2d8f3] text-[#0a2239] font-medium',
    textMuted: 'text-[#4a6b8c]',
    textBright: 'text-[#0a2239]',
    badgePrimary: 'bg-[#184878] text-white',
    badgeSecondary: 'bg-[#d3e3f7] text-[#184878] border border-[#8bb2e8]',
    border: 'border-[#8bb2e8]',
    borderMuted: 'border-[#a6c7f0]',
    nodeBg: '#ffffff',
    nodeBorder: '#184878',
    nodeText: '#0f2d4a',
  },
  cyber: {
    id: 'cyber',
    name: 'Dark Cyber-Ops',
    bg: 'bg-[#060c12] text-[#c5f6ff]',
    panelBg: 'bg-[#0b1622]',
    cardBg: 'bg-[#0d1d2d] border-[#00f0ff]/30 shadow-[0_0_12px_rgba(0,240,255,0.06)]',
    cardHeaderBg: 'bg-[#031d28] text-[#00f0ff] border-b border-[#00f0ff]/30',
    headerBg: 'bg-[#03090f] border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_4px_20px_rgba(0,240,255,0.1)]',
    accentText: 'text-[#00f0ff]',
    hudTag: 'text-[#00f0ff] font-mono text-xs tracking-wider uppercase font-bold',
    hudTitle: 'text-[#00f0ff] font-mono font-bold tracking-tight uppercase shadow-cyan-500/50',
    buttonPrimary: 'bg-[#00f0ff] hover:bg-[#33f3ff] text-[#03090f] font-bold border border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.3)] transition-colors cursor-pointer',
    buttonSecondary: 'bg-[#0d2334] hover:bg-[#14334a] text-[#80ebff] border border-[#00f0ff]/40 font-medium transition-colors cursor-pointer',
    buttonActive: 'bg-[#00f0ff] text-[#03090f] font-bold shadow-[0_0_10px_rgba(0,240,255,0.4)] border border-[#00f0ff]',
    buttonInactive: 'text-[#5a93a8] hover:text-[#00f0ff] hover:bg-[#081b2a]',
    inputBg: 'bg-[#05111a] text-[#c5f6ff] border-[#00f0ff]/40 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]',
    tableHeader: 'bg-[#031d28] text-[#00f0ff] font-mono uppercase text-xs tracking-wider border-b border-[#00f0ff]/40',
    tableRowEven: 'bg-[#081522]',
    tableRowOdd: 'bg-[#0d1d2d]',
    tableRowHover: 'hover:bg-[#00384c]/60',
    tableRowSelected: 'bg-[#00384c] text-[#00f0ff] font-medium border-l-2 border-[#00f0ff]',
    textMuted: 'text-[#5a93a8]',
    textBright: 'text-[#e6faff]',
    badgePrimary: 'bg-[#004254] text-[#00f0ff] border border-[#00f0ff]/50',
    badgeSecondary: 'bg-[#0d2334] text-[#80ebff] border border-[#00f0ff]/30',
    border: 'border-[#00f0ff]/30',
    borderMuted: 'border-[#00f0ff]/20',
    nodeBg: '#0d1d2d',
    nodeBorder: '#00f0ff',
    nodeText: '#c5f6ff',
  },
  military: {
    id: 'military',
    name: 'Old School Military',
    bg: 'bg-[#ede6d4] text-[#1c2919]',
    panelBg: 'bg-[#e3dac5]',
    cardBg: 'bg-[#f7f3e8] border-[#8a8063]',
    cardHeaderBg: 'bg-[#283822] text-[#e8f0d8]',
    headerBg: 'bg-[#283822] border-[#1d2918] text-[#e8f0d8] shadow-md',
    accentText: 'text-[#283822]',
    hudTag: 'text-[#283822] font-mono text-xs tracking-wider uppercase font-bold',
    hudTitle: 'text-[#1c2919] font-mono font-bold tracking-tight uppercase',
    buttonPrimary: 'bg-[#283822] hover:bg-[#1c2918] text-[#e8f0d8] font-bold border border-[#1d2918] transition-colors cursor-pointer',
    buttonSecondary: 'bg-[#dacfae] hover:bg-[#cfc29e] text-[#243320] border border-[#8a8063] font-medium transition-colors cursor-pointer',
    buttonActive: 'bg-[#283822] text-[#e8f0d8] font-bold shadow border border-[#1d2918]',
    buttonInactive: 'text-[#b3c7a3] hover:text-[#e8f0d8] hover:bg-[#394d31]',
    inputBg: 'bg-[#fbf9f3] text-[#1c2919] border-[#8a8063] focus:border-[#283822] focus:ring-1 focus:ring-[#283822]',
    tableHeader: 'bg-[#283822] text-[#e8f0d8] font-mono uppercase text-xs tracking-wider border-b border-[#1d2918]',
    tableRowEven: 'bg-[#e8e0cc]',
    tableRowOdd: 'bg-[#f2ecdc]',
    tableRowHover: 'hover:bg-[#d4c8a8]',
    tableRowSelected: 'bg-[#c2b58e] text-[#1c2919] font-bold border-l-2 border-[#283822]',
    textMuted: 'text-[#615a45]',
    textBright: 'text-[#141e12]',
    badgePrimary: 'bg-[#283822] text-[#e8f0d8]',
    badgeSecondary: 'bg-[#dacfae] text-[#283822] border border-[#8a8063]',
    border: 'border-[#8a8063]',
    borderMuted: 'border-[#ada386]',
    nodeBg: '#f7f3e8',
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
    <ThemeContext.Provider value={{ themeId, setThemeId, theme: currentTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    // Fallback if not inside Provider
    return {
      themeId: 'blueprint',
      setThemeId: () => {},
      theme: THEMES.blueprint,
      THEMES
    };
  }
  return context;
}

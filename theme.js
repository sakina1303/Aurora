import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const THEME_KEY = 'aurora:theme:v1';
const PAPER_KEY = 'aurora:paper:v1';

export const themes = [
  {
    id: 'linen', name: 'Warm linen', caption: 'The original little notebook',
    colors: { canvas: '#F8F2EA', paper: '#FFFCF6', paperEdge: '#E7D8C8', ink: '#3F352F', muted: '#8C796B', brown: '#765B4E', rose: '#DDAEAA', sage: '#A2AD92', line: '#E8DDD1', white: '#FFFFFF', soft: '#F8F0E8', spine: '#E9DDCD', summaryStart: '#E6C5B5', summaryMiddle: '#F3DDC9', summaryEnd: '#E6E4D0', noteStart: '#FAEEDD', noteEnd: '#F5E1D0' },
  },
  {
    id: 'blush', name: 'Blush hour', caption: 'Soft pink mornings',
    colors: { canvas: '#FAF0F1', paper: '#FFFAF9', paperEdge: '#E9D3D8', ink: '#49373F', muted: '#916F7A', brown: '#85566A', rose: '#DFAAB8', sage: '#A9BBAA', line: '#EEDDE1', white: '#FFFFFF', soft: '#F9EBEE', spine: '#E9D8DC', summaryStart: '#EAC6CF', summaryMiddle: '#F5DDE0', summaryEnd: '#EEE7DE', noteStart: '#FCEAEF', noteEnd: '#F6DDE6' },
  },
  {
    id: 'sage', name: 'Sage garden', caption: 'A quiet breath of green',
    colors: { canvas: '#F1F3EC', paper: '#FCFDF7', paperEdge: '#D9E0D0', ink: '#36453B', muted: '#718074', brown: '#536C58', rose: '#C9B5A5', sage: '#8FAD91', line: '#E0E7DB', white: '#FFFFFF', soft: '#EDF3E9', spine: '#DCE6D6', summaryStart: '#C8D9C5', summaryMiddle: '#E4EEDC', summaryEnd: '#EFE7D8', noteStart: '#EEF4DF', noteEnd: '#DCEACD' },
  },
  {
    id: 'lavender', name: 'Lavender dusk', caption: 'Dreamy and unhurried',
    colors: { canvas: '#F4F0F9', paper: '#FDFBFF', paperEdge: '#DED5EA', ink: '#40384D', muted: '#7F718E', brown: '#6C5A83', rose: '#CDB1D7', sage: '#AAB8AF', line: '#E7E0EF', white: '#FFFFFF', soft: '#F2ECF8', spine: '#E4DAED', summaryStart: '#DCC9E8', summaryMiddle: '#EEE1F0', summaryEnd: '#E6E6E1', noteStart: '#F5EAFB', noteEnd: '#EADCF4' },
  },
  {
    id: 'blue', name: 'Blue hour', caption: 'Calm as the evening sky',
    colors: { canvas: '#EDF3F6', paper: '#FBFDFE', paperEdge: '#D5E1E8', ink: '#34434D', muted: '#6F8290', brown: '#506F81', rose: '#D2AEB0', sage: '#9DB6AE', line: '#DEE8ED', white: '#FFFFFF', soft: '#ECF3F6', spine: '#D9E5EB', summaryStart: '#BDD6E2', summaryMiddle: '#DDEAF0', summaryEnd: '#E9E7DD', noteStart: '#E7F2F8', noteEnd: '#D9E9F2' },
  },
];

export const colors = themes[0].colors;
export const fonts = {
  display: 'DancingScript-Regular',
  accent: 'Lobster-Regular',
  body: Platform.select({ web: 'Georgia', ios: 'Georgia', android: 'serif', default: 'serif' }),
};

const ThemeContext = createContext({ theme: themes[0], colors, setTheme: () => {}, paperStyle: 'ruled', setPaperStyle: () => {} });

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState('linen');
  const [paperStyle, updatePaperStyle] = useState('ruled');
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(THEME_KEY).then(saved => {
      if (active && themes.some(item => item.id === saved)) setThemeId(saved);
    }).catch(() => {});
    AsyncStorage.getItem(PAPER_KEY).then(saved => {
      if (active && (saved === 'ruled' || saved === 'plain')) updatePaperStyle(saved);
    }).catch(() => {});
    return () => { active = false; };
  }, []);
  const setTheme = (id) => {
    if (!themes.some(item => item.id === id)) return;
    setThemeId(id);
    AsyncStorage.setItem(THEME_KEY, id).catch(() => {});
  };
  const setPaperStyle = (style) => {
    if (style !== 'ruled' && style !== 'plain') return;
    updatePaperStyle(style);
    AsyncStorage.setItem(PAPER_KEY, style).catch(() => {});
  };
  const value = useMemo(() => {
    const theme = themes.find(item => item.id === themeId) || themes[0];
    return { theme, colors: theme.colors, setTheme, paperStyle, setPaperStyle };
  }, [themeId, paperStyle]);
  return React.createElement(ThemeContext.Provider, { value }, children);
}

export const useTheme = () => useContext(ThemeContext);

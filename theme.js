import { Platform } from 'react-native';

export const colors = {
  canvas: '#F8F2EA',
  paper: '#FFFCF6',
  paperEdge: '#E7D8C8',
  ink: '#3F352F',
  muted: '#8C796B',
  brown: '#765B4E',
  rose: '#DDAEAA',
  sage: '#A2AD92',
  line: '#E8DDD1',
  white: '#FFFFFF',
};

export const fonts = {
  display: 'DancingScript-Regular',
  accent: 'Lobster-Regular',
  body: Platform.select({ web: 'Georgia', ios: 'Georgia', android: 'serif', default: 'serif' }),
};

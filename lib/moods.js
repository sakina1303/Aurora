export const moods = [
  { id: 'glowing', label: 'Glowing', symbol: '☀' },
  { id: 'calm', label: 'Calm', symbol: '☁' },
  { id: 'dreamy', label: 'Dreamy', symbol: '☾' },
  { id: 'tender', label: 'Tender', symbol: '♡' },
  { id: 'stormy', label: 'Stormy', symbol: '☂' },
];

export const moodFor = id => moods.find(item => item.id === id);

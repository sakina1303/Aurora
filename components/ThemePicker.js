import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, themes, useTheme } from '../theme';

export default function ThemePicker({ visible, onClose }) {
  const { theme, colors, setTheme, paperStyle, setPaperStyle } = useTheme();
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.shade}>
      <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close themes" />
      <View style={[styles.sheet, { backgroundColor: colors.canvas }]}>
        <View style={[styles.handle, { backgroundColor: colors.paperEdge }]} />
        <View style={styles.heading}>
          <View><Text style={[styles.kicker, { color: colors.muted }]}>MAKE IT YOURS</Text><Text style={[styles.title, { color: colors.brown }]}>Your little world</Text></View>
          <TouchableOpacity onPress={onClose} style={[styles.close, { backgroundColor: colors.paper }]} accessibilityLabel="Close themes"><Ionicons name="close" size={20} color={colors.brown} /></TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <Text style={[styles.section, { color: colors.muted }]}>COLOUR STORIES</Text>
          {themes.map(option => <TouchableOpacity key={option.id} onPress={() => setTheme(option.id)} accessibilityRole="button" accessibilityLabel={`${option.name} theme`} accessibilityState={{ selected: theme.id === option.id }} style={[styles.themeCard, { backgroundColor: colors.paper, borderColor: theme.id === option.id ? colors.brown : colors.paperEdge }]}>
            <View style={[styles.miniPage, { backgroundColor: option.colors.paper, borderColor: option.colors.paperEdge }]}><View style={[styles.miniLineShort, { backgroundColor: option.colors.rose }]} /><View style={[styles.miniLine, { backgroundColor: option.colors.line }]} /><View style={[styles.miniLine, { backgroundColor: option.colors.line }]} /><View style={[styles.miniLineTiny, { backgroundColor: option.colors.line }]} /></View>
            <View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.ink }]}>{option.name}</Text><Text style={[styles.cardCaption, { color: colors.muted }]}>{option.caption}</Text><View style={styles.swatches}>{[option.colors.canvas, option.colors.rose, option.colors.sage, option.colors.brown].map((shade, i) => <View key={i} style={[styles.swatch, { backgroundColor: shade, borderColor: colors.paperEdge }]} />)}</View></View>
            <Ionicons name={theme.id === option.id ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={colors.brown} />
          </TouchableOpacity>)}
          <Text style={[styles.section, styles.paperHeading, { color: colors.muted }]}>YOUR PAGES</Text>
          <View style={styles.paperOptions}>{[['ruled', 'Ruled', 'Classic diary lines'], ['plain', 'Plain', 'Clean open paper']].map(([id, name, caption]) => <TouchableOpacity key={id} onPress={() => setPaperStyle(id)} accessibilityRole="button" accessibilityLabel={`${name} paper`} accessibilityState={{ selected: paperStyle === id }} style={[styles.paperOption, { backgroundColor: colors.paper, borderColor: paperStyle === id ? colors.brown : colors.paperEdge }]}><Ionicons name={id === 'ruled' ? 'reorder-three-outline' : 'square-outline'} size={22} color={colors.brown} /><Text style={[styles.paperName, { color: colors.ink }]}>{name}</Text><Text style={[styles.paperCaption, { color: colors.muted }]}>{caption}</Text></TouchableOpacity>)}</View>
        </ScrollView>
      </View>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({
  shade: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#2C252D88' },
  sheet: { maxHeight: '88%', borderTopLeftRadius: 27, borderTopRightRadius: 27, paddingTop: 11, paddingHorizontal: 22 },
  handle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 18 },
  heading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 18 },
  kicker: { fontFamily: fonts.body, fontSize: 10, fontWeight: '700', letterSpacing: 2 },
  title: { fontFamily: fonts.display, fontSize: 32, marginTop: 2 },
  close: { width: 35, height: 35, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  content: { paddingBottom: 35 },
  section: { fontFamily: fonts.body, fontWeight: '700', fontSize: 10, letterSpacing: 2, marginBottom: 12 },
  themeCard: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, padding: 12, marginBottom: 9, gap: 12 },
  miniPage: { width: 43, height: 54, borderRadius: 4, borderWidth: 1, padding: 7, justifyContent: 'center', gap: 5, transform: [{ rotate: '-4deg' }] },
  miniLineShort: { height: 3, width: 16, borderRadius: 2, marginBottom: 3 }, miniLine: { height: 2, width: 25 }, miniLineTiny: { height: 2, width: 17 },
  cardText: { flex: 1 }, cardTitle: { fontFamily: fonts.accent, fontSize: 17 }, cardCaption: { fontFamily: fonts.body, fontSize: 11, marginTop: 1 },
  swatches: { flexDirection: 'row', marginTop: 7, gap: 5 }, swatch: { width: 12, height: 12, borderRadius: 6, borderWidth: 1 },
  paperHeading: { marginTop: 19 }, paperOptions: { flexDirection: 'row', gap: 9 },
  paperOption: { flex: 1, borderWidth: 1.5, borderRadius: 13, padding: 12, minHeight: 93 },
  paperName: { fontFamily: fonts.accent, fontSize: 16, marginTop: 5 }, paperCaption: { fontFamily: fonts.body, fontSize: 10, marginTop: 1 },
});

import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { fonts, useTheme } from '../theme';
import { displayDate } from '../lib/diary';
import { moodFor } from '../lib/moods';

export default function DiaryPage({ entry, pageNumber, compact = false, editing = false, children }) {
  const { colors, paperStyle } = useTheme();
  const styles = createStyles(colors);
  return (
    <View style={styles.page}>
      <View pointerEvents="none" style={styles.spine} />
      {paperStyle === 'ruled' && <View pointerEvents="none" style={styles.paperLines}>{Array.from({ length: 18 }, (_, index) => <View key={index} style={styles.paperLine} />)}</View>}
      <View style={styles.topRule} />
      <View style={styles.meta}>
        <Text style={styles.eyebrow}>AURORA  /  MY DIARY</Text>
        <View style={styles.metaRight}>{!!moodFor(entry.mood) && <Text style={styles.moodStamp}>{moodFor(entry.mood).symbol} {moodFor(entry.mood).label}</Text>}<Text style={styles.pageNumber}>{String(pageNumber).padStart(2, '0')}</Text></View>
      </View>
      <Text style={styles.date}>{displayDate(entry.date)}</Text>
      {!editing && <Text style={styles.title}>{entry.title || 'Untitled day'}</Text>}
      {!editing && <View style={styles.divider} />}
      {children || (
        <ScrollView style={styles.body} showsVerticalScrollIndicator={false} scrollEnabled={!compact}>
          <Text style={styles.entryText}>{entry.text || 'A fresh page for your thoughts.'}</Text>
          {!!entry.images?.length && <View style={styles.photos}>
            {entry.images.map((uri, index) => <Image key={`${uri}-${index}`} source={{ uri }} style={styles.photo} />)}
          </View>}
        </ScrollView>
      )}
      <View style={styles.bottom}>
        <View style={styles.bottomRule} />
        <Text style={styles.footer}>a little moment, kept forever ♡</Text>
      </View>
      <View style={styles.corner} />
    </View>
  );
}

const createStyles = colors => StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, borderTopRightRadius: 16, borderBottomRightRadius: 16, borderTopLeftRadius: 5, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: colors.paperEdge, paddingHorizontal: 27, paddingTop: 23, paddingBottom: 18, shadowColor: '#59483E', shadowOpacity: 0.18, shadowRadius: 16, shadowOffset: { width: 3, height: 8 }, elevation: 5, overflow: 'hidden' },
  spine: { position: 'absolute', top: 0, bottom: 0, left: 6, width: 7, backgroundColor: colors.spine, borderRightWidth: 1, borderRightColor: colors.paperEdge },
  paperLines: { position: 'absolute', left: 26, right: 20, top: 184, bottom: 26, justifyContent: 'space-around', opacity: 0.42 },
  paperLine: { height: 1, backgroundColor: colors.line },
  topRule: { height: 4, width: 61, borderRadius: 2, backgroundColor: colors.rose, marginBottom: 18 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metaRight: { flexDirection: 'row', alignItems: 'center', gap: 10 }, moodStamp: { fontFamily: fonts.body, fontSize: 10, color: colors.brown },
  eyebrow: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 2.3, color: colors.muted, fontWeight: '700' },
  pageNumber: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, color: colors.muted },
  date: { fontFamily: fonts.display, fontSize: 27, color: colors.brown, marginTop: 16 },
  title: { fontFamily: fonts.accent, color: colors.ink, fontSize: 31, marginTop: 4 },
  divider: { height: 1, backgroundColor: colors.line, marginTop: 16, marginBottom: 16 },
  body: { flex: 1 },
  entryText: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 30, minHeight: 80 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 20 },
  photo: { width: 112, height: 112, borderWidth: 5, borderColor: colors.white, borderRadius: 3, transform: [{ rotate: '-2deg' }] },
  bottom: { marginTop: 16 },
  bottomRule: { height: 1, backgroundColor: colors.line },
  footer: { fontFamily: fonts.display, color: colors.muted, fontSize: 18, textAlign: 'right', marginTop: 9 },
  corner: { position: 'absolute', right: -14, bottom: -14, width: 28, height: 28, backgroundColor: colors.canvas, transform: [{ rotate: '45deg' }] },
});

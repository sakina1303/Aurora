import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { colors, fonts } from '../theme';
import { displayDate } from '../lib/diary';

export default function DiaryPage({ entry, pageNumber, compact = false, editing = false, children }) {
  return (
    <View style={styles.page}>
      <View style={styles.topRule} />
      <View style={styles.meta}>
        <Text style={styles.eyebrow}>AURORA • MY DIARY</Text>
        <Text style={styles.pageNumber}>{String(pageNumber).padStart(2, '0')}</Text>
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
        <Text style={styles.footer}>a little moment, kept forever</Text>
      </View>
      <View style={styles.corner} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.paper, borderRadius: 12, borderWidth: 1, borderColor: colors.paperEdge, padding: 22, shadowColor: '#59483E', shadowOpacity: 0.13, shadowRadius: 12, shadowOffset: { width: 1, height: 6 }, elevation: 4, overflow: 'hidden' },
  topRule: { height: 3, width: 55, borderRadius: 2, backgroundColor: colors.rose, marginBottom: 20 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontFamily: fonts.body, fontSize: 10, letterSpacing: 2.3, color: colors.muted, fontWeight: '700' },
  pageNumber: { fontFamily: fonts.body, fontSize: 11, letterSpacing: 1, color: colors.muted },
  date: { fontFamily: fonts.display, fontSize: 23, color: colors.brown, marginTop: 17 },
  title: { fontFamily: fonts.accent, color: colors.ink, fontSize: 29, marginTop: 3 },
  divider: { height: 1, backgroundColor: colors.line, marginTop: 16, marginBottom: 16 },
  body: { flex: 1 },
  entryText: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 27, minHeight: 80 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 20 },
  photo: { width: 100, height: 100, borderRadius: 5 },
  bottom: { marginTop: 16 },
  bottomRule: { height: 1, backgroundColor: colors.line },
  footer: { fontFamily: fonts.display, color: colors.muted, fontSize: 18, textAlign: 'right', marginTop: 9 },
  corner: { position: 'absolute', right: -14, bottom: -14, width: 28, height: 28, backgroundColor: colors.canvas, transform: [{ rotate: '45deg' }] },
});

import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { displayDate, listJournals, localDay } from '../lib/diary';
import { boardHistory, loadVision } from '../lib/vision';
import { moodFor } from '../lib/moods';
import { fonts, useTheme } from '../theme';

export default function MyJournalsScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [entries, setEntries] = useState([]);
  const [visionHistory, setVisionHistory] = useState([]);
  const [query, setQuery] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    listJournals().then(items => { if (active) setEntries(items); });
    loadVision().then(value => { if (active) setVisionHistory(boardHistory(value)); });
    return () => { active = false; };
  }, []));
  const visible = useMemo(() => entries.filter(item => `${item.title} ${item.text} ${item.date}`.toLowerCase().includes(query.trim().toLowerCase())), [entries, query]);

  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <Text style={styles.kicker}>THE STORY SO FAR</Text>
      <Text style={styles.title}>My diary</Text>
      <Text style={styles.intro}>{entries.length} {entries.length === 1 ? 'page' : 'pages'} of moments worth keeping</Text>
      <TouchableOpacity style={styles.bookButton} onPress={() => navigation.navigate('JournalDetail', { date: localDay() })} accessibilityRole="button" accessibilityLabel="Read as a diary">
        <Ionicons name="book-outline" size={21} color={colors.white} />
        <View style={styles.bookCopy}><Text style={styles.bookTitle}>Read as a diary</Text><Text style={styles.bookSubtitle}>Every day has its own page</Text></View>
        <Ionicons name="arrow-forward" size={19} color={colors.white} />
      </TouchableOpacity>
      <View style={styles.search}><Ionicons name="search-outline" size={18} color={colors.muted} /><TextInput value={query} onChangeText={setQuery} placeholder="Find a moment..." placeholderTextColor={colors.muted} style={styles.searchInput} accessibilityLabel="Search diary" /></View>
    </View>
    <FlatList data={visible} keyExtractor={item => item.date} contentContainerStyle={styles.list} renderItem={({ item }) =>
      <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={() => navigation.navigate('JournalDetail', { date: item.date })} accessibilityRole="button">
        <View style={styles.cardTop}><Text style={styles.date}>{displayDate(item.date, { month: 'short', day: 'numeric', year: 'numeric' })}</Text><Text style={styles.number}>NO. {String(entries.length - entries.indexOf(item)).padStart(2, '0')}</Text></View>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.title || 'Untitled day'}</Text>
        <Text style={styles.preview} numberOfLines={2}>{item.text}</Text>
        <View style={styles.cardBottom}><Text style={styles.photos}>{item.images.length ? `${item.images.length} photo${item.images.length === 1 ? '' : 's'}` : 'A written moment'}</Text><View style={styles.cardEnd}>{!!moodFor(item.mood) && <Text style={styles.cardMood}>{moodFor(item.mood).symbol} {moodFor(item.mood).label}</Text>}<Ionicons name="arrow-forward" size={18} color={colors.brown} /></View></View>
      </TouchableOpacity>} ListEmptyComponent={<View style={styles.empty}>
        <Ionicons name={query ? 'search-outline' : 'book-outline'} size={36} color={colors.rose} />
        <Text style={styles.emptyTitle}>{query ? 'No pages found' : 'Your diary begins here'}</Text>
        <Text style={styles.emptyText}>{query ? 'Try another word or date.' : 'Write a little about today. This space will hold it for you.'}</Text>
        {!query && <TouchableOpacity style={styles.writeButton} onPress={() => navigation.navigate('Today')}><Text style={styles.writeText}>Write today’s page</Text></TouchableOpacity>}
      </View>} ListFooterComponent={<View style={styles.archive}>
        <Text style={styles.archiveKicker}>THE DREAMS YOU KEPT</Text>
        <Text style={styles.archiveTitle}>Vision board history</Text>
        {visionHistory.length ? visionHistory.map(item => <TouchableOpacity key={`${item.kind}-${item.key}`} style={styles.historyCard} onPress={() => navigation.navigate('Vision', { kind: item.kind, period: item.key })} accessibilityRole="button" accessibilityLabel={`Open ${item.kind} vision board from ${item.label}`}>
          <View style={styles.historyIcon}><Ionicons name={item.kind === 'Yearly' ? 'sparkles-outline' : 'calendar-outline'} size={20} color={colors.brown} /></View>
          <View style={{ flex: 1 }}><Text style={styles.historyName}>{item.label}</Text><Text style={styles.historyMeta}>{item.kind} · {item.done} done · {item.total - item.done} pending</Text></View>
          <Ionicons name="arrow-forward" size={17} color={colors.brown} />
        </TouchableOpacity>) : <View style={styles.historyEmpty}><Text style={styles.historyEmptyText}>Your past monthly and yearly boards will appear here as time goes by.</Text></View>}
      </View>} />
  </SafeAreaView>;
}

const createStyles = colors => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 24, paddingTop: 14 },
  kicker: { fontFamily: fonts.body, color: colors.muted, letterSpacing: 2.2, fontSize: 10, fontWeight: '700' },
  title: { fontFamily: fonts.display, color: colors.brown, fontSize: 43, marginTop: 4 },
  intro: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, marginBottom: 17 },
  bookButton: { backgroundColor: colors.brown, borderRadius: 13, flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 17, paddingVertical: 15, marginBottom: 18 },
  bookCopy: { flex: 1 },
  bookTitle: { color: colors.white, fontFamily: fonts.accent, fontSize: 18 },
  bookSubtitle: { fontFamily: fonts.body, color: colors.white, opacity: 0.8, fontSize: 11, marginTop: 2 },
  search: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, borderRadius: 12, paddingHorizontal: 14, height: 45 },
  searchInput: { flex: 1, fontFamily: fonts.body, color: colors.ink, marginLeft: 8, fontSize: 14 },
  list: { padding: 20, paddingBottom: 35 },
  card: { backgroundColor: colors.paper, padding: 20, marginBottom: 13, borderRadius: 10, borderWidth: 1, borderColor: colors.paperEdge, shadowColor: '#6C5B4D', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  date: { fontFamily: fonts.body, color: colors.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  number: { fontFamily: fonts.body, color: colors.muted, fontSize: 10, letterSpacing: 1 },
  cardTitle: { color: colors.ink, fontFamily: fonts.accent, fontSize: 23, marginTop: 10 },
  preview: { fontFamily: fonts.body, color: colors.muted, fontSize: 14, lineHeight: 20, marginTop: 7 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: colors.line, marginTop: 15, paddingTop: 12 },
  cardEnd: { flexDirection: 'row', alignItems: 'center', gap: 10 }, cardMood: { fontFamily: fonts.body, color: colors.brown, fontSize: 10 },
  photos: { fontFamily: fonts.body, color: colors.muted, fontSize: 11 },
  empty: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 38, paddingVertical: 44 },
  emptyTitle: { fontFamily: fonts.display, fontSize: 30, color: colors.brown, marginTop: 15 },
  emptyText: { fontFamily: fonts.body, color: colors.muted, fontSize: 14, textAlign: 'center', lineHeight: 21, marginTop: 6 },
  writeButton: { backgroundColor: colors.brown, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12, marginTop: 22 },
  writeText: { color: colors.white, fontFamily: fonts.accent, fontSize: 16 },
  archive: { marginTop: 15, paddingTop: 21, borderTopWidth: 1, borderColor: colors.line },
  archiveKicker: { color: colors.muted, fontFamily: fonts.body, letterSpacing: 1.8, fontSize: 10, fontWeight: '700' },
  archiveTitle: { color: colors.brown, fontFamily: fonts.display, fontSize: 30, marginTop: 3, marginBottom: 12 },
  historyCard: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.paperEdge, borderRadius: 12, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  historyIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  historyName: { color: colors.ink, fontFamily: fonts.accent, fontSize: 18 },
  historyMeta: { color: colors.muted, fontFamily: fonts.body, fontSize: 11, marginTop: 2 },
  historyEmpty: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.paperEdge, borderRadius: 12, padding: 17 },
  historyEmptyText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
});

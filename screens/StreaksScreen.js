import React, { useCallback, useRef, useState } from 'react';
import { Alert, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import ConfettiCannon from 'react-native-confetti-cannon';
import { LinearGradient } from 'expo-linear-gradient';
import CelebrationBurst from '../components/CelebrationBurst';
import { addDays, currentStreak, loadHabits, localDay, saveHabits } from '../lib/diary';
import { colors, fonts } from '../theme';

const weekLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function StreaksScreen() {
  const [habits, setHabits] = useState([]);
  const habitsRef = useRef([]);
  const [today, setToday] = useState(localDay());
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState(null);
  const [editName, setEditName] = useState('');
  const confetti = useRef(null);
  const writeQueue = useRef(Promise.resolve());

  useFocusEffect(useCallback(() => {
    let active = true;
    setToday(localDay());
    writeQueue.current.then(loadHabits).then(items => { if (active) { habitsRef.current = items; setHabits(items); } }).catch(() => { if (active) Alert.alert('Could not load rituals', 'Please try again.'); });
    return () => { active = false; };
  }, []));

  const commit = (items) => {
    habitsRef.current = items;
    setHabits(items);
    writeQueue.current = writeQueue.current.catch(() => {}).then(() => saveHabits(items)).catch(() => Alert.alert('Could not save rituals', 'Please try again.'));
  };
  const add = () => {
    const name = newName.trim();
    if (!name) return;
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, name, completedDates: [], createdAt: today };
    commit([...habitsRef.current, item]);
    setNewName('');
  };
  const toggle = (habit) => {
    const completed = habit.completedDates || [];
    const done = completed.includes(today);
    commit(habitsRef.current.map(item => item.id === habit.id ? { ...item, completedDates: done ? completed.filter(date => date !== today) : [...completed, today] } : item));
    if (!done) confetti.current?.start();
  };
  const menu = (habit) => Alert.alert(habit.name, 'Manage this ritual', [
    { text: 'Rename', onPress: () => { setEditing(habit); setEditName(habit.name); } },
    { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Delete ritual?', `Remove ${habit.name} and its history?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => commit(habitsRef.current.filter(item => item.id !== habit.id)) },
    ]) },
    { text: 'Cancel', style: 'cancel' },
  ]);
  const saveName = () => {
    const name = editName.trim();
    if (!name) return;
    commit(habitsRef.current.map(item => item.id === editing.id ? { ...item, name } : item));
    setEditing(null);
  };
  const completedToday = habits.filter(item => (item.completedDates || []).includes(today)).length;
  const week = Array.from({ length: 7 }, (_, offset) => addDays(today, offset - 6));

  return <SafeAreaView style={styles.screen}>
    {Platform.OS === 'web' ? <CelebrationBurst ref={confetti} originY={300} /> : <ConfettiCannon ref={confetti} autoStart={false} count={120} explosionSpeed={600} fadeOut origin={{ x: 190, y: 80 }} />}
    <View style={styles.header}>
      <Text style={styles.kicker}>SMALL STEPS, EVERY DAY</Text>
      <Text style={styles.title}>My rituals</Text>
      <Text style={styles.intro}>A gentle record of showing up for yourself.</Text>
    </View>
    <LinearGradient colors={['#E6C5B5', '#F3DDC9', '#E6E4D0']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.summary}><View style={styles.summaryIcon}><Ionicons name="sparkles" size={23} color={colors.brown} /></View><View style={{ flex: 1, marginLeft: 13 }}><Text style={styles.summaryTitle}>{completedToday} of {habits.length} complete</Text><Text style={styles.summarySub}>{habits.length ? 'Your little wins are adding up ♡' : 'Your journey starts with one little step.'}</Text></View></LinearGradient>
    <View style={styles.addRow}><TextInput style={styles.input} value={newName} onChangeText={setNewName} placeholder="A ritual to begin..." placeholderTextColor={colors.muted} returnKeyType="done" onSubmitEditing={add} maxLength={40} accessibilityLabel="New ritual name" /><TouchableOpacity style={styles.addButton} onPress={add} accessibilityLabel="Add ritual"><Ionicons name="add" size={23} color={colors.white} /></TouchableOpacity></View>
    <FlatList data={habits} keyExtractor={item => item.id} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.empty}><Ionicons name="leaf-outline" size={35} color={colors.sage} /><Text style={styles.emptyTitle}>Begin gently</Text><Text style={styles.emptyText}>Add a ritual above, then mark it when you do it today.</Text></View>} renderItem={({ item }) => {
      const dates = new Set(item.completedDates || []);
      const done = dates.has(today);
      const streak = currentStreak(item.completedDates, today);
      return <View style={styles.card}>
        <View style={[styles.cardAccent, done && styles.cardAccentDone]} />
        <View style={styles.cardTop}><View style={{ flex: 1 }}><Text style={styles.habitName}>{item.name}</Text><Text style={styles.streak}>{streak ? `${streak} day streak` : 'A new beginning'}</Text></View><TouchableOpacity onPress={() => menu(item)} style={styles.more} accessibilityLabel={`Options for ${item.name}`}><Ionicons name="ellipsis-horizontal" size={21} color={colors.muted} /></TouchableOpacity></View>
        <View style={styles.week}>{week.map((day, i) => <View key={day} style={styles.dayColumn}><Text style={styles.dayLabel}>{weekLetters[new Date(`${day}T12:00:00`).getDay() === 0 ? 6 : new Date(`${day}T12:00:00`).getDay() - 1]}</Text><View style={[styles.dot, dates.has(day) && styles.dotDone, day === today && styles.dotToday]}>{dates.has(day) && <Ionicons name="checkmark" size={13} color={colors.white} />}</View></View>)}</View>
        <TouchableOpacity style={[styles.completeButton, done && styles.completeButtonDone]} onPress={() => toggle(item)} accessibilityRole="button"><Ionicons name={done ? 'checkmark-circle' : 'sparkles-outline'} size={19} color={done ? colors.brown : colors.white} /><Text style={[styles.completeText, done && styles.completeTextDone]}>{done ? 'Completed today' : 'Complete for today'}</Text></TouchableOpacity>
      </View>;
    }} />
    <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}><View style={styles.modalShade}><View style={styles.modal}><Text style={styles.modalTitle}>Rename ritual</Text><TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} maxLength={40} autoFocus /><View style={styles.modalActions}><TouchableOpacity onPress={() => setEditing(null)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={saveName}><Text style={styles.confirm}>Save</Text></TouchableOpacity></View></View></View></Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 24, paddingTop: 14 }, kicker: { fontFamily: fonts.body, color: colors.muted, letterSpacing: 2.2, fontSize: 10, fontWeight: '700' },
  title: { fontFamily: fonts.display, fontSize: 43, color: colors.brown, marginTop: 4 }, intro: { fontFamily: fonts.body, color: colors.muted, fontSize: 13 },
  summary: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 20, borderRadius: 18, padding: 19, minHeight: 92, shadowColor: '#9C7C69', shadowOpacity: 0.12, shadowRadius: 10, elevation: 3 },
  summaryIcon: { width: 43, height: 43, borderRadius: 22, backgroundColor: '#FFF8E6AA', alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { fontFamily: fonts.accent, color: colors.ink, fontSize: 19 }, summarySub: { fontFamily: fonts.body, color: colors.brown, fontSize: 12, marginTop: 3 },
  addRow: { flexDirection: 'row', marginHorizontal: 20, marginTop: 18, gap: 9 },
  input: { flex: 1, fontFamily: fonts.body, backgroundColor: colors.paper, color: colors.ink, borderRadius: 12, borderColor: colors.line, borderWidth: 1, paddingHorizontal: 14, height: 48 },
  addButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brown, borderRadius: 12 },
  list: { paddingHorizontal: 20, paddingTop: 15, paddingBottom: 30 },
  card: { backgroundColor: colors.paper, borderColor: colors.paperEdge, borderWidth: 1, borderRadius: 15, padding: 18, marginBottom: 13, overflow: 'hidden', shadowColor: '#59483E', shadowOpacity: 0.07, shadowRadius: 8, elevation: 2 },
  cardAccent: { position: 'absolute', top: 0, left: 0, bottom: 0, width: 5, backgroundColor: colors.rose }, cardAccentDone: { backgroundColor: colors.sage },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start' }, habitName: { fontFamily: fonts.accent, fontSize: 22, color: colors.ink }, streak: { fontFamily: fonts.body, color: colors.brown, fontSize: 12, marginTop: 3 }, more: { padding: 5 },
  week: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 18 }, dayColumn: { alignItems: 'center', gap: 8 }, dayLabel: { fontFamily: fonts.body, color: colors.muted, fontSize: 10 },
  dot: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E9E1D6', alignItems: 'center', justifyContent: 'center' }, dotDone: { backgroundColor: colors.sage }, dotToday: { borderWidth: 2, borderColor: colors.brown },
  completeButton: { backgroundColor: colors.brown, borderRadius: 10, paddingVertical: 11, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
  completeButtonDone: { backgroundColor: '#EFE8DC' }, completeText: { fontFamily: fonts.body, color: colors.white, fontSize: 13, fontWeight: '700' }, completeTextDone: { color: colors.brown },
  empty: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 70 }, emptyTitle: { fontFamily: fonts.display, color: colors.brown, fontSize: 30, marginTop: 10 }, emptyText: { fontFamily: fonts.body, color: colors.muted, textAlign: 'center', lineHeight: 21, marginTop: 5 },
  modalShade: { flex: 1, justifyContent: 'center', backgroundColor: '#0007', padding: 28 }, modal: { backgroundColor: colors.paper, borderRadius: 16, padding: 22 }, modalTitle: { fontFamily: fonts.display, color: colors.brown, fontSize: 29 }, modalInput: { fontFamily: fonts.body, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, marginTop: 13, color: colors.ink }, modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 25, marginTop: 20 }, cancel: { fontFamily: fonts.body, color: colors.muted, fontWeight: '700' }, confirm: { fontFamily: fonts.body, color: colors.brown, fontWeight: '700' },
});

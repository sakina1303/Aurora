import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Image, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DiaryPage from '../components/DiaryPage';
import PageTurn from '../components/PageTurn';
import { addDays, dayAccess, deleteJournal, displayDate, listJournals, saveJournal } from '../lib/diary';
import { persistImage } from '../lib/media';
import useLocalDay from '../lib/useLocalDay';
import { moodFor, moods } from '../lib/moods';
import { fonts, useTheme } from '../theme';

export default function JournalDetailScreen({ route, navigation }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [entries, setEntries] = useState([]);
  const today = useLocalDay();
  const [selectedDate, setSelectedDate] = useState(route.params?.date || today);
  const [loading, setLoading] = useState(true);
  const [transition, setTransition] = useState(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const allowLeave = useRef(false);
  const swipeStart = useRef(null);
  const tomorrow = addDays(today, 1);
  const pageFor = useCallback(day => {
    if (day > today) return { date: day, title: '', text: '', images: [], isLocked: true };
    return entries.find(item => item.date === day) || {
      date: day, title: 'An unwritten day', text: 'Nothing was written on this day. Tap Write to add a memory.', images: [], mood: null, isBlank: true,
    };
  }, [entries, today]);
  const entry = pageFor(selectedDate);
  const pageNumber = Number(selectedDate.slice(-2));
  const unchangedDraft = draft && entry && JSON.stringify(draft) === JSON.stringify({ ...entry, title: entry.isBlank ? '' : entry.title, text: entry.isBlank ? '' : entry.text, images: [...entry.images] });

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', event => {
      if (!editing || allowLeave.current) return;
      event.preventDefault();
      if (unchangedDraft) {
        setEditing(false);
        return;
      }
      Alert.alert('Discard edits?', 'This page has unsaved changes.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => {
          allowLeave.current = true;
          navigation.dispatch(event.data.action);
        } },
      ]);
    });
    return unsubscribe;
  }, [navigation, editing, draft, entry, unchangedDraft]);

  useEffect(() => {
    let active = true;
    listJournals().then(items => {
      if (!active) return;
      setEntries(items);
      const requested = route.params?.date || today;
      setSelectedDate(requested > addDays(today, 1) ? addDays(today, 1) : requested);
      setLoading(false);
    }).catch(() => { if (active) { setLoading(false); Alert.alert('Could not open diary', 'Please try again.'); } });
    return () => { active = false; };
  }, [route.params?.date]);

  const turn = useCallback((amount) => {
    if (editing || transition) return;
    const nextDay = addDays(selectedDate, amount);
    if (nextDay > tomorrow) return;
    setTransition({ from: entry, to: pageFor(nextDay), nextDay, direction: amount > 0 ? 'forward' : 'backward' });
  }, [editing, transition, selectedDate, tomorrow, entry, pageFor]);

  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => !editing && Math.abs(gesture.dx) > 25 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -70) turn(1);
      if (gesture.dx > 70) turn(-1);
    },
  }), [editing, turn]);

  const swipePoint = event => {
    const touch = event.nativeEvent.changedTouches?.[0] || event.nativeEvent;
    return { x: touch.pageX ?? touch.clientX, y: touch.pageY ?? touch.clientY };
  };
  const beginSwipe = event => { swipeStart.current = swipePoint(event); };
  const endSwipe = event => {
    if (!swipeStart.current || editing) return;
    const end = swipePoint(event);
    const dx = end.x - swipeStart.current.x;
    const dy = end.y - swipeStart.current.y;
    swipeStart.current = null;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    turn(dx < 0 ? 1 : -1);
  };

  const startEdit = () => { if (entry.isLocked) return; setDraft({ ...entry, title: entry.isBlank ? '' : entry.title, text: entry.isBlank ? '' : entry.text, images: [...entry.images] }); setEditing(true); };
  const saveEdit = async () => {
    if (!draft.title.trim() || !draft.text.trim()) return Alert.alert('Finish this page', 'Add a title and a few words before saving.');
    try {
      await saveJournal(draft);
      setEntries(current => [...current.filter(item => item.date !== draft.date), { ...draft, isBlank: false }].sort((a, b) => b.date.localeCompare(a.date)));
      setEditing(false);
    } catch { Alert.alert('Could not save', 'Your edits are still here. Please try again.'); }
  };
  const leaveEdit = () => {
    if (unchangedDraft) return setEditing(false);
    Alert.alert('Discard edits?', 'This page has unsaved changes.', [
      { text: 'Keep editing', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => setEditing(false) },
    ]);
  };
  const remove = () => Alert.alert('Delete this page?', 'This cannot be undone.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => {
      try { await deleteJournal(entry.date); allowLeave.current = true; navigation.goBack(); }
      catch { Alert.alert('Could not delete', 'Please try again.'); }
    } },
  ]);
  const addPhoto = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Photo permission needed', 'Allow access in your device settings.');
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: Platform.OS === 'web' });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const asset = result.assets[0];
        const permanentUri = Platform.OS === 'web' && asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : persistImage(asset.uri);
        setDraft(current => ({ ...current, images: [...current.images, permanentUri] }));
      }
    } catch { Alert.alert('Could not add photo', 'Please try again.'); }
  };

  if (loading) return <SafeAreaView style={styles.screen}><TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}><Text style={styles.backText}>‹ Back</Text></TouchableOpacity><Text style={styles.loading}>Opening your diary...</Text></SafeAreaView>;

  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <TouchableOpacity onPress={editing ? leaveEdit : () => navigation.goBack()} style={styles.headerAction} accessibilityLabel={editing ? 'Cancel editing' : 'Back to diary'}><Ionicons name="arrow-back" size={22} color={colors.brown} /></TouchableOpacity>
      <Text style={styles.headerTitle}>{editing ? 'Edit page' : 'My diary'}</Text>
      {entry.isLocked ? <View style={styles.headerAction} /> : <TouchableOpacity onPress={editing ? saveEdit : startEdit} style={styles.headerAction} accessibilityRole="button"><Text style={styles.editLabel}>{editing ? 'Save' : entry.isBlank ? 'Write' : 'Edit'}</Text></TouchableOpacity>}
    </View>
    <View style={styles.pageWrap} {...(!editing && Platform.OS !== 'web' ? responder.panHandlers : {})} {...(!editing && Platform.OS === 'web' ? { onMouseDown: beginSwipe, onMouseUp: endSwipe, onTouchStart: beginSwipe, onTouchEnd: endSwipe } : {})}>
      {editing ? <DiaryPage entry={draft} pageNumber={pageNumber} editing>
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <TextInput value={draft.title} onChangeText={value => setDraft(current => ({ ...current, title: value }))} style={styles.titleInput} placeholder="Page title" placeholderTextColor={colors.muted} />
          <View style={styles.moodRow}><Text style={styles.moodLabel}>{draft.mood ? `FELT ${moodFor(draft.mood)?.label.toUpperCase()}` : 'THIS DAY FELT'}</Text>{moods.map(option => <TouchableOpacity key={option.id} onPress={() => setDraft(current => ({ ...current, mood: current.mood === option.id ? null : option.id }))} accessibilityRole="button" accessibilityLabel={`${option.label} mood`} accessibilityState={{ selected: draft.mood === option.id }} style={[styles.moodChip, draft.mood === option.id && styles.moodChipSelected]}><Text style={[styles.moodSymbol, draft.mood === option.id && styles.moodSymbolSelected]}>{option.symbol}</Text></TouchableOpacity>)}</View>
          <TextInput value={draft.text} onChangeText={value => setDraft(current => ({ ...current, text: value }))} style={styles.bodyInput} placeholder="Your thoughts..." placeholderTextColor={colors.muted} multiline textAlignVertical="top" />
          <TouchableOpacity onPress={addPhoto} style={styles.photoPicker} accessibilityLabel="Choose a diary photo"><Ionicons name="images-outline" size={20} color={colors.brown} /><Text style={styles.addPhoto}>Add a photo to this page</Text></TouchableOpacity>
          <View style={styles.photos}>{draft.images.map((uri, photoIndex) => <View key={`${uri}-${photoIndex}`} style={styles.photoWrap}><Image source={{ uri }} style={styles.photo} /><TouchableOpacity style={styles.removePhoto} onPress={() => setDraft(current => ({ ...current, images: current.images.filter((_, i) => i !== photoIndex) }))}><Text>×</Text></TouchableOpacity></View>)}</View>
          {!entry.isBlank && <TouchableOpacity onPress={remove} style={styles.delete}><Text style={styles.deleteText}>Delete this page</Text></TouchableOpacity>}
        </ScrollView>
      </DiaryPage> : <ReaderPage entry={entry} pageNumber={pageNumber} />}
      {transition && <PageTurn direction={transition.direction} from={<ReaderPage entry={transition.from} pageNumber={Number(transition.from.date.slice(-2))} compact />} to={<ReaderPage entry={transition.to} pageNumber={Number(transition.to.date.slice(-2))} compact />} onFinished={() => { setSelectedDate(transition.nextDay); setTransition(null); }} />}
    </View>
    {!editing && <View style={styles.navigation}>
      <TouchableOpacity onPress={() => turn(-1)} style={styles.turnButton} accessibilityLabel="Previous diary day"><Ionicons name="arrow-back" size={17} color={colors.brown} /><Text style={styles.turnText}>Previous</Text></TouchableOpacity>
      <Text style={styles.position}>{displayDate(selectedDate, { month: 'short', day: 'numeric' })}</Text>
      <TouchableOpacity onPress={() => turn(1)} disabled={selectedDate >= tomorrow} style={[styles.turnButton, selectedDate >= tomorrow && styles.disabled]} accessibilityLabel="Next diary day"><Text style={styles.turnText}>Next</Text><Ionicons name="arrow-forward" size={17} color={colors.brown} /></TouchableOpacity>
    </View>}
  </SafeAreaView>;
}

function ReaderPage({ entry, pageNumber, compact = false }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  if (!entry.isLocked) return <DiaryPage entry={entry} pageNumber={pageNumber} compact={compact} />;
  const zone = dayAccess(entry.date).timeZone;
  return <DiaryPage entry={entry} pageNumber={pageNumber} editing>
    <View style={styles.lockedPage}>
      <View style={styles.lockCircle}><Ionicons name="lock-closed-outline" size={32} color={colors.brown} /></View>
      <Text style={styles.lockTitle}>Tomorrow’s page</Text>
      <Text style={styles.lockBody}>A new day is waiting for you.</Text>
      <Text style={styles.unlockTime}>Opens at 12:00 AM</Text>
      <Text style={styles.lockZone}>{zone}</Text>
    </View>
  </DiaryPage>;
}

const createStyles = colors => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { height: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 17 },
  headerAction: { minWidth: 45, padding: 8 },
  headerTitle: { fontFamily: fonts.display, fontSize: 27, color: colors.brown },
  editLabel: { fontFamily: fonts.body, color: colors.brown, fontWeight: '700', textAlign: 'right' },
  pageWrap: { flex: 1, marginHorizontal: 17, marginBottom: 8 },
  lockedPage: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, paddingBottom: 70 },
  lockCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.canvas, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  lockTitle: { fontFamily: fonts.accent, fontSize: 28, color: colors.brown, marginTop: 22 },
  lockBody: { fontFamily: fonts.body, color: colors.muted, fontSize: 14, marginTop: 8, textAlign: 'center' },
  unlockTime: { fontFamily: fonts.body, color: colors.ink, fontWeight: '700', fontSize: 15, marginTop: 28 },
  lockZone: { fontFamily: fonts.body, color: colors.muted, fontSize: 12, marginTop: 5 },
  navigation: { height: 58, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  turnButton: { flexDirection: 'row', alignItems: 'center', gap: 7, padding: 9, minWidth: 90 },
  disabled: { opacity: 0.3 }, turnText: { fontFamily: fonts.body, color: colors.brown, fontWeight: '700', fontSize: 13 },
  position: { fontFamily: fonts.body, color: colors.muted, fontSize: 12 },
  titleInput: { fontFamily: fonts.accent, fontSize: 20, color: colors.ink, paddingVertical: 7 },
  moodRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 2, marginBottom: 6 }, moodLabel: { fontFamily: fonts.body, color: colors.muted, fontSize: 9, fontWeight: '700', letterSpacing: 1, marginRight: 2 }, moodChip: { width: 29, height: 29, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center' }, moodChipSelected: { backgroundColor: colors.brown, borderColor: colors.brown }, moodSymbol: { fontFamily: fonts.body, color: colors.brown, fontSize: 16 }, moodSymbolSelected: { color: colors.white },
  bodyInput: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 28, minHeight: 170, paddingTop: 12 },
  photoPicker: { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 12, paddingVertical: 10, marginTop: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.paperEdge, borderRadius: 10, backgroundColor: colors.soft },
  addPhoto: { fontFamily: fonts.body, color: colors.brown, fontWeight: '700', fontSize: 12 },
  photos: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, photoWrap: { position: 'relative' },
  photo: { width: 90, height: 90, borderRadius: 5 },
  removePhoto: { position: 'absolute', right: 2, top: 2, borderRadius: 12, backgroundColor: colors.paper, width: 24, height: 24, alignItems: 'center' },
  delete: { alignSelf: 'center', marginTop: 30, padding: 10 }, deleteText: { color: '#A05E5B', fontSize: 13 },
  back: { padding: 20 }, backText: { color: colors.brown }, loading: { textAlign: 'center', color: colors.muted, marginTop: 50 },
});

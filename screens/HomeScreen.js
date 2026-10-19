import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, PanResponder, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import DiaryPage from '../components/DiaryPage';
import PageTurn from '../components/PageTurn';
import { addDays, dayAccess, listJournals, saveJournal } from '../lib/diary';
import { persistImage } from '../lib/media';
import useLocalDay from '../lib/useLocalDay';
import { colors, fonts } from '../theme';

export default function HomeScreen({ navigation }) {
  const today = useLocalDay();
  const [date, setDate] = useState(today);
  const [entries, setEntries] = useState([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [saved, setSaved] = useState(true);
  const [turning, setTurning] = useState(false);
  const [turnTarget, setTurnTarget] = useState(null);
  const dirtyRef = useRef(false);
  const swipeStart = useRef(null);

  useFocusEffect(useCallback(() => {
    if (dirtyRef.current) return undefined;
    let active = true;
    listJournals().then(entries => {
      if (!active || dirtyRef.current) return;
      const entry = entries.find(item => item.date === today);
      setEntries(entries);
      setDate(today);
      setTitle(entry?.title || '');
      setText(entry?.text || '');
      setImages(entry?.images || []);
      setSaved(true);
      dirtyRef.current = false;
      setTurning(false);
    }).catch(() => Alert.alert('Could not open your diary', 'Please try again.'));
    return () => { active = false; };
  }, [today]));

  const entry = { date, title, text, images };
  const markDirty = () => { dirtyRef.current = true; setSaved(false); };
  const save = async () => {
    if (!title.trim() || !text.trim()) {
      Alert.alert('Finish this page', 'Add a title and a few words before saving.');
      return false;
    }
    try {
      await saveJournal(entry);
      setEntries(current => [...current.filter(item => item.date !== date), entry].sort((a, b) => b.date.localeCompare(a.date)));
      dirtyRef.current = false;
      setSaved(true);
      return true;
    } catch {
      Alert.alert('Could not save', 'Your entry is still on this screen. Please try again.');
      return false;
    }
  };

  const openDiary = () => {
    const go = () => setTurning(true);
    if (saved || (!title && !text && images.length === 0)) return go();
    Alert.alert('Save this page?', 'Your diary has unsaved changes.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Discard changes', style: 'destructive', onPress: () => { dirtyRef.current = false; go(); } },
      { text: 'Save and turn', onPress: async () => { if (await save()) go(); } },
    ]);
  };

  const openDay = (target) => {
    if (target > addDays(today, 1) || turning || turnTarget) return;
    const go = () => setTurnTarget(target);
    if (saved || (!title && !text && images.length === 0)) return go();
    Alert.alert('Save this page?', 'Your diary has unsaved changes.', [
      { text: 'Keep writing', style: 'cancel' },
      { text: 'Discard changes', style: 'destructive', onPress: () => { dirtyRef.current = false; go(); } },
      { text: 'Save and turn', onPress: async () => { if (await save()) go(); } },
    ]);
  };
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, gesture) => Math.abs(gesture.dx) > 30 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.5,
    onPanResponderRelease: (_, gesture) => {
      if (gesture.dx < -70) openDay(addDays(date, 1));
      if (gesture.dx > 70) openDay(addDays(date, -1));
    },
  }), [date, openDay]);
  const swipePoint = event => {
    const touch = event.nativeEvent.changedTouches?.[0] || event.nativeEvent;
    return { x: touch.pageX ?? touch.clientX, y: touch.pageY ?? touch.clientY };
  };
  const beginSwipe = event => { swipeStart.current = swipePoint(event); };
  const endSwipe = event => {
    if (!swipeStart.current) return;
    const end = swipePoint(event);
    const dx = end.x - swipeStart.current.x;
    const dy = end.y - swipeStart.current.y;
    swipeStart.current = null;
    if (Math.abs(dx) < 55 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
    openDay(addDays(date, dx < 0 ? 1 : -1));
  };
  const targetEntry = turnTarget && (turnTarget > today
    ? { date: turnTarget, title: 'Tomorrow’s page', text: `Locked until 12:00 AM · ${dayAccess(turnTarget).timeZone}`, images: [] }
    : entries.find(item => item.date === turnTarget) || { date: turnTarget, title: 'An unwritten day', text: 'A fresh page for your thoughts.', images: [] });

  const addPhoto = async (camera) => {
    if (Platform.OS !== 'web') {
      const permission = camera ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Photo permission needed', 'Allow access in your device settings to add a photo.');
        return;
      }
    }
    try {
      const result = camera
        ? await ImagePicker.launchCameraAsync({ quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: Platform.OS === 'web' });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const asset = result.assets[0];
        const permanentUri = Platform.OS === 'web' && asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : persistImage(asset.uri);
        setImages(current => [...current, permanentUri]);
        markDirty();
      }
    } catch {
      Alert.alert('Could not add photo', 'Please try again.');
    }
  };

  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}>
      <View><Text style={styles.brand}>Aurora</Text><Text style={styles.subtitle}>A place for your little moments</Text></View>
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open diary" onPress={openDiary} style={styles.headerButton}><Text style={styles.headerButtonText}>My pages ›</Text></TouchableOpacity>
    </View>
    <KeyboardAvoidingView style={styles.content} behavior={Platform.OS === 'ios' ? 'padding' : undefined} {...(Platform.OS !== 'web' ? responder.panHandlers : { onMouseDown: beginSwipe, onMouseUp: endSwipe, onTouchStart: beginSwipe, onTouchEnd: endSwipe })}>
      <DiaryPage entry={entry} pageNumber={1} editing>
        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TextInput style={styles.titleInput} placeholder="Give this day a title..." placeholderTextColor={colors.muted} value={title} onChangeText={value => { setTitle(value); markDirty(); }} maxLength={80} accessibilityLabel="Journal title" />
          <TextInput style={styles.bodyInput} placeholder="Dear diary, today..." placeholderTextColor={colors.muted} value={text} onChangeText={value => { setText(value); markDirty(); }} multiline textAlignVertical="top" accessibilityLabel="Journal entry" />
          <View style={styles.photoHeader}><Text style={styles.sectionLabel}>LITTLE MOMENTS</Text>{Platform.OS !== 'web' && <TouchableOpacity onPress={() => addPhoto(true)} accessibilityLabel="Take a photo" style={styles.cameraButton}><Ionicons name="camera-outline" size={19} color={colors.brown} /></TouchableOpacity>}</View>
          <TouchableOpacity onPress={() => addPhoto(false)} accessibilityRole="button" accessibilityLabel="Choose a diary photo" style={styles.photoPicker}><Ionicons name="images-outline" size={22} color={colors.brown} /><View style={{ flex: 1 }}><Text style={styles.photoPickerTitle}>{images.length ? 'Add another memory' : 'Add a photo to this day'}</Text><Text style={styles.photoPickerSub}>A little picture makes the page yours</Text></View><Ionicons name="add" size={20} color={colors.brown} /></TouchableOpacity>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {images.map((uri, index) => <View key={`${uri}-${index}`} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.photo} />
              <TouchableOpacity accessibilityLabel={`Remove photo ${index + 1}`} onPress={() => { setImages(current => current.filter((_, i) => i !== index)); markDirty(); }} style={styles.remove}><Text style={{ color: colors.ink }}>×</Text></TouchableOpacity>
            </View>)}
          </ScrollView>
        </ScrollView>
      </DiaryPage>
      {turning && <PageTurn from={<DiaryPage entry={entry} pageNumber={1} compact />} to={<DiaryPage entry={{ date, title: 'My diary', text: 'Every day has a story.', images: [] }} pageNumber={2} compact />} onFinished={() => { setTurning(false); navigation.navigate('Diary'); }} />}
      {turnTarget && <PageTurn direction={turnTarget > date ? 'forward' : 'backward'} from={<DiaryPage entry={entry} pageNumber={Number(date.slice(-2))} compact />} to={<DiaryPage entry={targetEntry} pageNumber={Number(turnTarget.slice(-2))} compact />} onFinished={() => { const target = turnTarget; setTurnTarget(null); navigation.navigate('JournalDetail', { date: target }); }} />}
    </KeyboardAvoidingView>
    <View style={styles.dayNavigation}>
      <TouchableOpacity onPress={() => openDay(addDays(date, -1))} accessibilityRole="button" accessibilityLabel="Previous diary day"><Text style={styles.dayNavText}>← Previous day</Text></TouchableOpacity>
      <View style={styles.pageDots}><View style={styles.pageDot} /><View style={[styles.pageDot, styles.pageDotCurrent]} /><View style={styles.pageDot} /></View>
      <TouchableOpacity onPress={() => openDay(addDays(date, 1))} accessibilityRole="button" accessibilityLabel="Next diary day"><Text style={styles.dayNavText}>Tomorrow <Ionicons name="lock-closed-outline" size={12} color={colors.brown} /> →</Text></TouchableOpacity>
    </View>
    <View style={styles.actions}>
      <Text style={styles.saveState}>{saved ? 'Your page is up to date' : 'Unsaved changes'}</Text>
      <TouchableOpacity style={styles.saveButton} onPress={save} accessibilityRole="button"><Text style={styles.saveButtonText}>Save this page</Text></TouchableOpacity>
    </View>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  header: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 13, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.display, fontSize: 39, color: colors.brown, lineHeight: 43 },
  subtitle: { fontFamily: fonts.body, color: colors.muted, fontSize: 11, letterSpacing: 0.4 },
  headerButton: { padding: 10 }, headerButtonText: { fontFamily: fonts.body, color: colors.brown, fontWeight: '700', fontSize: 13 },
  content: { flex: 1, marginHorizontal: 17, marginBottom: 5 },
  titleInput: { fontFamily: fonts.accent, fontSize: 20, color: colors.ink, paddingVertical: 7 },
  bodyInput: { fontFamily: fonts.body, color: colors.ink, fontSize: 16, lineHeight: 28, minHeight: 150, paddingTop: 13 },
  photoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: colors.line, paddingTop: 16 },
  sectionLabel: { fontFamily: fonts.body, color: colors.muted, fontSize: 10, fontWeight: '700', letterSpacing: 1.6 },
  cameraButton: { padding: 4 },
  photoPicker: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderStyle: 'dashed', borderColor: '#D7B9AA', borderRadius: 11, paddingHorizontal: 13, paddingVertical: 11, backgroundColor: '#F8F0E8', marginTop: 12 },
  photoPickerTitle: { fontFamily: fonts.body, color: colors.ink, fontSize: 12, fontWeight: '700' },
  photoPickerSub: { fontFamily: fonts.body, color: colors.muted, fontSize: 10, marginTop: 2 },
  photoWrap: { marginRight: 10 }, photo: { width: 95, height: 105, borderWidth: 5, borderColor: colors.white, borderRadius: 3 },
  remove: { position: 'absolute', right: 3, top: 3, backgroundColor: colors.paper, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  actions: { paddingHorizontal: 20, paddingTop: 7, paddingBottom: 8 },
  dayNavigation: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 19, paddingTop: 4 },
  dayNavText: { fontFamily: fonts.body, color: colors.brown, fontSize: 12, fontWeight: '700', paddingVertical: 8 },
  pageDots: { flexDirection: 'row', gap: 5, alignItems: 'center' }, pageDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#CCBFB4' }, pageDotCurrent: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.brown },
  saveState: { fontFamily: fonts.body, color: colors.muted, textAlign: 'center', fontSize: 11, marginBottom: 6 },
  saveButton: { backgroundColor: colors.brown, borderRadius: 14, alignItems: 'center', paddingVertical: 14 },
  saveButtonText: { color: colors.white, fontFamily: fonts.accent, fontSize: 17 },
});

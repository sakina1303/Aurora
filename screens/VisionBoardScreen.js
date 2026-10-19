import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, PanResponder, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { boardItems, emptyVision, loadVision, nextPeriodKey, periodKey, periodLabel, saveVision } from '../lib/vision';
import useLocalDay from '../lib/useLocalDay';
import { persistImage } from '../lib/media';
import { colors, fonts } from '../theme';

function BoardItem({ item, bounds, onMove, onPress, onToggle }) {
  const pan = useRef(new Animated.ValueXY()).current;
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => false,
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) + Math.abs(gesture.dy) > 8,
    onPanResponderMove: (_, gesture) => pan.setValue({ x: gesture.dx, y: gesture.dy }),
    onPanResponderRelease: (_, gesture) => {
      const x = Math.max(0, Math.min(item.x + gesture.dx, Math.max(0, bounds.width - item.width)));
      const y = Math.max(0, Math.min(item.y + gesture.dy, Math.max(0, bounds.height - item.height)));
      pan.setValue({ x: 0, y: 0 });
      onMove(item.id, x, y);
    },
    onPanResponderTerminate: () => pan.setValue({ x: 0, y: 0 }),
  }), [item.id, item.x, item.y, item.width, item.height, bounds.width, bounds.height, onMove, pan]);
  return <Animated.View {...responder.panHandlers} style={[styles.item, { left: item.x, top: item.y, width: item.width, height: item.height, transform: pan.getTranslateTransform() }]}>
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9} style={{ flex: 1 }} accessibilityRole="button" accessibilityLabel={item.type === 'image' ? 'Board photo options' : 'Edit board note'}>
      {item.type === 'image' ? <View style={styles.imageFrame}><Image source={{ uri: item.uri }} style={styles.boardImage} />{item.done && <LinearGradient colors={['#EAF5E566', '#9BC9A48C']} style={styles.imageDoneOverlay} />}</View> : <LinearGradient colors={item.done ? ['#EDF7E8', '#D5EACC', '#B8D8BA'] : ['#FAEEDD', '#F5E1D0']} style={styles.note}><Text style={styles.noteText}>{item.text || 'Tap to write a thought'}</Text></LinearGradient>}
    </TouchableOpacity>
    <TouchableOpacity onPress={() => onToggle(item.id)} style={[styles.checkButton, item.done && styles.checkButtonDone]} accessibilityRole="button" accessibilityLabel={item.done ? 'Mark intention pending' : 'Mark intention done'}><Ionicons name={item.done ? 'checkmark' : 'ellipse-outline'} size={17} color={item.done ? colors.white : colors.brown} /></TouchableOpacity>
    {item.movedTo && !item.done && <Text style={styles.movedTag}>MOVED</Text>}
  </Animated.View>;
}

export default function VisionBoardScreen({ route, navigation }) {
  const today = useLocalDay();
  const [selected, setSelected] = useState('Monthly');
  const [period, setPeriod] = useState(periodKey('Monthly', today));
  const [vision, setVision] = useState(emptyVision);
  const visionRef = useRef(emptyVision());
  const writeQueue = useRef(Promise.resolve());
  const [bounds, setBounds] = useState({ width: 300, height: 420 });
  const [editing, setEditing] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const lastToday = useRef(today);
  useFocusEffect(useCallback(() => {
    let active = true;
    if (route.params?.kind && route.params?.period) {
      setSelected(route.params.kind);
      setPeriod(route.params.period);
      navigation.setParams({ kind: undefined, period: undefined });
    }
    writeQueue.current.then(loadVision).then(value => { if (active) { visionRef.current = value; setVision(value); } }).catch(() => { if (active) Alert.alert('Could not load boards', 'Please try again.'); });
    return () => { active = false; };
  }, [navigation, route.params?.kind, route.params?.period]));
  React.useEffect(() => {
    if (lastToday.current !== today && period === periodKey(selected, lastToday.current)) setPeriod(periodKey(selected, today));
    lastToday.current = today;
  }, [today, selected, period]);
  const commit = useCallback((next) => {
    visionRef.current = next;
    setVision(next);
    writeQueue.current = writeQueue.current.catch(() => {}).then(() => saveVision(next)).catch(() => Alert.alert('Could not save board', 'Please try again.'));
  }, []);
  const updateSelected = useCallback((items) => {
    const current = visionRef.current;
    commit({ ...current, periods: { ...current.periods, [selected]: { ...current.periods[selected], [period]: items } } });
  }, [commit, selected, period]);
  const items = boardItems(vision, selected, period);
  const doneCount = items.filter(item => item.done).length;
  const availablePeriods = [...new Set([...Object.keys(vision.periods?.[selected] || {}), periodKey(selected, today)])].sort();
  const previous = availablePeriods.filter(key => key < period).at(-1);
  const next = availablePeriods.find(key => key > period);
  const move = useCallback((id, x, y) => updateSelected(boardItems(visionRef.current, selected, period).map(item => item.id === id ? { ...item, x, y } : item)), [selected, period, updateSelected]);
  const toggle = useCallback(id => updateSelected(boardItems(visionRef.current, selected, period).map(item => item.id === id ? { ...item, done: !item.done, completedAt: item.done ? null : new Date().toISOString() } : item)), [selected, period, updateSelected]);
  const chooseKind = kind => { setSelected(kind); setPeriod(periodKey(kind, today)); };
  const addItem = (type, uri = '') => {
    const count = items.length;
    const width = type === 'image' ? 142 : 185;
    const height = type === 'image' ? 158 : 112;
    const columnWidth = 205;
    const rowHeight = 180;
    const columns = Math.max(1, Math.floor((bounds.width - 30) / columnWidth));
    const x = Math.max(0, Math.min(Math.floor((bounds.width - columns * columnWidth) / 2) + (count % columns) * columnWidth + 10, bounds.width - width));
    const y = Math.min(72 + Math.floor(count / columns) * rowHeight, Math.max(0, bounds.height - height));
    const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, type, uri, text: '', done: false, x, y, width, height };
    if (type === 'text') { setEditing({ ...item, isNew: true }); setNoteText(''); }
    else updateSelected([...items, item]);
  };
  const addImage = async () => {
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return Alert.alert('Photo permission needed', 'Allow photo access in your device settings.');
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, base64: Platform.OS === 'web' });
      if (!result.canceled && result.assets?.[0]?.uri) {
        const asset = result.assets[0];
        addItem('image', Platform.OS === 'web' && asset.base64 ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}` : persistImage(asset.uri));
      }
    } catch { Alert.alert('Could not add image', 'Please try again.'); }
  };
  const openItem = item => {
    setEditing(item);
    setNoteText(item.text || '');
    setConfirmDelete(false);
  };
  const saveNote = () => {
    if (!noteText.trim()) return;
    const current = boardItems(visionRef.current, selected, period);
    if (editing.isNew) {
      const { isNew, ...item } = editing;
      updateSelected([...current, { ...item, text: noteText.trim() }]);
    } else updateSelected(current.map(item => item.id === editing.id ? { ...item, text: noteText.trim() } : item));
    setEditing(null);
  };
  const deleteItem = () => { if (!editing.isNew) updateSelected(boardItems(visionRef.current, selected, period).filter(item => item.id !== editing.id)); setEditing(null); setConfirmDelete(false); };
  const moveToNext = () => {
    if (!editing || editing.isNew || editing.movedTo) return;
    const target = nextPeriodKey(selected, period);
    const current = visionRef.current;
    const sourceItems = boardItems(current, selected, period).map(item => item.id === editing.id ? { ...item, movedTo: target } : item);
    const targetItems = boardItems(current, selected, target);
    const copy = { ...editing, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, done: false, completedAt: null, movedFrom: period, movedTo: null };
    commit({ ...current, periods: { ...current.periods, [selected]: { ...current.periods[selected], [period]: sourceItems, [target]: [...targetItems, copy] } } });
    setEditing(null);
  };

  return <SafeAreaView style={styles.screen}>
    <View style={styles.header}><Text style={styles.kicker}>DREAM IT. SEE IT.</Text><Text style={styles.title}>Vision board</Text><Text style={styles.intro}>A little space for the things you're growing toward.</Text></View>
    <View style={styles.tabs}>{['Monthly', 'Yearly'].map(name => <TouchableOpacity key={name} style={[styles.tab, selected === name && styles.tabActive]} onPress={() => chooseKind(name)} accessibilityRole="button" accessibilityLabel={`${name} vision board`}><Text style={[styles.tabText, selected === name && styles.tabTextActive]}>{name}</Text></TouchableOpacity>)}</View>
    <View style={styles.periodBar}>
      <TouchableOpacity onPress={() => previous && setPeriod(previous)} disabled={!previous} accessibilityRole="button" accessibilityLabel="Previous vision board" style={[styles.periodArrow, !previous && styles.faded]}><Ionicons name="chevron-back" size={18} color={colors.brown} /></TouchableOpacity>
      <View style={styles.periodMiddle}><Text style={styles.periodName}>{periodLabel(selected, period)}</Text><Text style={styles.periodSummary}>{items.length} intention{items.length === 1 ? '' : 's'} · {doneCount} done</Text></View>
      <TouchableOpacity onPress={() => next && setPeriod(next)} disabled={!next} accessibilityRole="button" accessibilityLabel="Next vision board" style={[styles.periodArrow, !next && styles.faded]}><Ionicons name="chevron-forward" size={18} color={colors.brown} /></TouchableOpacity>
    </View>
    <View style={styles.canvasOuter}><View style={styles.canvas} onLayout={event => setBounds({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height })}>
      <View pointerEvents="none" style={styles.canvasRule} /><Text style={styles.canvasLabel}>{selected.toUpperCase()} INTENTIONS · {period}</Text>
      {!items.length && <View style={styles.empty}><View style={styles.emptySeal}><Ionicons name="sparkles-outline" size={30} color={colors.brown} /></View><Text style={styles.emptyTitle}>The beginning of anything</Text><Text style={styles.emptyText}>A space for the wishes you're ready to grow.</Text></View>}
      {items.map(item => <BoardItem key={item.id} item={item} bounds={bounds} onMove={move} onPress={openItem} onToggle={toggle} />)}
    </View></View>
    <TouchableOpacity onPress={() => navigation.navigate('Diary')} style={styles.historyLink} accessibilityRole="button" accessibilityLabel="Open vision board history"><Ionicons name="albums-outline" size={16} color={colors.brown} /><Text style={styles.historyText}>Past boards live in Diary history</Text><Ionicons name="arrow-forward" size={15} color={colors.brown} /></TouchableOpacity>
    <View style={styles.actions}><TouchableOpacity style={styles.action} onPress={() => addItem('text')}><Ionicons name="create-outline" size={18} color={colors.brown} /><Text style={styles.actionText}>Add note</Text></TouchableOpacity><TouchableOpacity style={[styles.action, styles.imageAction]} onPress={addImage}><Ionicons name="image-outline" size={18} color={colors.white} /><Text style={[styles.actionText, { color: colors.white }]}>Add image</Text></TouchableOpacity></View>
    <Modal visible={!!editing} transparent animationType="fade" onRequestClose={() => setEditing(null)}><View style={styles.modalShade}><View style={styles.modal}>
      <Text style={styles.modalTitle}>{editing?.type === 'image' ? 'A moment to keep' : 'A thought to keep'}</Text>
      {editing?.type === 'image' ? <Image source={{ uri: editing.uri }} style={styles.modalPhoto} /> : <TextInput style={styles.modalInput} value={noteText} onChangeText={setNoteText} multiline placeholder="Write an intention or affirmation..." placeholderTextColor={colors.muted} autoFocus />}
      {!editing?.isNew && <View style={styles.modalTools}><TouchableOpacity onPress={() => { toggle(editing.id); setEditing(current => ({ ...current, done: !current.done })); }} style={[styles.toolButton, editing?.done && styles.toolDone]}><Ionicons name={editing?.done ? 'checkmark-circle' : 'ellipse-outline'} size={18} color={colors.brown} /><Text style={styles.toolText}>{editing?.done ? 'Done · tap to undo' : 'Mark done'}</Text></TouchableOpacity><TouchableOpacity onPress={moveToNext} disabled={!!editing?.movedTo} style={[styles.toolButton, !!editing?.movedTo && styles.faded]}><Ionicons name="arrow-forward-circle-outline" size={18} color={colors.brown} /><Text style={styles.toolText}>{editing?.movedTo ? `Moved to ${periodLabel(selected, editing.movedTo)}` : 'Move to next'}</Text></TouchableOpacity></View>}
      {confirmDelete && <Text style={styles.confirmPrompt}>Delete this intention from this board?</Text>}
      <View style={styles.modalActions}>{!editing?.isNew && <TouchableOpacity onPress={() => confirmDelete ? deleteItem() : setConfirmDelete(true)}><Text style={styles.deleteText}>{confirmDelete ? 'Confirm delete' : 'Delete'}</Text></TouchableOpacity>}<View style={{ flex: 1 }} /><TouchableOpacity onPress={() => { setEditing(null); setConfirmDelete(false); }}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>{editing?.type === 'text' && <TouchableOpacity onPress={saveNote}><Text style={styles.saveText}>Save</Text></TouchableOpacity>}</View>
    </View></View></Modal>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas }, header: { paddingHorizontal: 24, paddingTop: 14 },
  kicker: { fontFamily: fonts.body, color: colors.muted, letterSpacing: 2.2, fontSize: 10, fontWeight: '700' }, title: { fontFamily: fonts.display, fontSize: 43, color: colors.brown, marginTop: 4 }, intro: { fontFamily: fonts.body, color: colors.muted, fontSize: 13 },
  tabs: { flexDirection: 'row', backgroundColor: '#EEE7DD', borderRadius: 12, padding: 4, marginHorizontal: 20, marginTop: 16 }, tab: { flex: 1, alignItems: 'center', padding: 9, borderRadius: 9 }, tabActive: { backgroundColor: colors.paper }, tabText: { color: colors.muted, fontFamily: fonts.body, fontWeight: '700', fontSize: 13 }, tabTextActive: { color: colors.brown },
  periodBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 14, paddingHorizontal: 8 }, periodArrow: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' }, periodMiddle: { flex: 1, alignItems: 'center' }, periodName: { fontFamily: fonts.accent, color: colors.brown, fontSize: 20 }, periodSummary: { fontFamily: fonts.body, color: colors.muted, fontSize: 11, marginTop: 2 }, faded: { opacity: 0.32 },
  canvasOuter: { flex: 1, marginHorizontal: 20, marginTop: 13, marginBottom: 8, backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.paperEdge, borderRadius: 12, shadowColor: '#59483E', shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  canvas: { flex: 1, backgroundColor: '#FFF9F2' }, canvasRule: { position: 'absolute', top: 44, left: 17, right: 17, height: 1, backgroundColor: colors.line }, canvasLabel: { position: 'absolute', top: 15, left: 17, fontFamily: fonts.body, fontSize: 10, letterSpacing: 1.5, color: colors.muted },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 }, emptySeal: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#F5E9DE', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.paperEdge }, emptyTitle: { fontFamily: fonts.display, fontSize: 29, color: colors.brown, marginTop: 17, textAlign: 'center' }, emptyText: { fontFamily: fonts.body, color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: 6 },
  item: { position: 'absolute', shadowColor: '#463B33', shadowOpacity: 0.16, shadowRadius: 5, shadowOffset: { width: 1, height: 3 }, elevation: 3 }, imageFrame: { flex: 1, position: 'relative' }, boardImage: { width: '100%', height: '100%', borderWidth: 5, borderColor: colors.white, borderRadius: 4 }, imageDoneOverlay: { position: 'absolute', top: 5, left: 5, right: 5, bottom: 5, borderRadius: 2 }, note: { flex: 1, padding: 12, justifyContent: 'center', borderRadius: 5, transform: [{ rotate: '-2deg' }] }, noteText: { fontFamily: fonts.display, fontSize: 20, textAlign: 'center', color: colors.ink }, checkButton: { position: 'absolute', right: -7, top: -7, width: 31, height: 31, borderRadius: 16, backgroundColor: colors.paper, borderColor: colors.paperEdge, borderWidth: 1, alignItems: 'center', justifyContent: 'center', elevation: 5 }, checkButtonDone: { backgroundColor: '#6F9D79', borderColor: '#6F9D79' }, movedTag: { position: 'absolute', bottom: 4, left: 5, color: colors.brown, backgroundColor: '#FFF9ECCC', fontFamily: fonts.body, fontSize: 8, letterSpacing: 1, paddingHorizontal: 5 },
  historyLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginHorizontal: 20, paddingVertical: 7 }, historyText: { color: colors.brown, fontFamily: fonts.body, fontSize: 12 },
  actions: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 10, gap: 10 }, action: { flex: 1, flexDirection: 'row', gap: 7, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDE3D7', borderRadius: 11, height: 47 }, imageAction: { backgroundColor: colors.brown }, actionText: { fontFamily: fonts.body, color: colors.brown, fontWeight: '700', fontSize: 13 },
  modalShade: { flex: 1, backgroundColor: '#0007', justifyContent: 'center', padding: 25 }, modal: { backgroundColor: colors.paper, borderRadius: 16, padding: 21 }, modalTitle: { fontFamily: fonts.display, fontSize: 29, color: colors.brown }, modalInput: { color: colors.ink, fontFamily: fonts.body, borderWidth: 1, borderColor: colors.line, borderRadius: 10, padding: 12, minHeight: 110, textAlignVertical: 'top', marginTop: 13 }, modalPhoto: { width: '100%', height: 190, borderRadius: 8, marginTop: 13 }, modalTools: { gap: 9, marginTop: 16 }, toolButton: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 9, borderWidth: 1, borderColor: colors.line, padding: 10 }, toolDone: { backgroundColor: '#E7F2E3' }, toolText: { color: colors.brown, fontFamily: fonts.body, fontSize: 13 }, confirmPrompt: { color: '#A05E5B', fontFamily: fonts.body, fontSize: 12, marginTop: 14 }, modalActions: { flexDirection: 'row', gap: 20, marginTop: 20 }, deleteText: { color: '#A05E5B', fontFamily: fonts.body, fontWeight: '700' }, cancelText: { color: colors.muted, fontFamily: fonts.body, fontWeight: '700' }, saveText: { color: colors.brown, fontFamily: fonts.body, fontWeight: '700' },
});

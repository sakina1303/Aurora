import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ConfettiCannon from "react-native-confetti-cannon";
import { Ionicons } from "@expo/vector-icons";

export default function StreaksScreen() {
  const [habit, setHabit] = useState("");
  const [habits, setHabits] = useState([]);
  const [nextId, setNextId] = useState(1);

  const [editingHabit, setEditingHabit] = useState(null);
  const [editedName, setEditedName] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const confettiRef = useRef(null);

  // 🟣 STREAK BREAK LOGIC – everyday auto check
  useEffect(() => {
    const today = new Date().toDateString();

    setHabits((prev) =>
      prev.map((h) => {
        if (!h.lastCompleted) return h;

        const last = new Date(h.lastCompleted).toDateString();

        if (
          last !== today &&
          last !== new Date(Date.now() - 86400000).toDateString()
        ) {
          return { ...h, streak: 0 };
        }
        return h;
      })
    );
  }, []);

  // 🟣 Add habit with validation
  const addHabit = () => {
    if (!habit.trim()) {
      setErrorMsg("Please enter a habit name.");
      setTimeout(() => setErrorMsg(""), 2000);
      return;
    }

    const newHabit = {
      id: nextId,
      name: habit.trim(),
      streak: 0,
      lastCompleted: null,
    };

    setHabits([...habits, newHabit]);
    setHabit("");
    setNextId(nextId + 1);
  };

  // 🟣 Mark Done (only once per day) + Confetti
  const markDone = (id) => {
    const today = new Date().toDateString();

    setHabits((prev) =>
      [...prev]
        .map((h) => {
          if (h.id === id) {
            if (h.lastCompleted === today) return h;
            return { ...h, streak: h.streak + 1, lastCompleted: today };
          }
          return h;
        })
        .sort((a, b) => b.streak - a.streak)
    );

    confettiRef.current.start();
  };

  // 🟣 Undo Done
  const undoDone = (id) => {
    const today = new Date().toDateString();

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id && h.lastCompleted === today && h.streak > 0) {
          return { ...h, streak: h.streak - 1, lastCompleted: null };
        }
        return h;
      })
    );
  };

  // 🟣 Start Edit
  const startEditing = (habit) => {
    setEditingHabit(habit);
    setEditedName(habit.name);
  };

  // 🟣 Save Edit
  const saveEdit = () => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === editingHabit.id ? { ...h, name: editedName } : h
      )
    );
    setEditingHabit(null);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ConfettiCannon
        ref={confettiRef}
        fadeOut
        autoStart={false}
        count={120}
        explosionSpeed={600}
        origin={{ x: 200, y: -20 }}
      />

      <Text style={styles.title}>Streaks</Text>

      {/* Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter habit..."
        value={habit}
        onChangeText={setHabit}
      />

      {/* Error Message */}
      {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

      {/* Add Habit Button */}
      <TouchableOpacity style={styles.addButton} onPress={addHabit}>
        <Text style={styles.addButtonText}>Add Habit</Text>
      </TouchableOpacity>

      {/* Habit List */}
      <ScrollView style={{ flex: 1 }}>
        {habits.map((h) => (
          <View key={h.id} style={styles.habitCard}>
            <Text style={styles.habitName}>{h.name}</Text>

            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
              <Ionicons name="flame" size={22} color="#ff7a00" style={{ marginRight: 6 }} />
              <Text style={styles.streak}>{h.streak} day streak</Text>
            </View>

            {/* LEFT ALIGNED BUTTONS */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.doneBtn} onPress={() => markDone(h.id)}>
                <Text style={styles.doneText}>Done</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.undoBtn} onPress={() => undoDone(h.id)}>
                <Text style={styles.undoText}>Undo</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editBtn} onPress={() => startEditing(h)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => setHabits(habits.filter((x) => x.id !== h.id))}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={!!editingHabit} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Edit Habit</Text>

            <TextInput
              style={styles.editInput}
              value={editedName}
              onChangeText={setEditedName}
            />

            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setEditingHabit(null)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff9f3" },

  title: {
    fontSize: 40,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
    color: "#6f5d4d",
    fontFamily: "DancingScript-Regular",
  },

  input: {
    borderWidth: 1,
    borderColor: "#d2c5b0",
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },

  error: {
    color: "red",
    textAlign: "center",
    marginTop: 5,
    fontSize: 14,
  },

  addButton: {
    backgroundColor: "#6f5d4d",
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignSelf: "center",
    borderRadius: 15,
    marginTop: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },

  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "Lobster-Regular",
  },

  habitCard: {
    backgroundColor: "#ffffffd9",
    margin: 15,
    padding: 20,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  habitName: {
    fontSize: 22,
    color: "#6f5d4d",
    fontFamily: "DancingScript-Regular",
  },

  streak: {
    fontSize: 18,
    color: "#c7b49c",
    fontFamily: "Lobster-Regular",
  },

  actions: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },

  doneBtn: {
    backgroundColor: "#c7b49c",
    padding: 8,
    borderRadius: 8,
  },

  undoBtn: {
    backgroundColor: "#e0a8a8",
    padding: 8,
    borderRadius: 8,
  },

  editBtn: {
    backgroundColor: "#8e7c68",
    padding: 8,
    borderRadius: 8,
  },

  deleteBtn: {
    backgroundColor: "#6f5d4d",
    padding: 8,
    borderRadius: 8,
  },

  doneText: { color: "#fff" },
  undoText: { color: "#fff" },
  editText: { color: "#fff" },
  deleteText: { color: "#fff" },

  modalBg: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000088",
  },

  modalBox: {
    margin: 30,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontFamily: "Lobster-Regular",
    marginBottom: 15,
    textAlign: "center",
  },

  editInput: {
    borderWidth: 1,
    borderColor: "#d2c5b0",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fff",
  },

  saveBtn: {
    backgroundColor: "#6f5d4d",
    padding: 10,
    borderRadius: 10,
    marginTop: 15,
  },

  saveText: { color: "#fff", textAlign: "center" },

  cancelBtn: {
    padding: 10,
    marginTop: 10,
  },

  cancelText: {
    textAlign: "center",
    color: "#6f5d4d",
  },
});

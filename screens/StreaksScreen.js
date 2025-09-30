import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function StreaksScreen() {
  const [habit, setHabit] = useState("");     // input se habit ka naam aayega
  const [habits, setHabits] = useState([]);   // array to store multiple habits
  const [nextId, setNextId] = useState(1);    // unique id for each habit

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9f3ff" }}>
      <View style={styles.header}>
        <Text style={styles.title}>Streaks</Text>
      </View>
      
      <View style={styles.container}>
        {/* Input box for habit */}
        <TextInput
          style={styles.input}
          placeholder="Enter your habit..."
          value={habit}
          onChangeText={setHabit}
        />

        {/* Button to save habit */}
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => {
            if (habit.trim()) {
              const newHabit = {
                id: nextId,
                name: habit.trim(),
                streak: 0,
                lastCompleted: null
              };
              setHabits([...habits, newHabit]);
              setHabit("");
              setNextId(nextId + 1);
            }
          }}
        >
          <Text style={styles.addButtonText}>Add Habit</Text>
        </TouchableOpacity>

        {/* Scrollable habits list */}
        <ScrollView 
          style={styles.habitsScrollView}
          contentContainerStyle={styles.habitsContainer}
          showsVerticalScrollIndicator={false}
        >
          {habits.map((habitItem) => (
            <View key={habitItem.id} style={styles.habitCard}>
              <Text style={styles.habit}>{habitItem.name}</Text>
              <Text style={styles.streak}>Streak: {habitItem.streak} days</Text>
              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={styles.markDoneButton} 
                  onPress={() => {
                    setHabits(habits.map(h => 
                      h.id === habitItem.id 
                        ? { ...h, streak: h.streak + 1, lastCompleted: new Date().toDateString() }
                        : h
                    ));
                  }}
                >
                  <Text style={styles.markDoneText}>Done</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => {
                    setHabits(habits.filter(h => h.id !== habitItem.id));
                  }}
                >
                  <Text style={styles.deleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    backgroundColor: "#fff9f3ff",
  },
  title: {
    fontSize: 36,
    color: "#85765eff",
    fontFamily: "DancingScript-Regular",
    textAlign: "center",
  },
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: "#fff9f3ff",
  },
  input: {
    borderColor: "#dcddb6ff",
    borderWidth: 1,
    padding: 15,
    width: "100%",
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    fontFamily: "Lobster-Regular",
    color: "#81745dff",
    fontSize: 16,
  },
  addButton: {
    backgroundColor: "#81745dff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
    marginBottom: 20,
  },
  habitsScrollView: {
    flex: 1,
  },
  habitsContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Lobster-Regular",
  },
  habitCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    width: "100%",
    maxWidth: 320,
    marginBottom: 15,
  },
  habit: {
    fontSize: 20,
    fontFamily: "DancingScript-Regular",
    color: "#81745dff",
    marginBottom: 10,
    textAlign: "center",
  },
  streak: {
    fontSize: 22,
    color: "#c7b49cff",
    marginBottom: 15,
    fontFamily: "Lobster-Regular",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
  },
  markDoneButton: {
    backgroundColor: "#c7b49cff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  markDoneText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Lobster-Regular",
  },
  deleteButton: {
    backgroundColor: "#81745dff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Lobster-Regular",
  },
});
 
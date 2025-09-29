import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function MyJournalsScreen() {
  const [journals, setJournals] = useState([]);
  const navigation = useNavigation();

  const loadJournals = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const journalKeys = keys.filter((k) => k.startsWith("journal-"));
    const entries = await AsyncStorage.multiGet(journalKeys);
    setJournals(entries.map(([k, v]) => ({ date: k, ...JSON.parse(v) })));
  };

  const deleteJournal = async (date) => {
    await AsyncStorage.removeItem(date);
    Alert.alert("Deleted!", `Journal for ${date} removed.`);
    loadJournals();
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadJournals);
    return unsubscribe;
  }, [navigation]);

  return (
    <FlatList
      data={journals}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => Alert.alert("Journal Entry", `Date: ${item.date.replace("journal-", "")}\n\n${item.text}`)}
        >
          <Text style={styles.date}>{item.date.replace("journal-", "")}</Text>
          <Text numberOfLines={2} style={styles.text}>{item.text}</Text>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteJournal(item.date)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff9f3ff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  date: { fontWeight: "bold", marginBottom: 5, color: "#81745dff" },
  text: { color: "#333" },
  deleteButton: {
    marginTop: 5,
    alignSelf: "flex-start",
    backgroundColor: "#81745dff",
    padding: 5,
    borderRadius: 5,
  },
  deleteText: { color: "#fff" },
});

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  const confirmDelete = (date) => {
    Alert.alert(
      "Delete Journal",
      `Are you sure you want to delete the journal for ${date.replace("journal-", "")}?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteJournal(date) },
      ]
    );
  };

  const deleteJournal = async (date) => {
    await AsyncStorage.removeItem(date);
    Alert.alert("Deleted!", `Journal for ${date.replace("journal-", "")} removed.`);
    loadJournals();
  };

  const editJournal = (item) => {
  // Navigate to JournalDetail screen for editing
  navigation.navigate("JournalDetail", { journal: item });
};


  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadJournals);
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <FlatList
        data={journals}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  "Journal Entry",
                  `Date: ${item.date.replace("journal-", "")}\n\n${item.text}`
                )
              }
            >
              <Text style={styles.date}>{item.date.replace("journal-", "")}</Text>
              <Text numberOfLines={2} style={styles.text}>
                {item.text}
              </Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => editJournal(item)}
              >
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => confirmDelete(item.date)}
              >
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
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
  buttonRow: { flexDirection: "row", marginTop: 5 },
  editButton: {
    marginRight: 10,
    backgroundColor: "#c7b49cff",
    padding: 5,
    borderRadius: 5,
  },
  editText: { color: "#fff" },
  deleteButton: {
    backgroundColor: "#81745dff",
    padding: 5,
    borderRadius: 5,
  },
  deleteText: { color: "#fff" },
});

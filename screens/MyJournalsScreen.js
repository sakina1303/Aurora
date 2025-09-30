import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useFonts } from "expo-font";

export default function MyJournalsScreen() {
  const [journals, setJournals] = useState([]);
  const [allJournals, setAllJournals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigation = useNavigation();

  // Load fonts
  const [fontsLoaded] = useFonts({
    'DancingScript-Regular': require("../assets/DancingScript-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null; 
  }

  const loadJournals = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const journalKeys = keys.filter((k) => k.startsWith("journal-"));
    const entries = await AsyncStorage.multiGet(journalKeys);
    const journalData = entries.map(([k, v]) => ({ date: k, ...JSON.parse(v) }));
    
    // Sort by date in descending order (newest first)
    const sortedJournals = journalData.sort((a, b) => {
      const dateA = new Date(a.date.replace("journal-", ""));
      const dateB = new Date(b.date.replace("journal-", ""));
      return dateB - dateA; // Descending order
    });
    
    setAllJournals(sortedJournals);
    setJournals(sortedJournals);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If search is empty, show all journals
      setJournals(allJournals);
      return;
    }
    
    // Filter journals by date or title
    const filteredJournals = allJournals.filter((journal) => {
      const dateMatch = journal.date.replace("journal-", "").toLowerCase().includes(query.toLowerCase());
      const titleMatch = journal.title && journal.title.toLowerCase().includes(query.toLowerCase());
      return dateMatch || titleMatch;
    });
    
    setJournals(filteredJournals);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9f3ff" }}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by date (YYYY-MM-DD) or title..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={handleSearch}
          clearButtonMode="while-editing"
        />
      </View>
      
      {journals.length === 0 && searchQuery.trim() !== "" ? (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>
            No journals found for "{searchQuery}"
          </Text>
          <Text style={styles.noResultsSubtext}>
            Try searching by date (YYYY-MM-DD) or journal title
          </Text>
        </View>
      ) : (
        <FlatList
          data={journals}
          keyExtractor={(item) => item.date}
          renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity
              onPress={() =>
                Alert.alert(
                  item.title || "Journal Entry",
                  `Date: ${item.date.replace("journal-", "")}\n\n${item.text}`
                )
              }
            >
              <Text style={styles.date}>{item.date.replace("journal-", "")}</Text>
              {item.title && (
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
              )}
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    backgroundColor: "#fff9f3ff",
    paddingHorizontal: 12,
    paddingTop: 5,
    paddingBottom: 18,
    marginTop: -50,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    fontFamily: "DancingScript-Regular",
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  noResultsText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
    fontWeight: "bold",
  },
  noResultsSubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#fff9f3ff",
    padding: 15,
    margin: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
  },
  date: { fontWeight: "bold", marginBottom: 5, color: "#81745dff", fontSize: 12 },
  title: { 
    fontWeight: "bold", 
    marginBottom: 5, 
    color: "#2c2c2c", 
    fontSize: 16,
    fontStyle: "italic"
  },
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

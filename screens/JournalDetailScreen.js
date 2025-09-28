import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function JournalDetailScreen({ route, navigation }) {
  const { journal } = route.params;
  const [text, setText] = useState(journal.text);
  const [image, setImage] = useState(journal.image);

  const saveEdit = async () => {
    const updated = { text, image };
    await AsyncStorage.setItem(journal.date, JSON.stringify(updated));
    Alert.alert("Saved!", "Journal updated successfully.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.date}>{journal.date.replace("journal-", "")}</Text>

      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        multiline
      />

      {image && <Image source={{ uri: image }} style={styles.image} />}

      <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
        <Text style={styles.saveText}>💾 Save Changes</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  date: { fontSize: 18, marginBottom: 10, fontWeight: "bold", color: "#81745dff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 200,
    textAlignVertical: "top",
  },
  image: { width: "100%", height: 200, borderRadius: 10, marginBottom: 10 },
  saveButton: {
    backgroundColor: "#81745dff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "bold" },
});

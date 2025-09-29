import React, { useState, useLayoutEffect, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function JournalDetailScreen({ route, navigation }) {
  const { journal } = route.params;
  const [text, setText] = useState(journal.text);
  const [image, setImage] = useState(journal.image);
  const [hasChanges, setHasChanges] = useState(false);

  const saveEdit = async () => {
    const updated = { text, image };
    await AsyncStorage.setItem(journal.date, JSON.stringify(updated));
    Alert.alert("Saved!", "Journal updated successfully.");
    setHasChanges(false);
    navigation.goBack();
  };

  const handleBackPress = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to leave without saving?",
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
          {
            text: "Save & Exit",
            onPress: saveEdit,
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const handleCancelEdit = () => {
    if (hasChanges) {
      Alert.alert(
        "Cancel Editing?",
        "You have unsaved changes. What would you like to do?",
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  // Check for changes
  useEffect(() => {
    const textChanged = text !== journal.text;
    const imageChanged = image !== journal.image;
    setHasChanges(textChanged || imageChanged);
  }, [text, image, journal.text, journal.image]);

  // Handle hardware/gesture back button
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges) {
        return;
      }

      e.preventDefault();
      
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to leave without saving?",
        [
          {
            text: "Keep Editing",
            style: "cancel",
          },
          {
            text: "Discard Changes",
            style: "destructive",
            onPress: () => {
              setHasChanges(false);
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: "Save & Exit",
            onPress: async () => {
              const updated = { text, image };
              await AsyncStorage.setItem(journal.date, JSON.stringify(updated));
              setHasChanges(false);
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges, text, image, journal.date]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => handleBackPress()}
          style={{ paddingLeft: 15 }}
        >
          <Text style={{ color: "#81745dff", fontWeight: "bold", fontSize: 16 }}>
            ← Back
          </Text>
        </TouchableOpacity>
      ),
      headerRight: () => (
        <TouchableOpacity
          onPress={() => saveEdit()}
          style={{ paddingRight: 15 }}
        >
          <Text style={{ 
            color: hasChanges ? "#81745dff" : "#999", 
            fontWeight: "bold", 
            fontSize: 16 
          }}>
            Save
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, hasChanges]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.dateContainer}>
          <Text style={styles.date} numberOfLines={2} adjustsFontSizeToFit>
            {journal.date.replace("journal-", "")}
          </Text>
        </View>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Write your journal entry here..."
          placeholderTextColor="#999"
          textAlignVertical="top"
        />

        {image && <Image source={{ uri: image }} style={styles.image} />}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveEdit}>
            <Text style={styles.saveText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  dateContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  date: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#81745dff",
    textAlign: "center",
    flexShrink: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    minHeight: 250,
    maxHeight: 400,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 22,
    backgroundColor: "#fafafa",
  },
  image: { 
    width: "100%", 
    height: 200, 
    borderRadius: 10, 
    marginBottom: 15,
    resizeMode: "cover"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  cancelText: { 
    color: "#666", 
    fontWeight: "bold",
    fontSize: 16 
  },
  saveButton: {
    backgroundColor: "#81745dff",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saveText: { 
    color: "#fff", 
    fontWeight: "bold",
    fontSize: 16 
  },
});

import React, { useState, useLayoutEffect } from "react";
import {
  View,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditJournalScreen({ route, navigation }) {
  const { journal } = route.params;
  const [text, setText] = useState(journal.text);
  const [isChanged, setIsChanged] = useState(false);

  // Update header with custom back action
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button title="Back" onPress={handleBackPress} />
      ),
    });
  }, [navigation, text]);

  const saveJournal = async () => {
    try {
      await AsyncStorage.setItem(
        journal.date,
        JSON.stringify({ ...journal, text })
      );
      Alert.alert("Saved!", "Journal updated successfully.");
      navigation.goBack();
    } catch (error) {
      console.log(error);
    }
  };

  const handleBackPress = () => {
    if (!isChanged || text === journal.text) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      "Unsaved Changes",
      "Do you want to save your changes before leaving?",
      [
        { text: "Don’t Save", style: "destructive", onPress: () => navigation.goBack() },
        { text: "Save", onPress: saveJournal },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={(val) => {
          setText(val);
          setIsChanged(true);
        }}
        multiline
      />
      <Button title="Save" onPress={saveJournal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
  },
});

import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";

export default function HomeScreen() {
  const [entry, setEntry] = useState("");
  const [image, setImage] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Load fonts
  const [fontsLoaded] = useFonts({
    DancingScript: require("../assets/DancingScript-Regular.ttf"),
    Lobster: require("../assets/Lobster-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null; // fonts load hone tak kuch render nahi hoga
  }

  const saveEntry = async (day = date) => {
    try {
      const data = { text: entry, image };
      await AsyncStorage.setItem(`journal-${day}`, JSON.stringify(data));
      Alert.alert("Voilaa!", `Journal for ${day} saved!`);
    } catch (e) {
      console.log("Error saving journal", e);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const goToNextDay = async () => {
    await saveEntry(date);
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate.toISOString().split("T")[0]);
  };

  return (
    <>
     <Text style={styles.Textt}>Aurora</Text>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
            
          <Text style={styles.heading}>Journal of {date}</Text>

          <TextInput
            style={styles.input}
            placeholder="Write your thoughts..."
            multiline
            value={entry}
            onChangeText={setEntry}
            scrollEnabled={true}
          />

          {image && <Image source={{ uri: image }} style={styles.imagePreview} />}

          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>
              {image ? "Change Photo" : "Add Photo"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => saveEntry()}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.nextButton]} onPress={goToNextDay}>
          <Text style={styles.buttonText}>Next Page</Text>
        </TouchableOpacity>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
    backgroundColor: "#fff9f3ff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: "center",
    width: "95%",
  },
  heading: {
    fontSize: 22,
    marginBottom: 10,
    color: "#81745dff",
    textAlign: "center",
    fontFamily: "DancingScript",
  },
  input: {
    height: 400,
    borderColor: "#dcddb6ff",
    borderWidth: 1,
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    textAlignVertical: "top",
    backgroundColor: "#fff",
    lineHeight: 22,
    fontFamily: "Lobster",
    color: "#81745dff",
  },
  imageButton: {
    backgroundColor: "#81745dff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  imageButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontFamily: "Lobster",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: "#81745dff",
    paddingVertical: 12,
    marginHorizontal: 5,
    marginTop: 10,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  nextButton: {
    backgroundColor: "#81745dff",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Lobster",
  },
  Textt:{
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#85765eff',
    fontFamily: 'DancingScript',
    textAlign: 'center',

  }
});

import React, { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useFonts } from "expo-font";

export default function HomeScreen({ navigation }) {
  const [entry, setEntry] = useState("");
  const [image, setImage] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  // Load fonts
  const [fontsLoaded] = useFonts({
    'DancingScript-Regular': require("../assets/DancingScript-Regular.ttf"),
    'Lobster-Regular': require("../assets/Lobster-Regular.ttf"),
  });  if (!fontsLoaded) {
    return null; 
  }
const saveEntry = async (day = date) => {
  if (!entry.trim()) {
    Alert.alert("Oops!", "Please write something before saving!");
    return;
  }

  try {
    const data = { text: entry, image };
    await AsyncStorage.setItem(`journal-${day}`, JSON.stringify(data));
    Alert.alert("Voilaa!", `Journal for ${day} saved!`);
  } catch (e) {
    console.log("Error saving journal", e);
  }
};

  const showImagePicker = async () => {
    let isSimulator = false;
    
    try {
      // Check if we're on iOS simulator where camera won't work
      const cameraPermission = await ImagePicker.getCameraPermissionsAsync();
      isSimulator = Platform.OS === 'ios' && !cameraPermission.canAskAgain;
    } catch (error) {
      // If we can't check permissions, assume it might be simulator
      isSimulator = Platform.OS === 'ios';
    }
    
    const options = [
      {
        text: "Photo Library",
        onPress: pickImage,
      }
    ];

    // Only add camera option if likely not on simulator
    if (!isSimulator) {
      options.unshift({
        text: "Camera",
        onPress: takePicture,
      });
    }

    options.push({
      text: "Cancel",
      style: "cancel",
    });

    Alert.alert(
      "Select Photo",
      isSimulator ? "Choose a photo from your library (Camera not available on simulator)" : "Choose how you'd like to add a photo",
      options
    );
  };

  const takePicture = async () => {
    try {
      // Check if we're on a simulator
      const isSimulator = Platform.OS === 'ios' && !await ImagePicker.getCameraPermissionsAsync();
      
      if (isSimulator) {
        Alert.alert(
          "Camera Not Available", 
          "Camera is not available on iOS Simulator. Please use Photo Library or test on a physical device.",
          [{ text: "OK", onPress: pickImage }]
        );
        return;
      }

      // Request camera permission
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      
      if (cameraPermission.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error taking picture:", error);
      // If it's a simulator error, redirect to photo library
      if (error.message?.includes('simulator') || error.message?.includes('Camera not available')) {
        Alert.alert(
          "Camera Not Available", 
          "Camera is not available on simulator. Opening photo library instead.",
          [{ text: "OK", onPress: pickImage }]
        );
      } else {
        Alert.alert("Error", "Failed to take picture. Please try again.");
      }
    }
  };

  const pickImage = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access photo library is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const goToNextDay = async () => {
    await saveEntry(date);
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    setDate(newDate.toISOString().split("T")[0]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff9f3ff" }}>
      <View style={styles.header}>
        <Text style={styles.MainHeading}>Aurora</Text>
      </View>

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

          <TouchableOpacity style={styles.imageButton} onPress={showImagePicker}>
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
    </SafeAreaView>
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
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    marginBottom: 10,
    color: "#81745dff",
    textAlign: "center",
    fontFamily: "DancingScript-Regular",
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
    fontFamily: "Lobster-Regular",
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
    fontFamily: "Lobster-Regular",
    
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
   
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Lobster-Regular",
    
  },
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: "#fff9f3ff",
  },
  MainHeading: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#85765eff",
    fontFamily: "DancingScript-Regular",
    textAlign: "center",
  },

});

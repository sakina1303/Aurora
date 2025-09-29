import React, { useState, useLayoutEffect, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

export default function JournalDetailScreen({ route, navigation }) {
  const { journal } = route.params;
  const [text, setText] = useState(journal.text);
  const [title, setTitle] = useState(journal.title || "");
  const [image, setImage] = useState(journal.image);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  // Debug image data
  useEffect(() => {
    console.log("Journal data:", journal);
    console.log("Image URI:", journal.image);
  }, [journal]);

  const showImagePicker = async () => {
    Alert.alert(
      "Change Photo",
      "Choose an option",
      [
        {
          text: "Camera",
          onPress: () => pickImage(true),
        },
        {
          text: "Photo Library",
          onPress: () => pickImage(false),
        },
        {
          text: "Remove Photo",
          style: "destructive",
          onPress: () => setImage(null),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const pickImage = async (useCamera) => {
    try {
      let result;
      
      if (useCamera) {
        // Request camera permissions
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission is required to take photos.');
          return;
        }
        
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      } else {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Photo library permission is required.');
          return;
        }
        
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.8,
        });
      }

      if (!result.canceled && result.assets && result.assets[0]) {
        setImage(result.assets[0].uri);
      }
    } catch (error) {
      console.log('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const saveEdit = async () => {
    const updated = { 
      title: title.trim() || `Journal Entry - ${journal.date.replace("journal-", "")}`,
      text, 
      image 
    };
    await AsyncStorage.setItem(journal.date, JSON.stringify(updated));
    setHasChanges(false);
    
    // Show success message briefly
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigation.goBack();
    }, 1500);
  };

  const handleBackPress = () => {
    if (hasChanges && !isDiscarding) {
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
              setIsDiscarding(true);
              setHasChanges(false);
              setTimeout(() => navigation.goBack(), 100);
            },
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
    if (hasChanges && !isDiscarding) {
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
              setIsDiscarding(true);
              setHasChanges(false);
              setTimeout(() => navigation.goBack(), 100);
            },
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
    const titleChanged = title !== (journal.title || "");
    const imageChanged = image !== journal.image;
    setHasChanges(textChanged || titleChanged || imageChanged);
  }, [text, title, image, journal.text, journal.title, journal.image]);

  // Handle hardware/gesture back button
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges || isDiscarding) {
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
              setIsDiscarding(true);
              setHasChanges(false);
              navigation.dispatch(e.data.action);
            },
          },
          {
            text: "Save & Exit",
            onPress: async () => {
              const updated = { 
                title: title.trim() || `Journal Entry - ${journal.date.replace("journal-", "")}`,
                text, 
                image 
              };
              await AsyncStorage.setItem(journal.date, JSON.stringify(updated));
              setHasChanges(false);
              navigation.dispatch(e.data.action);
            },
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasChanges, isDiscarding, text, image, journal.date]);

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
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter journal title..."
          placeholderTextColor="#999"
          maxLength={50}
        />

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          multiline
          placeholder="Write your journal entry here..."
          placeholderTextColor="#999"
          textAlignVertical="top"
        />

        {image ? (
          <TouchableOpacity style={styles.imageContainer} onPress={showImagePicker}>
            <Image 
              source={{ uri: image }} 
              style={styles.image}
              resizeMode="cover"
              onError={(error) => {
                console.log("Image load error:", error.nativeEvent.error);
                setImage(null);
              }}
              onLoad={() => console.log("Image loaded successfully")}
            />
            <View style={styles.imageOverlay}>
              <Text style={styles.imageOverlayText}>Tap to change photo</Text>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addImageButton} onPress={showImagePicker}>
            <Text style={styles.addImageText}>📷 Add Photo</Text>
          </TouchableOpacity>
        )}

        {showSuccess && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>✓ Updated successfully</Text>
          </View>
        )}

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
  titleInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    fontWeight: "bold",
    backgroundColor: "#fafafa",
    color: "#333",
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
  imageContainer: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: "relative",
  },
  image: { 
    width: "100%", 
    height: 200, 
    borderRadius: 10,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    alignItems: "center",
  },
  imageOverlayText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  addImageButton: {
    borderWidth: 2,
    borderColor: "#81745dff",
    borderStyle: "dashed",
    borderRadius: 10,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    backgroundColor: "#f9f9f9",
  },
  addImageText: {
    color: "#81745dff",
    fontSize: 16,
    fontWeight: "bold",
  },
  successContainer: {
    backgroundColor: "#81745dff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
    alignItems: "center",
  },
  successText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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

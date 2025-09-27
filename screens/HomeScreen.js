import React, { useState } from 'react';
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
} from 'react-native';

export default function HomeScreen() {
  const [entry, setEntry] = useState(''); // journal text

  const saveEntry = () => {
    if (entry.trim() === '') {
      Alert.alert('', 'Please write something before saving!');
      return;
    }
    Alert.alert('Voilaa!', 'Journal Entry Saved');
    setEntry('');
  };

  return (
    <>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.heading}>Today's Journal</Text>
        <ScrollView style={{ flex: 1 }}>
          <TextInput
            style={styles.input}
            placeholder="Write your thoughts..."
            multiline
            value={entry}
            onChangeText={setEntry}
            scrollEnabled={true} 
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={saveEntry}>
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.nextButton]}
          onPress={() => {
            /* your next page logic here */
          }}
        >
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
    backgroundColor: '#fff9f3ff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
    width: '95%',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#726e45ff',
    textAlign: 'center',
  },
  input: {
  minHeight: 200,
  maxHeight: 400,   
  borderColor: '#94962dff',
  borderWidth: 1,
  padding: 12,
  marginBottom: 20,
  borderRadius: 10,
  textAlignVertical: 'top',
  backgroundColor: '#fff',
  lineHeight: 22,
},

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#535418ff',
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6, // Android shadow
  },
  nextButton: {
    backgroundColor: '#726e45ff',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

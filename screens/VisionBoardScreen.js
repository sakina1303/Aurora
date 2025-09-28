import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VisionBoardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🌟 Your Vision Board Coming Soon!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, color: "#81745dff" },
});

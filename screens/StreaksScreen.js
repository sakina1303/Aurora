import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StreaksScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔥 Streaks</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, color: "#81745dff" },
});

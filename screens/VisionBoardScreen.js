import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

const sampleData = [
  { id: "1", title: "Dream Job", image: "https://via.placeholder.com/100" },
  { id: "2", title: "Travel Europe", image: "https://via.placeholder.com/100" },
  { id: "3", title: "Fitness Goal", image: "https://via.placeholder.com/100" },
];

export default function VisionBoardScreen() {
  const [selectedBoard, setSelectedBoard] = useState("Monthly");
  const [data, setData] = useState(sampleData);

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setSelectedBoard("Monthly")}
        >
          <Text
            style={[
              styles.tabText,
              selectedBoard === "Monthly" && styles.activeTab,
            ]}
          >
            Monthly
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.tabButton}
          onPress={() => setSelectedBoard("Yearly")}
        >
          <Text
            style={[
              styles.tabText,
              selectedBoard === "Yearly" && styles.activeTab,
            ]}
          >
            Yearly
          </Text>
        </TouchableOpacity>
      </View>

      {/* Draggable Vision Board */}
      <DraggableFlatList
        data={data}
        onDragEnd={({ data }) => setData(data)}
        keyExtractor={(item) => item.id}
        renderItem={({ item, drag, isActive }) => (
          <TouchableOpacity
            style={[styles.item, { backgroundColor: isActive ? "#d9cfc2" : "#f2ede7" }]}
            onLongPress={drag}
          >
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text style={styles.itemText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40, backgroundColor: "#fff" },
  tabContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 0,
    marginHorizontal: 10,
  },
  tabText: { 
    fontSize: 18, 
    color: "#81745d",
    textAlign: "center",
  },
  activeTab: { 
    fontWeight: "bold", 
    textDecorationLine: "underline",
    color: "#81745dff",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  image: { width: 50, height: 50, marginRight: 10, borderRadius: 8 },
  itemText: { fontSize: 16, color: "#333" },
});

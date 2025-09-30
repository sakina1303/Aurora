import React, { useState, useRef, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  TextInput,
  Alert,
  Animated,
  Dimensions,
  PanResponder
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VisionBoardScreen() {
  const [selectedBoard, setSelectedBoard] = useState("Monthly");
  const [items, setItems] = useState([]);
  const [nextId, setNextId] = useState(1);
  const [editingItemId, setEditingItemId] = useState(null);
  const [currentEditingText, setCurrentEditingText] = useState('');

  const addImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Photo library permission is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const itemWidth = 100;
        const itemHeight = 100;
        const containerWidth = screenWidth - 40; // Account for margins
        const containerHeight = screenHeight - 350; // Account for header, tabs, buttons
        
        const newItem = {
          id: nextId.toString(),
          type: 'image',
          uri: result.assets[0].uri,
          x: Math.max(10, Math.min(Math.random() * (containerWidth - itemWidth), containerWidth - itemWidth)),
          y: Math.max(10, Math.min(Math.random() * (containerHeight - itemHeight), containerHeight - itemHeight)),
          width: itemWidth,
          height: itemHeight,
        };
        setItems([...items, newItem]);
        setNextId(nextId + 1);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const addTextBox = () => {
    const itemWidth = 120;
    const itemHeight = 50;
    const containerWidth = screenWidth - 40; // Account for margins
    const containerHeight = screenHeight - 350; // Account for header, tabs, buttons
    
    const newItem = {
      id: nextId.toString(),
      type: 'text',
      text: '',
      x: Math.max(10, Math.min(Math.random() * (containerWidth - itemWidth), containerWidth - itemWidth)),
      y: Math.max(10, Math.min(Math.random() * (containerHeight - itemHeight), containerHeight - itemHeight)),
      width: itemWidth,
      height: itemHeight,
    };
    setItems([...items, newItem]);
    setNextId(nextId + 1);
  };

  const updateItemText = (id, newText) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, text: newText } : item
      )
    );
  };

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const DraggableItem = ({ item, isEditing }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const [isDragging, setIsDragging] = useState(false);
    const [currentText, setCurrentText] = useState(item.text || '');
    const textInputRef = useRef(null);

    // Save text when editing stops
    useEffect(() => {
      if (!isEditing && currentText !== item.text) {
        updateItemText(item.id, currentText);
      }
    }, [isEditing]);



    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: () => !isEditing,
      onMoveShouldSetPanResponder: () => !isEditing,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (evt, gestureState) => {
        pan.setValue({
          x: gestureState.dx,
          y: gestureState.dy,
        });
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsDragging(false);

        const containerWidth = screenWidth - 40;
        const containerHeight = screenHeight - 350;
        
        const newX = Math.max(10, Math.min(item.x + gestureState.dx, containerWidth - item.width));
        const newY = Math.max(10, Math.min(item.y + gestureState.dy, containerHeight - item.height));

        setItems(prevItems => 
          prevItems.map(i => 
            i.id === item.id ? { ...i, x: newX, y: newY } : i
          )
        );

        pan.setValue({ x: 0, y: 0 });
      },
    });

    const startEditing = (e) => {
      e.stopPropagation();
      setCurrentText(item.text || '');
      setCurrentEditingText(item.text || '');
      setEditingItemId(item.id);
    };

    return (
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.draggableItem,
          {
            left: item.x,
            top: item.y,
            width: item.width,
            height: item.height,
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
              { scale: isDragging ? 1.05 : 1 }
            ],
            zIndex: isDragging ? 1000 : 1,
            elevation: isDragging ? 15 : 5,
            opacity: isDragging ? 0.9 : 1,
          },
        ]}
      >
        {item.type === 'image' ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.uri }} style={styles.collageImage} />
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => deleteItem(item.id)}
            >
              <Text style={styles.deleteBtnText}>×</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity 
            style={styles.textContainer}
            onPress={startEditing}
            activeOpacity={0.8}
          >
            {isEditing ? (
              <TextInput
                key={`text-${item.id}`}
                ref={textInputRef}
                style={styles.textInput}
                value={currentText}
                onChangeText={(text) => {
                  setCurrentText(text);
                }}
                onBlur={() => {
                  setCurrentEditingText(currentText);
                  updateItemText(item.id, currentText);
                  setEditingItemId(null);
                }}
                onEndEditing={() => {
                  setCurrentEditingText(currentText);
                  updateItemText(item.id, currentText);
                  setEditingItemId(null);
                }}
                multiline={true}
                textAlign="center"
                placeholder="Enter your text"
                placeholderTextColor="#999"
                autoCorrect={false}
                autoFocus={true}
              />
            ) : (
              <Text style={styles.displayText}>
                {item.text || 'Tap to add text'}
              </Text>
            )}
            <TouchableOpacity 
              style={styles.deleteBtn}
              onPress={() => deleteItem(item.id)}
            >
              <Text style={styles.deleteBtnText}>×</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </Animated.View>
    );
  };

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

      {/* Collage Canvas */}
      <View style={styles.canvas}>
        {/* Invisible overlay to handle tap outside when editing */}
        {editingItemId && (
          <TouchableOpacity 
            style={styles.overlay}
            activeOpacity={0}
            onPress={() => {
              // Get the current text from the editing component and save it
              if (editingItemId) {
                // The useEffect will handle saving when isEditing becomes false
                setEditingItemId(null);
              }
            }}
          />
        )}
        
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} isEditing={editingItemId === item.id} />
        ))}
        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Create Your Vision Board</Text>
            <Text style={styles.emptySubtext}>Add images and text to start building your dreams</Text>
          </View>
        )}
      </View>

      {/* Action Buttons - Moved Below Canvas */}
      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.actionBtn} onPress={addImage}>
          <Text style={styles.actionBtnText}>+ Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={addTextBox}>
          <Text style={styles.actionBtnText}>+ Text</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff9f3ff" 
  },
  tabContainer: { 
    flexDirection: "row", 
    justifyContent: "space-around", 
    marginBottom: 15,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  tabText: { 
    fontSize: 18, 
    color: "#81745d",
    textAlign: "center",
    fontFamily: "DancingScript-Regular",
  },
  activeTab: { 
    fontWeight: "bold", 
    textDecorationLine: "underline",
    color: "#81745dff",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#81745dff",
    paddingVertical: 12,
    marginHorizontal: 5,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Lobster-Regular",
  },
  canvas: {
    flex: 1,
    position: "relative",
    backgroundColor: "#fff",
    margin: 10,
    borderRadius: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  draggableItem: {
    position: "absolute",
    borderRadius: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  imageContainer: {
    flex: 1,
    position: "relative",
  },
  collageImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
    resizeMode: "cover",
  },
  textContainer: {
    flex: 1,
    backgroundColor: "#fff9f3ff",
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#81745dff",
    borderStyle: "dashed",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 40,
  },
  textInput: {
    width: "100%",
    height: "100%",
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    padding: 8,
    fontWeight: "bold",
    textAlignVertical: "center",
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  displayText: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
    padding: 8,
    fontWeight: "bold",
    minHeight: 30,
  },
  deleteBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#ff4444",
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
  },
  deleteBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    color: "#81745dff",
    textAlign: "center",
    marginBottom: 10,
    fontFamily: "Lobster-Regular",
  },
  emptySubtext: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    lineHeight: 22,
    fontFamily: "Lobster-Regular",
  },
});

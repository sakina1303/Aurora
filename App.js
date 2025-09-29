import React from "react";
import { StatusBar, View, Text, Button } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";

// Screens
import HomeScreen from "./screens/HomeScreen";
import VisionBoardScreen from "./screens/VisionBoardScreen";
import MyJournalsScreen from "./screens/MyJournalsScreen";
import StreaksScreen from "./screens/StreaksScreen";
import JournalDetailScreen from "./screens/JournalDetailScreen";
import EditJournalScreen from "./screens/EditJournalScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#81745dff",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 65,
        },
        tabBarLabel: ({ color }) => (
          <Text
            style={{
              fontFamily: "Lobster-Regular",
              fontSize: 12,
              textAlign: "center",
              color,
              marginTop: 2,
            }}
          >
            {route.name}
          </Text>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Vision Board") iconName = focused ? "star" : "star-outline";
          else if (route.name === "My Journals") iconName = focused ? "book" : "book-outline";
          else if (route.name === "Streaks") iconName = focused ? "flame" : "flame-outline";

          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={iconName} size={size} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Vision Board" component={VisionBoardScreen} />
      <Tab.Screen name="My Journals" component={MyJournalsScreen} />
      <Tab.Screen name="Streaks" component={StreaksScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    "DancingScript-Regular": require("./assets/DancingScript-Regular.ttf"),
    "Lobster-Regular": require("./assets/Lobster-Regular.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Bottom Tabs */}
          <Stack.Screen name="Tabs" component={TabNavigator} />

          {/* Hidden Screens */}
          <Stack.Screen name="JournalDetail" component={JournalDetailScreen} />

          <Stack.Screen
            name="EditJournal"
            component={EditJournalScreen}
            options={({ navigation, route }) => ({
              headerShown: true,
              title: "Edit Journal",
              headerBackTitleVisible: false, // just arrow, no text
              headerRight: () => (
                <Button
                  onPress={() => {
                    // trigger save function inside EditJournalScreen
                    navigation.emit({
                      type: "saveJournal",
                      target: route.key,
                    });
                  }}
                  title="Save"
                  color="#81745dff"
                />
              ),
            })}
          />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

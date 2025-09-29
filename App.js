import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import HomeScreen from "./screens/HomeScreen";
import VisionBoardScreen from "./screens/VisionBoardScreen";
import MyJournalsScreen from "./screens/MyJournalsScreen";
import StreaksScreen from "./screens/StreaksScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  // Load fonts
  const [fontsLoaded] = useFonts({
    'DancingScript-Regular': require("./assets/DancingScript-Regular.ttf"),
    'Lobster-Regular': require("./assets/Lobster-Regular.ttf"),
  });

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#81745dff",
          tabBarInactiveTintColor: "#999",
          tabBarLabelStyle: {
            fontFamily: "Lobster-Regular",
            fontSize: 12,
            marginBottom: 5,
          },
          tabBarStyle: {
            backgroundColor: "#fff",
            paddingBottom: 5,
            height: 65,
          },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Vision Board') {
              iconName = focused ? 'star' : 'star-outline';
            } else if (route.name === 'My Journals') {
              iconName = focused ? 'book' : 'book-outline';
            } else if (route.name === 'Streaks') {
              iconName = focused ? 'flame' : 'flame-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Vision Board" component={VisionBoardScreen} />
        <Tab.Screen name="My Journals" component={MyJournalsScreen} />
        <Tab.Screen name="Streaks" component={StreaksScreen} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './screens/HomeScreen';
import VisionBoardScreen from './screens/VisionBoardScreen';
import MyJournalsScreen from './screens/MyJournalsScreen';
import StreaksScreen from './screens/StreaksScreen';
import JournalDetailScreen from './screens/JournalDetailScreen';
import { fonts, ThemeProvider, useTheme } from './theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const icons = { Today: 'book-outline', Diary: 'albums-outline', Vision: 'sparkles-outline', Streaks: 'flame-outline' };

function Tabs() {
  const { colors } = useTheme();
  return <Tab.Navigator screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: colors.brown,
    tabBarInactiveTintColor: colors.muted,
    tabBarStyle: { backgroundColor: colors.paper, borderTopColor: colors.line, height: 66, paddingTop: 5 },
    tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 11, fontWeight: '700', letterSpacing: 0.3, marginBottom: 6 },
    tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? icons[route.name].replace('-outline', '') : icons[route.name]} color={color} size={21} />,
  })}>
    <Tab.Screen name="Today" component={HomeScreen} />
    <Tab.Screen name="Diary" component={MyJournalsScreen} />
    <Tab.Screen name="Vision" component={VisionBoardScreen} />
    <Tab.Screen name="Streaks" component={StreaksScreen} />
  </Tab.Navigator>;
}

export default function App() {
  const [ready] = useFonts({
    [fonts.display]: require('./assets/DancingScript-Regular.ttf'),
    [fonts.accent]: require('./assets/Lobster-Regular.ttf'),
  });
  if (!ready) return null;
  return <GestureHandlerRootView style={{ flex: 1 }}>
    <ThemeProvider><SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={Tabs} />
          <Stack.Screen name="JournalDetail" component={JournalDetailScreen} />
        </Stack.Navigator>
        <StatusBar style="dark" />
      </NavigationContainer>
    </SafeAreaProvider></ThemeProvider>
  </GestureHandlerRootView>;
}

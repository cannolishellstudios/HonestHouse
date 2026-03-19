import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calculator, Map, Grid, BookOpen } from 'lucide-react-native';
import { View } from 'react-native';
import MathScreen from '../screens/MathScreen';

// Temporary placeholder for unbuilt screens
const Placeholder = () => <View style={{ flex: 1, backgroundColor: '#121212' }} />;

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1E1E1E',
          borderTopColor: '#333333',
          borderTopWidth: 2,
          paddingBottom: 8,
          paddingTop: 8,
          height: 90,
        },
        tabBarActiveTintColor: '#4ADE80',
        tabBarInactiveTintColor: '#555555',
        tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold' },
      }}
    >
      <Tab.Screen 
        name="The Math" 
        component={MathScreen} 
        options={{ tabBarIcon: ({ color }) => <Calculator color={color} size={28} /> }}
      />
      <Tab.Screen 
        name="The Cure" 
        component={Placeholder} 
        options={{ tabBarIcon: ({ color }) => <Map color={color} size={28} /> }}
      />
      <Tab.Screen 
        name="The Matrix" 
        component={Placeholder} 
        options={{ tabBarIcon: ({ color }) => <Grid color={color} size={28} /> }}
      />
      <Tab.Screen 
        name="BS Filter" 
        component={Placeholder} 
        options={{ tabBarIcon: ({ color }) => <BookOpen color={color} size={28} /> }}
      />
    </Tab.Navigator>
  );
}
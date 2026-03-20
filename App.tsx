import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import { useAppStore } from './src/store/store';
import { configureRevenueCat } from './src/services/revenueCat';
import { incrementAppOpens } from './src/services/reviewPrompt';

export default function App() {
  const hasOnboarded = useAppStore(s => s.hasOnboarded);
  const completeOnboarding = useAppStore(s => s.completeOnboarding);
  const syncProStatus = useAppStore(s => s.syncProStatus);

  useEffect(() => {
    // 1. Track this app launch for review prompt logic
    incrementAppOpens();

    // 2. Fire up the RevenueCat SDK
    configureRevenueCat().then(() => {
      // 3. Check if the user's sub lapsed while offline
      syncProStatus();
    });
  }, []);

  if (!hasOnboarded) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onDone={completeOnboarding} />
        <StatusBar style="dark" />
      </SafeAreaProvider>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <NavigationContainer>
          <TabNavigator />
        </NavigationContainer>
        <StatusBar style="dark" />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
});
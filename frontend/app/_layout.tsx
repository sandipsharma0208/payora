import React, { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { Colors } from '../src/theme/colors';

// Keep the splash screen visible while we fetch resources and check authentication
SplashScreen.preventAutoHideAsync().catch((error) => {
  console.warn('Failed to keep the splash screen visible:', error);
});

function RootNavigation() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const hasHiddenSplash = useRef(false);

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
      return;
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    if (!hasHiddenSplash.current) {
      hasHiddenSplash.current = true;
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Failed to hide the splash screen:', error);
      });
    }
  }, [isAuthenticated, isLoading, router, segments]);

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="send/pick" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="send/amount" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="send/confirm" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="send/press-hold" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="send-abroad" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="kyc" options={{ headerShown: false, presentation: 'card' }} />
      <Stack.Screen name="ai-support" options={{ headerShown: false, presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor={Colors.primary} translucent={false} animated />
      <View style={styles.container}>
        <RootNavigation />
      </View>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: '100%',
  },
});

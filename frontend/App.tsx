import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, configureFonts, MD3DarkTheme } from 'react-native-paper';
import { Feather } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import {
  useFonts,
  Cinzel_400Regular,
  Cinzel_500Medium,
  Cinzel_600SemiBold,
  Cinzel_700Bold,
  Cinzel_800ExtraBold,
  Cinzel_900Black
} from '@expo-google-fonts/cinzel';
import {
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_700Bold
} from '@expo-google-fonts/cormorant-garamond';

// Services
import { initSentry } from './src/services/SentryService';
import { Analytics } from './src/services/AnalyticsService';

// Context
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider } from './src/context/LanguageContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ResultScreen from './src/screens/ResultScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import StatsScreen from './src/screens/StatsScreen';
import OnboardingQuizScreen from './src/screens/OnboardingQuizScreen';

// Components
import AnimatedScreen from './src/components/AnimatedScreen';
import BreathingBackground from './src/components/BreathingBackground'; // GLOBAL BACKGROUND
import GlobalErrorBoundary from './src/components/GlobalErrorBoundary';
import { NetworkProvider } from './src/context/NetworkContext';
import OfflineBanner from './src/components/OfflineBanner';

// Init Sentry
initSentry();

// Splash screen settings
SplashScreen.preventAutoHideAsync();

// 🌌 COSMIC PURPLE THEME (Shared)
import { COSMIC_THEME } from './src/theme/theme';

// 🌌 COSMIC PURPLE THEME (Shared)
const THEME = COSMIC_THEME;

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Ana Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
          height: 70,
          borderRadius: 35,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        },
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { borderRadius: 35, overflow: 'hidden' }]}>
            <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20, 10, 30, 0.8)' }]} />
          </View>
        ),
        tabBarShowLabel: false,
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.4)',
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Feather name="moon" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      >
        {(props: any) => <AnimatedScreen><HomeScreen {...props} /></AnimatedScreen>}
      </Tab.Screen>

      <Tab.Screen
        name="History"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Feather name="clock" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      >
        {(props: any) => <AnimatedScreen><HistoryScreen {...props} /></AnimatedScreen>}
      </Tab.Screen>

      <Tab.Screen
        name="Calendar"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Feather name="calendar" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      >
        {(props: any) => <AnimatedScreen><CalendarScreen {...props} /></AnimatedScreen>}
      </Tab.Screen>

      <Tab.Screen
        name="Stats"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Feather name="bar-chart-2" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      >
        {(props: any) => <AnimatedScreen><StatsScreen {...props} /></AnimatedScreen>}
      </Tab.Screen>

      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIconContainer]}>
              <Feather name="user" size={24} color={color} />
              {focused && <View style={styles.activeDot} />}
            </View>
          ),
        }}
      >
        {(props: any) => <AnimatedScreen><ProfileScreen {...props} /></AnimatedScreen>}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// Main App Component
function AppContent() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [guestOnboardingMode, setGuestOnboardingMode] = useState(false);
  const { user, loading: authLoading, login, register, googleLogin, appleLogin, loginAsGuest } = useAuth();

  // Load Fonts
  const [fontsLoaded] = useFonts({
    Cinzel_400Regular,
    Cinzel_500Medium,
    Cinzel_600SemiBold,
    Cinzel_700Bold,
    Cinzel_800ExtraBold,
    Cinzel_900Black,
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular,
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_700Bold,
  });

  const fontConfig = {
    fontFamily: 'CormorantGaramond_400Regular', // Default body font
  };

  const paperTheme = {
    ...MD3DarkTheme,
    dark: true,
    roundness: 16,
    version: 3 as const,
    colors: {
      ...MD3DarkTheme.colors,
      primary: THEME.primary,
      background: 'transparent', // Transparent for global BG
      surface: THEME.card,
      onSurface: THEME.text,
      // elevation override removed to prevent interpolation errors
    },
    fonts: configureFonts({ config: fontConfig }),
  };

  useEffect(() => {
    async function prepare() {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
        setShowOnboarding(hasSeenOnboarding !== 'true');
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (e) {
        console.error(e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (appIsReady && fontsLoaded) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [appIsReady, fontsLoaded]);

  // Navigation refs
  const routeNameRef = useRef<string | undefined>(undefined);
  const navigationRef = useRef<any>(null);

  if (!appIsReady || authLoading || !fontsLoaded) {
    return null;
  }

  // Common wrapper for global background
  const WithGlobalBackground = ({ children }: { children: React.ReactNode }) => (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <BreathingBackground />
      {children}
    </View>
  );

  if (showOnboarding || guestOnboardingMode) {
    return (
      <WithGlobalBackground>
        <PaperProvider theme={paperTheme}>
          <OnboardingScreen onComplete={async () => {
            if (guestOnboardingMode) {
              // GUEST FLOW ENDS -> LOGIN AS GUEST (Will Trigger Quiz)
              setGuestOnboardingMode(false);
              await loginAsGuest();
            } else {
              // FIRST LAUNCH FLOW ENDS
              await AsyncStorage.setItem('hasSeenOnboarding', 'true');
              setShowOnboarding(false);
            }
          }} />
        </PaperProvider>
      </WithGlobalBackground>
    );
  }

  if (!user) {
    return (
      <WithGlobalBackground>
        <PaperProvider theme={paperTheme}>
          <LoginScreen
            onLogin={login}
            onRegister={register}
            onGoogleLogin={googleLogin}
            onAppleLogin={appleLogin}
            onSkip={() => setGuestOnboardingMode(true)} // START GUEST FLOW
          />
        </PaperProvider>
      </WithGlobalBackground>
    );
  }

  const navigationTheme = {
    dark: true,
    colors: {
      primary: THEME.primary,
      background: 'transparent', // Transparent nav background
      card: THEME.card,
      text: '#fff',
      border: 'transparent',
      notification: THEME.primary,
    },
  };

  return (
    <WithGlobalBackground>
      <PaperProvider theme={paperTheme}>
        <NavigationContainer
          theme={navigationTheme}
          ref={navigationRef}
          onReady={() => routeNameRef.current = navigationRef.current?.getCurrentRoute()?.name}
          onStateChange={() => {
            const currentRouteName = navigationRef.current?.getCurrentRoute()?.name;
            if (routeNameRef.current !== currentRouteName) {
              Analytics.logScreenView(currentRouteName || 'Unknown');
            }
            routeNameRef.current = currentRouteName;
          }}
        >
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' }, // Transparent stack
              animation: 'fade_from_bottom',
            }}
          >
            <Stack.Screen name="MainTabs">
              {props => {
                // FORCE QUIZ CHECK: If user has no persona (e.g. fresh guest or new user), show quiz first
                if (user && !user.persona) {
                  return <OnboardingQuizScreen />;
                }
                return <MainTabs />;
              }}
            </Stack.Screen>
            <Stack.Screen
              name="Result"
              options={{ animation: 'slide_from_right' }}
            >
              {(props: any) => <AnimatedScreen><ResultScreen {...props} /></AnimatedScreen>}
            </Stack.Screen>
            <Stack.Screen
              name="OnboardingQuiz"
              options={{ animation: 'fade_from_bottom' }}
            >
              {(props: any) => <AnimatedScreen><OnboardingQuizScreen {...props} /></AnimatedScreen>}
            </Stack.Screen>
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </WithGlobalBackground>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <NetworkProvider>
          <AuthProvider>
            <GlobalErrorBoundary>
              <OfflineBanner />
              <AppContent />
            </GlobalErrorBoundary>
          </AuthProvider>
        </NetworkProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  activeIconContainer: {
    paddingTop: 0,
    marginBottom: 5,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.primary,
    marginTop: 4,
    shadowColor: THEME.primary,
    shadowRadius: 4,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 0 },
  }
});

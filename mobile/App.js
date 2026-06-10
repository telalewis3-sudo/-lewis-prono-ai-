import React, { useState, useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';

import WelcomeScreen from './src/screens/WelcomeScreen';
import HomeScreen from './src/screens/HomeScreen';
import PredictionsScreen from './src/screens/PredictionsScreen';
import CouponScreen from './src/screens/CouponScreen';
import PromoScreen from './src/screens/PromoScreen';
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1A1F2E',
          borderTopColor: '#2A3248',
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#D4A574',
        tabBarInactiveTintColor: '#5A6478',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} options={{ tabBarLabel: 'Accueil' }} />
      <Tab.Screen name="Pronostics" component={PredictionsScreen} options={{ tabBarLabel: 'Pronostics' }} />
      <Tab.Screen name="Coupon" component={CouponScreen} options={{ tabBarLabel: 'Coupon' }} />
      <Tab.Screen name="Promo" component={PromoScreen} options={{ tabBarLabel: 'Promo' }} />
      <Tab.Screen name="Profil" component={ProfileScreen} options={{ tabBarLabel: 'Profil' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Welcome');
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await SecureStore.getItemAsync('auth_token');
      setInitialRoute(token ? 'Main' : 'Welcome');
    } catch (e) {
      setInitialRoute('Welcome');
    }
    Animated.timing(splashOpacity, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => setIsReady(true));
  }

  if (!isReady) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0C0F1A', justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <Animated.View style={{ opacity: splashOpacity }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: '#D4A574', justifyContent: 'center', alignItems: 'center',
          }}>
            <Animated.Text style={{ fontSize: 30, fontWeight: '800', color: '#0C0F1A', letterSpacing: 2 }}>
              LP
            </Animated.Text>
          </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

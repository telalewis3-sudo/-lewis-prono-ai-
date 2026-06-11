import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import GradientView from '../utils/GradientView';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <View style={styles.container}>
      <GradientView colors={['#0C0F1A', '#1A1F2E', '#232A3D']} style={styles.gradient}>
        <View style={styles.content}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <GradientView colors={[COLORS.primary, COLORS.primaryDark]} style={styles.logoCircle}>
              <Text style={styles.logoText}>LP</Text>
            </GradientView>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }] }}>
            <Text style={styles.appName}>Lewis</Text>
            <Text style={styles.appNameAccent}>Prono AI</Text>
            <Text style={styles.tagline}>Pronostics sportifs intelligents boostes par l'IA</Text>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>
            <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Login')}>
              <GradientView colors={[COLORS.primary, COLORS.primaryDark]} style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Commencer</Text>
              </GradientView>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Login', { isRegister: false })}>
              <Text style={styles.secondaryBtnText}>Deja un compte ? Se connecter</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </GradientView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', ...SHADOWS.large, marginBottom: 24, alignSelf: 'center' },
  logoText: { fontSize: 32, fontWeight: '800', color: '#0C0F1A', letterSpacing: 2 },
  appName: { fontSize: 38, fontWeight: '300', color: COLORS.text, textAlign: 'center', letterSpacing: 3 },
  appNameAccent: { fontSize: 44, fontWeight: '800', color: COLORS.primary, textAlign: 'center', letterSpacing: 2, marginTop: -6 },
  tagline: { fontSize: FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 12, marginBottom: 40, lineHeight: 22 },
  primaryBtn: { borderRadius: 16, paddingVertical: 18, alignItems: 'center', ...SHADOWS.medium },
  primaryBtnText: { color: '#0C0F1A', fontSize: FONTS.subtitle, fontWeight: '800', letterSpacing: 1 },
  secondaryBtn: { marginTop: 16, padding: 12, alignItems: 'center' },
  secondaryBtnText: { color: COLORS.textSecondary, fontSize: FONTS.caption },
});

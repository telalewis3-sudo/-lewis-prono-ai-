import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import GradientView from '../utils/GradientView';
import { COLORS, FONTS, SCREEN_WIDTH, SCREEN_HEIGHT, SHADOWS } from '../utils/constants';

const { width } = Dimensions.get('window');

export default function WelcomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <GradientView
        colors={['#0C0F1A', '#1A1F2E', '#232A3D']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <GradientView
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.logoCircle}
            >
              <Text style={styles.logoText}>LP</Text>
            </GradientView>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <Text style={styles.appName}>Lewis</Text>
            <Text style={styles.appNameAccent}>Prono AI</Text>
            <Text style={styles.tagline}>
              Pronostics sportifs intelligents{'\n'}boostés par l'intelligence artificielle
            </Text>
          </Animated.View>

          <Animated.View style={[styles.featuresContainer, { opacity: fadeAnim }]}>
            {[
              { icon: '🎯', text: 'Pronostics IA precision 85%' },
              { icon: '🏆', text: 'Tous les championnats + CDM 2026' },
              { icon: '🔒', text: 'Codes promo bookmakers' },
              { icon: '📊', text: 'Analyses temps reel' },
            ].map((f, i) => (
              <Animated.View
                key={i}
                style={[styles.featureRow, {
                  opacity: fadeAnim,
                  transform: [{
                    translateX: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 + i * 20, 0],
                    })
                  }]
                }]}
              >
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </Animated.View>
            ))}
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%' }}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => navigation.navigate('Login')}
            >
              <GradientView
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>Commencer</Text>
              </GradientView>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate('Login', { screen: 'Login', isRegister: true })}
            >
              <Text style={styles.secondaryBtnText}>Deja un compte ? Se connecter</Text>
            </TouchableOpacity>
        </Animated.View>

        </View>

        <Animated.View style={[styles.decorCircle1, { opacity: fadeAnim }]} />
        <Animated.View style={[styles.decorCircle2, { opacity: fadeAnim }]} />
      </GradientView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, zIndex: 10 },
  logoContainer: { marginBottom: 30 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: 'center', alignItems: 'center',
    ...SHADOWS.large,
  },
  logoText: { fontSize: 36, fontWeight: '800', color: '#0C0F1A', letterSpacing: 2 },
  appName: { fontSize: 42, fontWeight: '300', color: COLORS.text, textAlign: 'center', letterSpacing: 3 },
  appNameAccent: { fontSize: 48, fontWeight: '800', color: COLORS.primary, textAlign: 'center', letterSpacing: 2, marginTop: -8 },
  tagline: { fontSize: FONTS.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 15, lineHeight: 24 },
  featuresContainer: { width: '100%', marginTop: 40, marginBottom: 40 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  featureIcon: { fontSize: 20, marginRight: 12 },
  featureText: { fontSize: FONTS.caption, color: COLORS.text, flex: 1 },
  primaryBtn: {
    borderRadius: 16, paddingVertical: 18, alignItems: 'center',
    ...SHADOWS.medium,
  },
  primaryBtnText: { color: '#0C0F1A', fontSize: FONTS.subtitle, fontWeight: '800', letterSpacing: 1 },
  secondaryBtn: { marginTop: 16, padding: 12, alignItems: 'center' },
  secondaryBtnText: { color: COLORS.textSecondary, fontSize: FONTS.caption },
  decorCircle1: {
    position: 'absolute', top: -100, right: -100,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: COLORS.primary + '08',
  },
  decorCircle2: {
    position: 'absolute', bottom: -80, left: -80,
    width: 250, height: 250, borderRadius: 125,
    backgroundColor: COLORS.secondary + '15',
  },
});

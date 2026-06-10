import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import GradientView from '../utils/GradientView';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS, APP_NAME } from '../utils/constants';

export default function LoginScreen({ route, navigation }) {
  const initialRegister = route?.params?.isRegister || false;
  const [isLogin, setIsLogin] = useState(!initialRegister);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(formScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
  }, []);

  async function handleSubmit() {
    if (!email || !password || (!isLogin && !username)) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }
    setLoading(true);
    try {
      let res;
      if (isLogin) {
        res = await authAPI.login(email, password);
      } else {
        res = await authAPI.register(username, email, password, promoCode);
      }
      await SecureStore.setItemAsync('auth_token', res.data.token);
      await SecureStore.setItemAsync('user_data', JSON.stringify(res.data.user));
      navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
    } catch (e) {
      const msg = e.response?.data?.error || 'Une erreur est survenue';
      Alert.alert('Erreur', msg);
    }
    setLoading(false);
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <GradientView
          colors={['#1A1F2E', '#0C0F1A']}
          style={styles.headerGradient}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={styles.backBtn}>
              <Text style={styles.backText}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.appName}>{APP_NAME}</Text>
            <Text style={styles.headerSubtitle}>
              {isLogin ? 'Connectez-vous a votre espace' : 'Creez votre compte gratuitement'}
            </Text>
          </Animated.View>
        </GradientView>

        <Animated.View style={[styles.formContainer, {
          opacity: fadeAnim,
          transform: [{ scale: formScale }]
        }]}>
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.tabActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[styles.tabText, isLogin && styles.tabTextActive]}>Connexion</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.tabActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[styles.tabText, !isLogin && styles.tabTextActive]}>Inscription</Text>
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nom d'utilisateur</Text>
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="Votre pseudo"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="votre@email.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Mot de passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeBtn}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Code promo (optionnel)</Text>
              <TextInput
                style={styles.input}
                value={promoCode}
                onChangeText={setPromoCode}
                placeholder="EX: 1XBET2026"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.9}
          >
            <GradientView
              colors={loading ? ['#5A6478', '#5A6478'] : [COLORS.primary, COLORS.primaryDark]}
              style={styles.submitGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>
                  {isLogin ? 'Se connecter' : "S'inscrire gratuitement"}
                </Text>
              )}
            </GradientView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchBtn}
            onPress={() => {
              setIsLogin(!isLogin);
              Animated.spring(formScale, {
                toValue: 0.95, friction: 8, useNativeDriver: true,
              }).start(() => {
                Animated.spring(formScale, { toValue: 1, friction: 8, useNativeDriver: true }).start();
              });
            }}
          >
            <Text style={styles.switchText}>
              {isLogin ? "Pas encore de compte ? S'inscrire" : 'Deja un compte ? Se connecter'}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.divider} />
          </View>

          <Text style={styles.secureText}>
            🔒 Connexion securisee — vos donnees sont protegees
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  headerGradient: { paddingTop: 60, paddingBottom: 40, paddingHorizontal: 24 },
  backBtn: { marginBottom: 20 },
  backText: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '600' },
  appName: { fontSize: 36, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  headerSubtitle: { fontSize: FONTS.body, color: COLORS.textSecondary, marginTop: 6 },
  formContainer: { marginTop: -20, marginHorizontal: 20, backgroundColor: COLORS.card, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.large },
  tabRow: { flexDirection: 'row', marginBottom: 24, backgroundColor: COLORS.surface, borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: COLORS.primary + '20' },
  tabText: { fontSize: FONTS.caption, color: COLORS.textMuted, fontWeight: '600' },
  tabTextActive: { color: COLORS.primary, fontWeight: '700' },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: FONTS.small, color: COLORS.textSecondary, marginBottom: 6, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, fontSize: FONTS.body,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
  },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  passwordInput: { flex: 1, padding: 16, fontSize: FONTS.body, color: COLORS.text },
  eyeBtn: { padding: 12 },
  eyeText: { fontSize: 18 },
  submitBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 8, ...SHADOWS.medium },
  submitBtnDisabled: { opacity: 0.7 },
  submitGradient: { paddingVertical: 18, alignItems: 'center' },
  submitText: { color: '#0C0F1A', fontSize: FONTS.body, fontWeight: '800', letterSpacing: 0.5 },
  switchBtn: { padding: 16, alignItems: 'center' },
  switchText: { color: COLORS.primary, fontSize: FONTS.caption, fontWeight: '600' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  divider: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { color: COLORS.textMuted, marginHorizontal: 12, fontSize: FONTS.small },
  secureText: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.small, lineHeight: 18 },
});

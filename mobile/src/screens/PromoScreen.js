import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Animated } from 'react-native';
import GradientView from '../utils/GradientView';
import { promoAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS, BOOKMAKERS } from '../utils/constants';

export default function PromoScreen() {
  const [code, setCode] = useState('');
  const [selectedBookmaker, setSelectedBookmaker] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  async function validateCode() {
    if (!code.trim() || !selectedBookmaker) {
      Alert.alert('Erreur', 'Veuillez entrer un code et selectionner un bookmaker');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await promoAPI.validate(code.trim(), selectedBookmaker);
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setResult(res.data);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    } catch (e) {
      setResult({ valid: false, message: 'Code promo invalide ou expire' });
    }
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <StatusBarSpacer />
      <GradientView colors={['#1A1F2E', '#0C0F1A']} style={styles.header}>
        <Text style={styles.headerTitle}>Code Promo</Text>
        <Text style={styles.headerSubtitle}>Activez l'acces premium gratuitement</Text>
      </GradientView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GradientView
          colors={['#232A3D', '#1A1F2E']}
          style={styles.formCard}
        >
          <Text style={styles.formTitle}>Choisissez votre bookmaker</Text>
          <View style={styles.bookmakerGrid}>
            {BOOKMAKERS.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.bookmakerBtn, selectedBookmaker === b.id && {
                  borderColor: b.accent,
                  backgroundColor: b.accent + '15',
                }]}
                onPress={() => setSelectedBookmaker(b.id)}
              >
                <View style={[styles.bookmakerDot, { backgroundColor: b.accent }]} />
                <Text style={[styles.bookmakerText, selectedBookmaker === b.id && { color: b.accent }]}>
                  {b.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formTitle}>Code promo</Text>
          <TextInput
            style={styles.input}
            value={code}
            onChangeText={setCode}
            placeholder="EX: 1XBET2026"
            placeholderTextColor={COLORS.textMuted}
            autoCapitalize="characters"
          />

          <TouchableOpacity
            style={[styles.validateBtn, (!code || !selectedBookmaker || loading) && styles.validateBtnDisabled]}
            onPress={validateCode}
            disabled={!code || !selectedBookmaker || loading}
            activeOpacity={0.9}
          >
            <GradientView
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.validateGradient}
            >
              {loading ? (
                <ActivityIndicator color="#0C0F1A" />
              ) : (
                <Text style={styles.validateText}>Activer mon code</Text>
              )}
            </GradientView>
          </TouchableOpacity>
        </GradientView>

        {result && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <GradientView
              colors={result.valid
                ? [COLORS.success + '20', COLORS.success + '08']
                : [COLORS.danger + '20', COLORS.danger + '08']
              }
              style={[styles.resultCard, {
                borderColor: result.valid ? COLORS.success : COLORS.danger
              }]}
            >
              <Text style={[styles.resultIcon, { color: result.valid ? COLORS.success : COLORS.danger }]}>
                {result.valid ? '✓' : '✗'}
              </Text>
              <Text style={[styles.resultTitle, { color: result.valid ? COLORS.success : COLORS.danger }]}>
                {result.valid ? 'Code valide !' : 'Code invalide'}
              </Text>
              <Text style={styles.resultMessage}>{result.message}</Text>
              {result.bonus && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>{result.bonus}</Text>
                </View>
              )}
            </GradientView>
          </Animated.View>
        )}

        <GradientView
          colors={['#232A3D', '#1A1F2E']}
          style={styles.infoCard}
        >
          <Text style={styles.infoTitle}>Comment obtenir un code ?</Text>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.infoText}>Inscrivez-vous sur 1xBet, BetPawa ou Melbet</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.infoText}>Contactez-nous pour recevoir votre code promo</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.infoText}>Activez-le dans cette application</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.infoText}>Profitez de l'acces premium 7 jours</Text>
          </View>
        </GradientView>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatusBarSpacer() {
  return <View style={{ height: 50, backgroundColor: '#1A1F2E' }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  headerSubtitle: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },
  content: { padding: 16 },
  formCard: {
    borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  formTitle: { fontSize: FONTS.body, color: COLORS.text, fontWeight: '600', marginBottom: 12, marginTop: 8 },
  bookmakerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  bookmakerBtn: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
  },
  bookmakerDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  bookmakerText: { color: COLORS.textSecondary, fontSize: FONTS.caption, fontWeight: '600' },
  input: {
    backgroundColor: COLORS.surface, borderRadius: 12, padding: 16, fontSize: 20,
    color: COLORS.text, borderWidth: 1, borderColor: COLORS.border,
    textAlign: 'center', letterSpacing: 4, fontWeight: '700',
  },
  validateBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 20, ...SHADOWS.medium },
  validateBtnDisabled: { opacity: 0.5 },
  validateGradient: { paddingVertical: 18, alignItems: 'center' },
  validateText: { color: '#0C0F1A', fontSize: FONTS.body, fontWeight: '800', letterSpacing: 0.5 },
  resultCard: {
    marginTop: 20, borderRadius: 20, padding: 24, alignItems: 'center',
    borderWidth: 1.5, ...SHADOWS.medium,
  },
  resultIcon: { fontSize: 48, fontWeight: '800', marginBottom: 8 },
  resultTitle: { fontSize: FONTS.subtitle, fontWeight: '800', marginBottom: 8 },
  resultMessage: { fontSize: FONTS.caption, color: COLORS.textSecondary, textAlign: 'center' },
  bonusBadge: {
    marginTop: 12, backgroundColor: COLORS.success + '20', borderRadius: 8,
    paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: COLORS.success,
  },
  bonusText: { color: COLORS.success, fontSize: FONTS.small, fontWeight: '700' },
  infoCard: {
    marginTop: 20, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  infoTitle: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.text, marginBottom: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepNumber: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  stepNumberText: { color: '#0C0F1A', fontWeight: '800', fontSize: FONTS.small },
  infoText: { fontSize: FONTS.caption, color: COLORS.textSecondary, flex: 1, lineHeight: 20 },
});

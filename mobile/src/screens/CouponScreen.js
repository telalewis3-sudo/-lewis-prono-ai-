import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, Animated } from 'react-native';
import GradientView from '../utils/GradientView';
import { predictionAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';
import * as SecureStore from 'expo-secure-store';

export default function CouponScreen() {
  const [coupon, setCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [minReliability, setMinReliability] = useState(60);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const historyAnim = useRef(new Animated.Value(0)).current;

  const reliabilityLevels = [45, 55, 60, 65, 70, 75];

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const data = await SecureStore.getItemAsync('coupon_history');
      if (data) setHistory(JSON.parse(data));
    } catch (e) {}
  }

  async function saveToHistory(couponData) {
    try {
      const updated = [{ ...couponData, generated_at: new Date().toISOString() }, ...history].slice(0, 10);
      setHistory(updated);
      await SecureStore.setItemAsync('coupon_history', JSON.stringify(updated));
    } catch (e) {}
  }

  async function generateCoupon() {
    setLoading(true);
    setCoupon(null);
    try {
      const res = await predictionAPI.getCoupon(null, minReliability, 5);
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setCoupon(res.data);
        saveToHistory(res.data);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    } catch (e) {
      setCoupon(null);
    }
    setLoading(false);
  }

  function toggleHistory() {
    setShowHistory(!showHistory);
    Animated.timing(historyAnim, {
      toValue: showHistory ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }

  return (
    <View style={styles.container}>
      <StatusBarSpacer />
      <GradientView colors={['#1A1F2E', '#0C0F1A']} style={styles.header}>
        <Text style={styles.headerTitle}>Generateur</Text>
        <Text style={styles.headerAccent}>de Coupon</Text>
        <Text style={styles.headerSubtitle}>Creez votre coupon de matchs</Text>
      </GradientView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.configCard}>
          <Text style={styles.configTitle}>Fiabilite minimale</Text>
          <Text style={styles.configValue}>{minReliability}%</Text>
          <View style={styles.sliderRow}>
            {reliabilityLevels.map(v => (
              <TouchableOpacity
                key={v}
                style={[styles.sliderBtn, minReliability === v && styles.sliderBtnActive]}
                onPress={() => setMinReliability(v)}
              >
                <Text style={[styles.sliderText, minReliability === v && styles.sliderTextActive]}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.generateBtn, loading && styles.generateBtnDisabled]}
            onPress={generateCoupon}
            disabled={loading}
            activeOpacity={0.9}
          >
            <GradientView colors={[COLORS.primary, COLORS.primaryDark]} style={styles.generateGradient}>
              {loading ? (
                <ActivityIndicator color="#0C0F1A" />
              ) : (
                <Text style={styles.generateText}>Generer un coupon</Text>
              )}
            </GradientView>
          </TouchableOpacity>
        </GradientView>

        {coupon && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.couponCard}>
              <View style={styles.couponHeader}>
                <Text style={styles.couponTitle}>Coupon #{coupon.coupon_id}</Text>
                {coupon.combined_reliability >= 65 && (
                  <View style={styles.highQualityBadge}>
                    <Text style={styles.highQualityText}>Haute qualite</Text>
                  </View>
                )}
              </View>

              <View style={styles.couponStats}>
                <View style={styles.couponStat}>
                  <Text style={styles.statValue}>{coupon.total_matches}</Text>
                  <Text style={styles.statLabel}>Matchs</Text>
                </View>
                <View style={styles.couponStatDivider} />
                <View style={styles.couponStat}>
                  <Text style={[styles.statValue, { color: COLORS.primary }]}>{coupon.combined_reliability}%</Text>
                  <Text style={styles.statLabel}>Fiabilite</Text>
                </View>
                <View style={styles.couponStatDivider} />
                <View style={styles.couponStat}>
                  <Text style={[styles.statValue, { color: COLORS.success }]}>{coupon.total_odds}</Text>
                  <Text style={styles.statLabel}>Cote totale</Text>
                </View>
              </View>

              <Text style={styles.matchesTitle}>Matchs du coupon:</Text>
              {coupon.matches.map((m, i) => (
                <View key={i} style={styles.matchRow}>
                  <View style={styles.matchInfo}>
                    <Text style={styles.matchText}>{m.match}</Text>
                    <Text style={styles.matchPred}>{m.prediction}</Text>
                  </View>
                  <View style={[styles.matchReliabBadge, {
                    backgroundColor: m.reliability >= 65 ? COLORS.success + '20' : COLORS.warning + '20',
                    borderColor: m.reliability >= 65 ? COLORS.success : COLORS.warning,
                  }]}>
                    <Text style={[styles.matchReliabText, {
                      color: m.reliability >= 65 ? COLORS.success : COLORS.warning
                    }]}>{m.reliability}%</Text>
                  </View>
                </View>
              ))}
            </GradientView>

            <TouchableOpacity style={styles.newCouponBtn} onPress={generateCoupon}>
              <Text style={styles.newCouponText}>Generer un nouveau coupon</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {!coupon && !loading && (
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoTitle}>Comment ca marche ?</Text>
            <Text style={styles.infoText}>
              1. Choisissez votre niveau de fiabilite{'\n'}
              2. Appuyez sur "Generer un coupon"{'\n'}
              3. L'IA selectionne les meilleurs matchs{'\n'}
              4. Utilisez ce coupon chez votre bookmaker
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.historyToggle} onPress={toggleHistory}>
          <Text style={styles.historyToggleText}>
            {showHistory ? '▼' : '▶'} Historique ({history.length})
          </Text>
        </TouchableOpacity>

        {showHistory && (
          <Animated.View style={{ opacity: historyAnim }}>
            {history.length > 0 ? history.map((h, i) => (
              <GradientView key={i} colors={['#232A3D', '#1A1F2E']} style={styles.historyCard}>
                <View style={styles.historyTop}>
                  <Text style={styles.historyId}>Coupon #{h.coupon_id}</Text>
                  <Text style={styles.historyDate}>
                    {h.generated_at ? new Date(h.generated_at).toLocaleDateString('fr-FR') : ''}
                  </Text>
                </View>
                <View style={styles.historyStats}>
                  <Text style={styles.historyStat}>{h.total_matches} matchs</Text>
                  <Text style={[styles.historyStat, { color: COLORS.primary }]}>{h.combined_reliability}%</Text>
                  <Text style={[styles.historyStat, { color: COLORS.success }]}>Cote: {h.total_odds}</Text>
                </View>
              </GradientView>
            )) : (
              <Text style={styles.noHistory}>Aucun coupon genere</Text>
            )}
          </Animated.View>
        )}

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
  headerTitle: { fontSize: 32, fontWeight: '300', color: COLORS.text, letterSpacing: 1 },
  headerAccent: { fontSize: 32, fontWeight: '800', color: COLORS.primary, letterSpacing: 1, marginTop: -6 },
  headerSubtitle: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },
  content: { padding: 16 },
  configCard: { borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.medium },
  configTitle: { fontSize: FONTS.body, color: COLORS.text, fontWeight: '600', marginBottom: 4 },
  configValue: { fontSize: 40, fontWeight: '800', color: COLORS.primary, textAlign: 'center', marginVertical: 10 },
  sliderRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  sliderBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  sliderBtnActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '20' },
  sliderText: { color: COLORS.textMuted, fontSize: FONTS.caption, fontWeight: '600' },
  sliderTextActive: { color: COLORS.primary, fontWeight: '700' },
  generateBtn: { borderRadius: 14, overflow: 'hidden', ...SHADOWS.medium },
  generateBtnDisabled: { opacity: 0.7 },
  generateGradient: { paddingVertical: 18, alignItems: 'center' },
  generateText: { color: '#0C0F1A', fontSize: FONTS.body, fontWeight: '800', letterSpacing: 0.5 },
  couponCard: { borderRadius: 20, padding: 20, marginTop: 20, borderWidth: 1, borderColor: COLORS.primary + '40', ...SHADOWS.large },
  couponHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  couponTitle: { fontSize: FONTS.subtitle, fontWeight: '800', color: COLORS.primary },
  highQualityBadge: { backgroundColor: COLORS.success + '20', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: COLORS.success },
  highQualityText: { color: COLORS.success, fontSize: FONTS.small, fontWeight: '700' },
  couponStats: { flexDirection: 'row', backgroundColor: COLORS.surface, borderRadius: 14, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border },
  couponStat: { flex: 1, alignItems: 'center' },
  couponStatDivider: { width: 1, backgroundColor: COLORS.border },
  statValue: { fontSize: 24, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONTS.small, color: COLORS.textMuted, marginTop: 4 },
  matchesTitle: { fontSize: FONTS.body, color: COLORS.text, fontWeight: '700', marginBottom: 12 },
  matchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  matchInfo: { flex: 1 },
  matchText: { color: COLORS.text, fontSize: FONTS.caption, fontWeight: '600' },
  matchPred: { color: COLORS.primary, fontSize: FONTS.small, marginTop: 2, fontWeight: '500' },
  matchReliabBadge: { borderRadius: 12, paddingVertical: 4, paddingHorizontal: 12, borderWidth: 1, marginLeft: 10 },
  matchReliabText: { fontSize: FONTS.small, fontWeight: '700' },
  newCouponBtn: { marginTop: 16, padding: 16, alignItems: 'center', borderRadius: 12, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.primary + '08' },
  newCouponText: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '700' },
  infoCard: { marginTop: 24, backgroundColor: COLORS.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: COLORS.border },
  infoIcon: { fontSize: 32, marginBottom: 12 },
  infoTitle: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  infoText: { fontSize: FONTS.caption, color: COLORS.textSecondary, lineHeight: 22 },
  historyToggle: { marginTop: 20, padding: 16, borderRadius: 12, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  historyToggleText: { color: COLORS.text, fontSize: FONTS.body, fontWeight: '700' },
  historyCard: { borderRadius: 12, padding: 16, marginTop: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  historyId: { color: COLORS.primary, fontWeight: '700', fontSize: FONTS.caption },
  historyDate: { color: COLORS.textMuted, fontSize: FONTS.small },
  historyStats: { flexDirection: 'row', gap: 16 },
  historyStat: { color: COLORS.textSecondary, fontSize: FONTS.small, fontWeight: '600' },
  noHistory: { color: COLORS.textMuted, textAlign: 'center', marginTop: 16, fontSize: FONTS.caption },
});

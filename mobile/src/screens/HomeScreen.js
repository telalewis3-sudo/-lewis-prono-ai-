import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Dimensions } from 'react-native';
import GradientView from '../utils/GradientView';
import { predictionAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS, APP_NAME, BOOKMAKERS } from '../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ total: 0, reliable: 0 });
  const [predictions, setPredictions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon apres-midi');
    else setGreeting('Bonsoir');

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(statsAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();

    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await predictionAPI.getAIPredictions();
      const preds = res.data.predictions || [];
      setPredictions(preds);
      setStats({
        total: preds.length,
        reliable: preds.filter(p => p.reliability >= 65).length,
      });
    } catch (e) {}
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const featuredPredictions = predictions.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBarBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <GradientView
          colors={['#1A1F2E', '#232A3D', '#0C0F1A']}
          style={styles.headerGradient}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.greeting}>{greeting} !</Text>
            <Text style={styles.appTitle}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>Pronostics IA en direct</Text>
          </Animated.View>
        </GradientView>

        <Animated.View
          style={[styles.statsContainer, {
            transform: [{ scale: statsAnim }]
          }]}
        >
          <GradientView
            colors={['#232A3D', '#1A1F2E']}
            style={styles.statsCard}
          >
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Matchs analyses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>{stats.reliable}</Text>
              <Text style={styles.statLabel}>Pronostics fiables</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.primary }]}>{predictions.length}</Text>
              <Text style={styles.statLabel}>Disponibles</Text>
            </View>
          </GradientView>
        </Animated.View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Pronostics du jour</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Pronostics')}>
            <Text style={styles.seeAll}>Voir tout</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.predictionsScroll}
          contentContainerStyle={styles.predictionsContent}
        >
          {featuredPredictions.length > 0 ? featuredPredictions.map((pred, i) => (
            <Animated.View
              key={i}
              style={[styles.predictionCard, { opacity: fadeAnim }]}
            >
              <GradientView
                colors={['#232A3D', '#1A1F2E']}
                style={styles.predictionGradient}
              >
                <View style={styles.predictionHeader}>
                  <View style={[styles.reliabilityBadge, {
                    backgroundColor: pred.reliability >= 75 ? COLORS.success :
                      pred.reliability >= 60 ? COLORS.warning : COLORS.danger
                  }]}>
                    <Text style={styles.reliabilityText}>{pred.reliability}%</Text>
                  </View>
                </View>
                <Text style={styles.predMatch}>{pred.match}</Text>
                <Text style={styles.predValue}>{pred.prediction}</Text>
                <View style={styles.predFooter}>
                  <Text style={styles.predLeague}>{pred.league || 'International'}</Text>
                  <Text style={styles.predOdds}>Cote: {pred.odds || '-'}</Text>
                </View>
              </GradientView>
            </Animated.View>
          )) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Aucun pronostic disponible</Text>
              <Text style={styles.emptySubtext}>Tirez pour actualiser</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bookmakers</Text>
        </View>

        <View style={styles.bookmakersGrid}>
          {BOOKMAKERS.map((b, i) => (
            <TouchableOpacity key={i} style={styles.bookmakerCard} activeOpacity={0.8}>
              <GradientView
                colors={[b.color + '99', b.color + '33']}
                style={styles.bookmakerGradient}
              >
                <Text style={[styles.bookmakerName, { color: b.accent }]}>{b.name}</Text>
              </GradientView>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Pronostics')}
            activeOpacity={0.8}
          >
            <GradientView
              colors={[COLORS.primary, COLORS.primaryDark]}
              style={styles.actionGradient}
            >
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Voir les pronostics</Text>
            </GradientView>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate('Coupon')}
            activeOpacity={0.8}
          >
            <View style={styles.actionOutline}>
              <Text style={styles.actionIcon}>📋</Text>
              <Text style={styles.actionTextOutline}>Generer un coupon</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function StatusBarBar() {
  return <View style={{ height: 50, backgroundColor: '#1A1F2E' }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerGradient: { paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  greeting: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginBottom: 4 },
  appTitle: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  subtitle: { fontSize: FONTS.body, color: COLORS.primary, marginTop: 2, fontWeight: '500' },
  statsContainer: { marginTop: -20, marginHorizontal: 20 },
  statsCard: {
    flexDirection: 'row', borderRadius: 16, padding: 20,
    ...SHADOWS.medium, borderWidth: 1, borderColor: COLORS.border,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 5 },
  statNumber: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONTS.small, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 25, marginBottom: 15, paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: FONTS.subtitle, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: FONTS.caption, color: COLORS.primary, fontWeight: '600' },
  predictionsScroll: { marginLeft: 20 },
  predictionsContent: { paddingRight: 20 },
  predictionCard: {
    width: CARD_WIDTH, marginRight: 12, borderRadius: 16, overflow: 'hidden',
    ...SHADOWS.medium,
  },
  predictionGradient: { padding: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16 },
  predictionHeader: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 },
  reliabilityBadge: { borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  reliabilityText: { color: '#fff', fontWeight: '700', fontSize: FONTS.small },
  predMatch: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  predValue: { fontSize: FONTS.caption, color: COLORS.primary, fontWeight: '600', marginBottom: 10 },
  predFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  predLeague: { fontSize: FONTS.small, color: COLORS.textMuted },
  predOdds: { fontSize: FONTS.small, color: COLORS.textMuted },
  emptyCard: {
    width: CARD_WIDTH, padding: 30, borderRadius: 16, backgroundColor: COLORS.card,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.body },
  emptySubtext: { color: COLORS.textMuted, fontSize: FONTS.small, marginTop: 6 },
  bookmakersGrid: {
    flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10,
  },
  bookmakerCard: {
    width: (width - 50) / 2, borderRadius: 12, overflow: 'hidden',
    ...SHADOWS.small,
  },
  bookmakerGradient: { padding: 16, alignItems: 'center' },
  bookmakerName: { fontSize: FONTS.caption, fontWeight: '700' },
  quickActions: { paddingHorizontal: 20, marginTop: 25, gap: 12 },
  actionBtn: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.small },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18 },
  actionIcon: { fontSize: 20, marginRight: 10 },
  actionText: { color: '#0C0F1A', fontSize: FONTS.body, fontWeight: '700' },
  actionOutline: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18,
    borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10',
  },
  actionTextOutline: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '700' },
});

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import GradientView from '../utils/GradientView';
import { predictionAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';

export default function PredictionsScreen({ navigation }) {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
    fetchPredictions();
  }, []);

  async function fetchPredictions() {
    setLoading(true);
    try {
      const res = await predictionAPI.getAIPredictions();
      setPredictions(res.data.predictions || []);
    } catch (e) {
      setPredictions([]);
    }
    setLoading(false);
  }

  const filters = [
    { key: 'all', label: 'Tous' },
    { key: 'high', label: 'Haute fiabilite' },
    { key: 'medium', label: 'Moyenne' },
    { key: 'low', label: 'Risque' },
  ];

  const filteredPredictions = predictions.filter(p => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'high') return p.reliability >= 75;
    if (selectedFilter === 'medium') return p.reliability >= 55 && p.reliability < 75;
    if (selectedFilter === 'low') return p.reliability < 55;
    return true;
  });

  const getConfidenceColor = (level) => {
    switch (level) {
      case 'Tres eleve': return COLORS.success;
      case 'Eleve': return COLORS.primary;
      case 'Moyen': return COLORS.warning;
      default: return COLORS.danger;
    }
  };

  const getReliabilityColor = (value) => {
    if (value >= 75) return COLORS.success;
    if (value >= 55) return COLORS.warning;
    return COLORS.danger;
  };

  const renderPrediction = ({ item, index }) => {
    const prob = item.probabilities || { home: 45, draw: 30, away: 25 };
    const total = prob.home + prob.draw + prob.away;
    const pHome = Math.round((prob.home / total) * 100);
    const pDraw = Math.round((prob.draw / total) * 100);
    const pAway = Math.round((prob.away / total) * 100);

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MatchDetail', { prediction: item })}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [20 + index * 5, 0] }) }] }}>
          <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.leagueBadge}>
                <Text style={styles.leagueText}>{item.league || 'International'}</Text>
              </View>
              <View style={[styles.reliabilityBadge, { backgroundColor: getReliabilityColor(item.reliability) }]}>
                <Text style={styles.reliabilityText}>{item.reliability}%</Text>
              </View>
            </View>

            <Text style={styles.matchText}>{item.match}</Text>
            <Text style={styles.predictionText}>
              Pronostic: <Text style={styles.predictionValue}>{item.prediction}</Text>
            </Text>

            <View style={styles.probBar}>
              <View style={[styles.probSegment, { flex: pHome, backgroundColor: COLORS.success, borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }]} />
              <View style={[styles.probSegment, { flex: pDraw, backgroundColor: COLORS.warning }]} />
              <View style={[styles.probSegment, { flex: pAway, backgroundColor: COLORS.info, borderTopRightRadius: 6, borderBottomRightRadius: 6 }]} />
            </View>
            <View style={styles.probLabels}>
              <Text style={[styles.probLabel, { color: COLORS.success }]}>1: {pHome}%</Text>
              <Text style={[styles.probLabel, { color: COLORS.warning }]}>N: {pDraw}%</Text>
              <Text style={[styles.probLabel, { color: COLORS.info }]}>2: {pAway}%</Text>
            </View>

            <View style={styles.cardFooter}>
              <View style={[styles.confidenceBadge, { borderColor: getConfidenceColor(item.confidence_level) }]}>
                <Text style={[styles.confidenceText, { color: getConfidenceColor(item.confidence_level) }]}>
                  {item.confidence_level || 'Moyen'}
                </Text>
              </View>
              {item.cote && (
                <Text style={styles.oddsText}>Cote: {item.cote}</Text>
              )}
              <Text style={styles.detailArrow}>›</Text>
            </View>
          </GradientView>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <StatusBarSpacer />
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Chargement des pronostics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBarSpacer />
      <GradientView colors={['#1A1F2E', '#0C0F1A']} style={styles.header}>
        <Text style={styles.headerTitle}>Pronostics</Text>
        <Text style={styles.headerSubtitle}>
          {filteredPredictions.length} pronostic{filteredPredictions.length > 1 ? 's' : ''} disponible{filteredPredictions.length > 1 ? 's' : ''}
        </Text>
      </GradientView>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, selectedFilter === f.key && styles.filterBtnActive]}
            onPress={() => setSelectedFilter(f.key)}
          >
            <Text style={[styles.filterText, selectedFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredPredictions}
        renderItem={renderPrediction}
        keyExtractor={(_, i) => i.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>Aucun pronostic disponible</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchPredictions}>
              <Text style={styles.retryText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </View>
  );
}

function StatusBarSpacer() {
  return <View style={{ height: 50, backgroundColor: '#1A1F2E' }} />;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  loadingText: { color: COLORS.textSecondary, marginTop: 16, fontSize: FONTS.caption },
  header: { paddingHorizontal: 24, paddingBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  headerSubtitle: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginTop: 4 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 12, gap: 8 },
  filterBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border },
  filterBtnActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  filterText: { color: COLORS.textMuted, fontSize: FONTS.small, fontWeight: '600' },
  filterTextActive: { color: COLORS.primary, fontWeight: '700' },
  list: { padding: 16, paddingTop: 4 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.medium },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  leagueBadge: { backgroundColor: COLORS.surface, borderRadius: 6, paddingVertical: 3, paddingHorizontal: 8 },
  leagueText: { color: COLORS.textMuted, fontSize: FONTS.small },
  reliabilityBadge: { borderRadius: 20, paddingVertical: 4, paddingHorizontal: 12 },
  reliabilityText: { color: '#fff', fontWeight: '700', fontSize: FONTS.small },
  matchText: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  predictionText: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginBottom: 12 },
  predictionValue: { color: COLORS.primary, fontWeight: '700' },
  probBar: { flexDirection: 'row', height: 12, borderRadius: 6, marginBottom: 8, overflow: 'hidden' },
  probSegment: { height: '100%' },
  probLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  probLabel: { fontSize: FONTS.small, fontWeight: '700' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confidenceBadge: { borderRadius: 6, borderWidth: 1, paddingVertical: 3, paddingHorizontal: 8 },
  confidenceText: { fontSize: FONTS.small, fontWeight: '600' },
  oddsText: { fontSize: FONTS.small, color: COLORS.textMuted },
  detailArrow: { fontSize: 22, color: COLORS.textMuted, fontWeight: '300' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 50, marginBottom: 16 },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.body },
  retryBtn: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: '#0C0F1A', fontWeight: '700', fontSize: FONTS.caption },
});

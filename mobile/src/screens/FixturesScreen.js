import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated } from 'react-native';
import GradientView from '../utils/GradientView';
import { highlightsAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS } from '../utils/constants';

export default function FixturesScreen({ navigation }) {
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadFixtures(); }, []);

  async function loadFixtures() {
    try {
      const res = await highlightsAPI.getUpcomingFixtures(7);
      setFixtures(res.data.fixtures || []);
    } catch (e) {}
    setLoading(false);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFixtures();
    setRefreshing(false);
  };

  function getDayLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    return days[d.getDay()] + ' ' + d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  function formatTime(dateStr) {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  return (
    <View style={styles.container}>
      <StatusBarBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <GradientView colors={['#1A1F2E', '#232A3D', '#0C0F1A']} style={styles.headerGradient}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Matchs a venir</Text>
          <Text style={styles.headerSubtitle}>7 prochains jours</Text>
        </GradientView>

        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chargement...</Text>
          </View>
        ) : fixtures.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyText}>Aucun match trouve</Text>
            <Text style={styles.emptySubtext}>Tirez pour actualiser</Text>
          </View>
        ) : (
          fixtures.map((day, idx) => (
            <View key={idx} style={styles.daySection}>
              <View style={styles.dayHeader}>
                <Text style={styles.dayLabel}>{getDayLabel(day.date)}</Text>
                <Text style={styles.dayCount}>{day.matches.length} matchs</Text>
              </View>
              {day.matches.map((m, i) => (
                <TouchableOpacity key={i} activeOpacity={0.85} style={styles.matchCard}
                  onPress={() => navigation.navigate('MatchDetail', {
                    prediction: {
                      match: `${m.home} vs ${m.away}`,
                      home: m.home, away: m.away,
                      prediction: m.score || '? - ?',
                      league: m.league || 'International',
                      date: m.date,
                      odds_h: m.odds_h, odds_d: m.odds_d, odds_a: m.odds_a,
                      reliability: 65,
                      probabilities: { home: 50, draw: 25, away: 25 },
                    }
                  })}
                >
                  <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.matchGradient}>
                    <View style={styles.matchHeader}>
                      <Text style={styles.matchLeague}>{m.league}</Text>
                      <Text style={styles.matchTime}>{formatTime(m.date)}</Text>
                    </View>
                    <View style={styles.matchTeams}>
                      <Text style={styles.teamName}>{m.home}</Text>
                      <Text style={styles.matchScore}>vs</Text>
                      <Text style={styles.teamName}>{m.away}</Text>
                    </View>
                    {m.odds_h && (
                      <View style={styles.oddsRow}>
                        <View style={styles.oddBox}><Text style={styles.oddLabel}>1</Text><Text style={styles.oddValue}>{m.odds_h}</Text></View>
                        <View style={styles.oddBox}><Text style={styles.oddLabel}>N</Text><Text style={styles.oddValue}>{m.odds_d}</Text></View>
                        <View style={styles.oddBox}><Text style={styles.oddLabel}>2</Text><Text style={styles.oddValue}>{m.odds_a}</Text></View>
                      </View>
                    )}
                  </GradientView>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}

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
  headerGradient: { paddingTop: 60, paddingBottom: 25, paddingHorizontal: 20 },
  backBtn: { marginBottom: 10 },
  backText: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: FONTS.body, color: COLORS.textSecondary, marginTop: 4 },
  daySection: { marginTop: 20, paddingHorizontal: 16 },
  dayHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 12, paddingHorizontal: 4,
  },
  dayLabel: { fontSize: FONTS.subtitle, fontWeight: '700', color: COLORS.primary },
  dayCount: { fontSize: FONTS.small, color: COLORS.textMuted, fontWeight: '600' },
  matchCard: { marginBottom: 10, borderRadius: 14, overflow: 'hidden', ...SHADOWS.small },
  matchGradient: { padding: 14, borderWidth: 1, borderColor: COLORS.border, borderRadius: 14 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  matchLeague: { fontSize: FONTS.small, color: COLORS.textMuted, fontWeight: '600' },
  matchTime: { fontSize: FONTS.small, color: COLORS.primary, fontWeight: '700' },
  matchTeams: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  teamName: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.text, flex: 1 },
  matchScore: { fontSize: FONTS.caption, color: COLORS.textMuted, fontWeight: '800', marginHorizontal: 12 },
  oddsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  oddBox: {
    backgroundColor: COLORS.surface, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 12,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  oddLabel: { fontSize: 9, color: COLORS.textMuted, fontWeight: '600' },
  oddValue: { fontSize: FONTS.small, color: COLORS.text, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 20 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: FONTS.body, color: COLORS.textSecondary },
  emptySubtext: { fontSize: FONTS.small, color: COLORS.textMuted, marginTop: 6 },
});

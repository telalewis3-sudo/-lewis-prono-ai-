import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated, Dimensions, Share, Easing, Linking, Image } from 'react-native';
import GradientView from '../utils/GradientView';
import { predictionAPI, favoritesAPI, highlightsAPI } from '../services/api';
import { getLiveFixtures, formatFixture } from '../services/liveApi';
import { COLORS, FONTS, SHADOWS, APP_NAME, BOOKMAKERS, SHARE_TEXT, WORLD_CUP_2026 } from '../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

const STAT_TEMPLATES = [
  { possession: [55,45], shots: [8,5], corners: [4,3] },
  { possession: [48,52], shots: [6,7], corners: [3,4] },
  { possession: [60,40], shots: [10,3], corners: [6,2] },
  { possession: [42,58], shots: [4,9], corners: [2,5] },
  { possession: [51,49], shots: [7,6], corners: [4,4] },
];

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({ total: 0, reliable: 0 });
  const [predictions, setPredictions] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [liveMatches, setLiveMatches] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [wcCountdown, setWcCountdown] = useState('');
  const [goalFlash, setGoalFlash] = useState(null);
  const [apiConnected, setApiConnected] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const goalOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Bonjour');
    else if (hour < 18) setGreeting('Bon apres-midi');
    else setGreeting('Bonsoir');

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(statsAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.03, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ),
    ]).start();

    loadAll();
    updateWCCountdown();
    const wcInterval = setInterval(updateWCCountdown, 60000);
    const liveInterval = setInterval(refreshLiveOnly, 30000);
    return () => { clearInterval(wcInterval); clearInterval(liveInterval); };
  }, []);

  async function loadAll() {
    await loadData();
    await loadFavorites();
    await fetchLiveScores();
    await fetchHighlights();
  }

  async function fetchLiveScores() {
    try {
      const fixtures = await getLiveFixtures();
      if (fixtures.length > 0) {
        const formatted = fixtures.map(formatFixture).filter(f => f.isLive);
        if (formatted.length > 0) {
          setLiveMatches(formatted.map((f, i) => ({
            ...f,
            stats: STAT_TEMPLATES[i % STAT_TEMPLATES.length],
          })));
          setApiConnected(true);
          return;
        }
      }
    } catch (e) {}
    setApiConnected(false);
    generateSimulatedScores();
  }

  async function fetchHighlights() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await highlightsAPI.getHighlights({ date: today, limit: 10 });
      if (res.data && res.data.highlights && res.data.highlights.length > 0) {
        setHighlights(res.data.highlights);
      }
    } catch (e) {}
  }

  async function refreshLiveOnly() {
    try {
      const fixtures = await getLiveFixtures();
      if (fixtures.length > 0) {
        const formatted = fixtures.map(formatFixture).filter(f => f.isLive);
        if (formatted.length > 0) {
          formatted.forEach(f => {
            const old = liveMatches.find(l => l.id === f.id);
            if (old && (f.scoreHome !== old.scoreHome || f.scoreAway !== old.scoreAway)) {
              setGoalFlash(f.id);
              Animated.sequence([
                Animated.timing(goalOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
                Animated.timing(goalOpacity, { toValue: 0, duration: 2500, useNativeDriver: true }),
              ]).start(() => setGoalFlash(null));
            }
          });
          setLiveMatches(formatted.map((f, i) => ({
            ...f, stats: STAT_TEMPLATES[i % STAT_TEMPLATES.length],
          })));
          setApiConnected(true);
          return;
        }
      }
    } catch (e) {}
    setLiveMatches(prev => prev.map(m => {
      if (m.status === 'upcoming') return m;
      let newMinute = m.minute + Math.floor(Math.random() * 8) + 2;
      if (newMinute > 95) newMinute = 95;
      let newHome = m.scoreHome, newAway = m.scoreAway;
      if (Math.random() < 0.2 && newMinute > 10) {
        if (Math.random() < 0.55) newHome++; else newAway++;
      }
      return { ...m, minute: newMinute, scoreHome: newHome, scoreAway: newAway };
    }));
  }

  function generateSimulatedScores() {
    const teams = [
      { h: 'Manchester City', a: 'Arsenal' }, { h: 'PSG', a: 'Marseille' },
      { h: 'Real Madrid', a: 'Barcelona' }, { h: 'Bayern Munich', a: 'Dortmund' },
      { h: 'AC Milan', a: 'Inter Milan' }, { h: 'Liverpool', a: 'Chelsea' },
    ];
    const now = new Date();
    const sim = teams.map((t, i) => ({
      id: 10000 + i,
      match: `${t.h} vs ${t.a}`,
      home: t.h, away: t.a,
      scoreHome: Math.floor(Math.random() * 3),
      scoreAway: Math.floor(Math.random() * 2),
      minute: Math.floor(Math.random() * 60) + 15,
      status: '1H',
      league: 'Championship (simule)',
      homeLogo: '', awayLogo: '',
      isLive: true,
      stats: STAT_TEMPLATES[i % STAT_TEMPLATES.length],
    }));
    setLiveMatches(sim);
  }

  function updateWCCountdown() {
    const now = new Date();
    const diff = WORLD_CUP_2026.getTime() - now.getTime();
    if (diff <= 0) { setWcCountdown('CDM 2026 commencee!'); return; }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    setWcCountdown(`${d}j ${h}h`);
  }

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

  async function loadFavorites() {
    const faves = await favoritesAPI.getFavorites();
    setFavorites(faves);
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  async function handleShare(pred) {
    try {
      await Share.share({
        message: SHARE_TEXT
          .replace('{match}', pred.match)
          .replace('{prediction}', pred.prediction)
          .replace('{reliability}', pred.reliability || '--'),
      });
    } catch (e) {}
  }

  const featuredPredictions = predictions.slice(0, 5);

  return (
    <View style={styles.container}>
      <StatusBarBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        <GradientView colors={['#1A1F2E', '#232A3D', '#0C0F1A']} style={styles.headerGradient}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <Text style={styles.greeting}>{greeting} !</Text>
            <Text style={styles.appTitle}>{APP_NAME}</Text>
            <Text style={styles.subtitle}>Pronostics IA en direct</Text>
            <View style={styles.wcBadge}>
              <Text style={styles.wcBadgeText}>🏆 CDM 2026: {wcCountdown}</Text>
            </View>
          </Animated.View>
        </GradientView>

        <Animated.View style={[styles.statsContainer, { transform: [{ scale: statsAnim }] }]}>
          <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.statsCard}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.total}</Text>
              <Text style={styles.statLabel}>Matchs</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.success }]}>{stats.reliable}</Text>
              <Text style={styles.statLabel}>Fiables</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: COLORS.primary }]}>{predictions.length}</Text>
              <Text style={styles.statLabel}>Dispos</Text>
            </View>
          </GradientView>
        </Animated.View>

        {liveMatches.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <View style={styles.liveSectionTitle}>
                <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
                <Text style={styles.sectionTitle}>  En Direct</Text>
              </View>
              <View style={styles.liveRight}>
                <Text style={styles.liveCount}>{liveMatches.length} matchs</Text>
                {apiConnected && (
                  <View style={styles.apiBadge}><Text style={styles.apiBadgeText}>API</Text></View>
                )}
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.predictionsScroll} contentContainerStyle={styles.predictionsContent}>
              {liveMatches.map((live) => {
                const progress = typeof live.minute === 'number' ? Math.min(live.minute / 95, 1) : 0;
                const isGoal = goalFlash === live.id;
                return (
                  <TouchableOpacity
                    key={live.id}
                    activeOpacity={0.9}
                    onPress={() => {
                      const pred = predictions.find(p => p.match === live.match) || {
                        match: live.match,
                        prediction: `${live.scoreHome} - ${live.scoreAway}`,
                        reliability: 70,
                        league: live.league,
                        probabilities: { home: 50, draw: 25, away: 25 },
                      };
                      navigation.navigate('MatchDetail', { prediction: pred });
                    }}
                  >
                    <Animated.View style={[styles.liveCard]}>
                      <GradientView colors={[COLORS.danger + '15', '#232A3D']} style={[styles.liveGradient, isGoal && styles.liveGoalFlash]}>
                        <View style={styles.liveLeagueRow}>
                          <Text style={styles.liveLeague}>{live.league || 'Direct'}</Text>
                        </View>

                        <View style={styles.liveProgressBar}>
                          <View style={[styles.liveProgressFill, { width: `${progress * 100}%` }]} />
                        </View>

                        <View style={styles.liveTeams}>
                          <View style={styles.liveTeamCol}>
                            <Text style={styles.liveTeamName}>{live.home}</Text>
                            <Text style={styles.liveStatSmall}>Poss: {live.stats?.possession[0] || 50}%</Text>
                            <Text style={styles.liveStatSmall}>Tirs: {live.stats?.shots[0] || 0}</Text>
                          </View>

                          <View style={styles.liveScoreCol}>
                            {isGoal && (
                              <Animated.View style={{ opacity: goalOpacity }}>
                                <Text style={styles.liveGoalText}>BUT!</Text>
                              </Animated.View>
                            )}
                            <View style={styles.liveScoreRow}>
                              <Animated.Text style={[styles.liveScore, { color: COLORS.text }]}>
                                {live.scoreHome}
                              </Animated.Text>
                              <Text style={styles.liveScoreSep}>-</Text>
                              <Animated.Text style={[styles.liveScore, { color: COLORS.text }]}>
                                {live.scoreAway}
                              </Animated.Text>
                            </View>
                            {typeof live.minute === 'number' && (
                              <View style={[styles.liveMinuteBadge, { backgroundColor: live.minute > 80 ? COLORS.danger + '40' : COLORS.success + '30' }]}>
                                <Text style={styles.liveMinute}>{live.minute}'</Text>
                              </View>
                            )}
                          </View>

                          <View style={styles.liveTeamCol}>
                            <Text style={[styles.liveTeamName, { textAlign: 'right' }]}>{live.away}</Text>
                            <Text style={[styles.liveStatSmall, { textAlign: 'right' }]}>Poss: {live.stats?.possession[1] || 50}%</Text>
                            <Text style={[styles.liveStatSmall, { textAlign: 'right' }]}>Tirs: {live.stats?.shots[1] || 0}</Text>
                          </View>
                        </View>
                      </GradientView>
                    </Animated.View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {favorites.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>♥ Mes favoris</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.predictionsScroll} contentContainerStyle={styles.predictionsContent}>
              {favorites.slice(0, 5).map((fav, i) => (
                <TouchableOpacity key={`fav-${i}`} activeOpacity={0.9} onPress={() => navigation.navigate('MatchDetail', { prediction: fav })}>
                  <Animated.View style={[styles.predictionCard, { opacity: fadeAnim }]}>
                    <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.predictionGradient}>
                      <Text style={styles.predMatch}>{fav.match}</Text>
                      <Text style={styles.predValue}>{fav.prediction}</Text>
                      <View style={styles.predFooter}>
                        <Text style={styles.predLeague}>{fav.league || 'International'}</Text>
                        <Text style={styles.predOdds}>{fav.reliability}%</Text>
                      </View>
                    </GradientView>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {highlights.length > 0 && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🎬 Highlights</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.predictionsScroll} contentContainerStyle={styles.predictionsContent}>
              {highlights.map((h) => (
                <TouchableOpacity key={h.id} activeOpacity={0.9} onPress={() => {
                  if (h.url) Linking.openURL(h.url).catch(() => {});
                }}>
                  <Animated.View style={[styles.highlightCard, { opacity: fadeAnim }]}>
                    <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.highlightGradient}>
                      {h.imgUrl && <Image source={{ uri: h.imgUrl }} style={styles.highlightThumb} />}
                      <Text style={styles.highlightTitle} numberOfLines={2}>{h.title}</Text>
                      {h.match && (
                        <View style={styles.highlightMatchRow}>
                          <Text style={styles.highlightMatchScore}>
                            {h.match.homeTeam?.name || '?'} vs {h.match.awayTeam?.name || '?'}
                            {h.match.state?.score?.current ? ` (${h.match.state.score.current})` : ''}
                          </Text>
                        </View>
                      )}
                      <View style={styles.highlightFooter}>
                        <Text style={styles.highlightSource}>{h.source}</Text>
                        <Text style={[styles.highlightType, {
                          color: h.type === 'VERIFIED' ? COLORS.success : COLORS.warning
                        }]}>{h.type === 'VERIFIED' ? '✅ Verifie' : '⏳ Recent'}</Text>
                      </View>
                    </GradientView>
                  </Animated.View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

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
            <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => navigation.navigate('MatchDetail', { prediction: pred })}>
              <Animated.View style={[styles.predictionCard, { opacity: fadeAnim }]}>
                <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.predictionGradient}>
                  <View style={styles.predictionHeader}>
                    <View style={[styles.reliabilityBadge, {
                      backgroundColor: pred.reliability >= 75 ? COLORS.success :
                        pred.reliability >= 60 ? COLORS.warning : COLORS.danger
                    }]}>
                      <Text style={styles.reliabilityText}>{pred.reliability}%</Text>
                    </View>
                    <TouchableOpacity onPress={() => handleShare(pred)} style={styles.shareBtn}>
                      <Text style={styles.shareIcon}>📤</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.predMatch}>{pred.match}</Text>
                  <Text style={styles.predValue}>{pred.prediction}</Text>
                  <View style={styles.predFooter}>
                    <Text style={styles.predLeague}>{pred.league || 'International'}</Text>
                    <Text style={styles.predOdds}>Cote: {pred.odds || '-'}</Text>
                  </View>
                </GradientView>
              </Animated.View>
            </TouchableOpacity>
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
              <GradientView colors={[b.color + '99', b.color + '33']} style={styles.bookmakerGradient}>
                <Text style={[styles.bookmakerName, { color: b.accent }]}>{b.name}</Text>
              </GradientView>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Pronostics')} activeOpacity={0.8}>
            <GradientView colors={[COLORS.primary, COLORS.primaryDark]} style={styles.actionGradient}>
              <Text style={styles.actionIcon}>🎯</Text>
              <Text style={styles.actionText}>Voir les pronostics</Text>
            </GradientView>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Coupon')} activeOpacity={0.8}>
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
  wcBadge: { marginTop: 12, backgroundColor: COLORS.surface, borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16, alignSelf: 'flex-start', borderWidth: 1, borderColor: COLORS.primary + '40' },
  wcBadgeText: { color: COLORS.primary, fontSize: FONTS.small, fontWeight: '700' },
  statsContainer: { marginTop: -20, marginHorizontal: 20 },
  statsCard: { flexDirection: 'row', borderRadius: 16, padding: 20, ...SHADOWS.medium, borderWidth: 1, borderColor: COLORS.border },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { width: 1, backgroundColor: COLORS.border, marginVertical: 5 },
  statNumber: { fontSize: 28, fontWeight: '800', color: COLORS.text },
  statLabel: { fontSize: FONTS.small, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 25, marginBottom: 15, paddingHorizontal: 20,
  },
  liveSectionTitle: { flexDirection: 'row', alignItems: 'center' },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.danger },
  liveRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveCount: { fontSize: FONTS.small, color: COLORS.textMuted, fontWeight: '600' },
  apiBadge: { backgroundColor: COLORS.success + '30', borderRadius: 6, paddingVertical: 2, paddingHorizontal: 6, borderWidth: 1, borderColor: COLORS.success },
  apiBadgeText: { color: COLORS.success, fontSize: 8, fontWeight: '800' },
  sectionTitle: { fontSize: FONTS.subtitle, fontWeight: '700', color: COLORS.text },
  seeAll: { fontSize: FONTS.caption, color: COLORS.primary, fontWeight: '600' },
  predictionsScroll: { marginLeft: 20 },
  predictionsContent: { paddingRight: 20 },
  predictionCard: { width: CARD_WIDTH, marginRight: 12, borderRadius: 16, overflow: 'hidden', ...SHADOWS.medium },
  predictionGradient: { padding: 16, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16 },
  predictionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reliabilityBadge: { borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 },
  reliabilityText: { color: '#fff', fontWeight: '700', fontSize: FONTS.small },
  shareBtn: { padding: 4 },
  shareIcon: { fontSize: 16 },
  predMatch: { fontSize: FONTS.body, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  predValue: { fontSize: FONTS.caption, color: COLORS.primary, fontWeight: '600', marginBottom: 10 },
  predFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  predLeague: { fontSize: FONTS.small, color: COLORS.textMuted },
  predOdds: { fontSize: FONTS.small, color: COLORS.textMuted },
  emptyCard: { width: CARD_WIDTH, padding: 30, borderRadius: 16, backgroundColor: COLORS.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  emptyText: { color: COLORS.textSecondary, fontSize: FONTS.body },
  emptySubtext: { color: COLORS.textMuted, fontSize: FONTS.small, marginTop: 6 },
  bookmakersGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 10 },
  bookmakerCard: { width: (width - 50) / 2, borderRadius: 12, overflow: 'hidden', ...SHADOWS.small },
  bookmakerGradient: { padding: 16, alignItems: 'center' },
  bookmakerName: { fontSize: FONTS.caption, fontWeight: '700' },
  quickActions: { paddingHorizontal: 20, marginTop: 25, gap: 12 },
  actionBtn: { borderRadius: 16, overflow: 'hidden', ...SHADOWS.small },
  actionGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18 },
  actionIcon: { fontSize: 20, marginRight: 10 },
  actionText: { color: '#0C0F1A', fontSize: FONTS.body, fontWeight: '700' },
  actionOutline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  actionTextOutline: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '700' },
  liveCard: { width: CARD_WIDTH + 10, marginRight: 12, borderRadius: 16, overflow: 'hidden', ...SHADOWS.large },
  liveGradient: { padding: 14, borderWidth: 1, borderColor: COLORS.danger + '30', borderRadius: 16 },
  liveGoalFlash: { borderColor: '#FFD700', borderWidth: 2 },
  liveLeagueRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  liveLeague: { fontSize: FONTS.small, color: COLORS.textMuted, fontWeight: '600' },
  liveProgressBar: { height: 3, backgroundColor: COLORS.surface, borderRadius: 2, marginBottom: 12, overflow: 'hidden' },
  liveProgressFill: { height: '100%', backgroundColor: COLORS.danger, borderRadius: 2 },
  liveTeams: { flexDirection: 'row', alignItems: 'center' },
  liveTeamCol: { flex: 1 },
  liveTeamName: { fontSize: FONTS.small, color: COLORS.text, fontWeight: '700', marginBottom: 4 },
  liveStatSmall: { fontSize: 9, color: COLORS.textMuted, marginBottom: 2 },
  liveScoreCol: { alignItems: 'center', marginHorizontal: 12 },
  liveGoalText: { fontSize: 20, fontWeight: '900', color: '#FFD700', letterSpacing: 2, marginBottom: 2 },
  liveScoreRow: { flexDirection: 'row', alignItems: 'center' },
  liveScore: { fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  liveScoreSep: { fontSize: 22, fontWeight: '800', color: COLORS.textMuted, marginHorizontal: 4 },
  liveMinuteBadge: { borderRadius: 8, paddingVertical: 2, paddingHorizontal: 8, marginTop: 4 },
  liveMinute: { fontSize: 10, fontWeight: '800', color: COLORS.text },
  highlightCard: { width: CARD_WIDTH, marginRight: 12, borderRadius: 16, overflow: 'hidden', ...SHADOWS.medium },
  highlightGradient: { padding: 12, borderWidth: 1, borderColor: COLORS.border, borderRadius: 16 },
  highlightThumb: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8, backgroundColor: COLORS.surface },
  highlightTitle: { fontSize: FONTS.small, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  highlightMatchRow: { marginBottom: 4 },
  highlightMatchScore: { fontSize: 10, color: COLORS.textSecondary },
  highlightFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  highlightSource: { fontSize: 9, color: COLORS.textMuted, textTransform: 'uppercase' },
  highlightType: { fontSize: 9, fontWeight: '600' },
});

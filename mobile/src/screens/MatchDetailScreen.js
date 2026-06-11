import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Share, Platform } from 'react-native';
import GradientView from '../utils/GradientView';
import { COLORS, FONTS, SHADOWS, SHARE_TEXT } from '../utils/constants';
import { favoritesAPI } from '../services/api';

export default function MatchDetailScreen({ route, navigation }) {
  const { prediction } = route.params;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [isFavorite, setIsFavorite] = React.useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    checkFavorite();
  }, []);

  async function checkFavorite() {
    const faves = await favoritesAPI.getFavorites();
    setIsFavorite(faves.some(f => f.match === prediction.match));
  }

  async function toggleFavorite() {
    if (isFavorite) {
      await favoritesAPI.removeFavorite(prediction.match);
      setIsFavorite(false);
    } else {
      await favoritesAPI.addFavorite(prediction);
      setIsFavorite(true);
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        message: SHARE_TEXT
          .replace('{match}', prediction.match)
          .replace('{prediction}', prediction.prediction)
          .replace('{reliability}', prediction.reliability || '--'),
      });
    } catch (e) {}
  }

  const prob = prediction.probabilities || { home: 45, draw: 30, away: 25 };
  const total = prob.home + prob.draw + prob.away;
  const pHome = Math.round((prob.home / total) * 100);
  const pDraw = Math.round((prob.draw / total) * 100);
  const pAway = Math.round((prob.away / total) * 100);

  return (
    <View style={styles.container}>
      <GradientView colors={['#1A1F2E', '#0C0F1A']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analyse du match</Text>
      </GradientView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.matchCard}>
            {prediction.league && (
              <Text style={styles.league}>{prediction.league}</Text>
            )}
            <Text style={styles.matchTitle}>{prediction.match}</Text>
            <View style={[styles.reliabilityBadge, {
              backgroundColor: prediction.reliability >= 75 ? COLORS.success :
                prediction.reliability >= 55 ? COLORS.warning : COLORS.danger
            }]}>
              <Text style={styles.reliabilityText}>
                Fiabilite: {prediction.reliability}%
              </Text>
            </View>
          </GradientView>

          <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.card}>
            <Text style={styles.cardTitle}>Pronostic</Text>
            <Text style={styles.predictionValue}>{prediction.prediction}</Text>
            {prediction.cote && (
              <Text style={styles.cote}>Cote: {prediction.cote}</Text>
            )}
            <View style={[styles.confidenceBadge, {
              borderColor: prediction.confidence_level === 'Tres eleve' ? COLORS.success :
                prediction.confidence_level === 'Eleve' ? COLORS.primary :
                prediction.confidence_level === 'Moyen' ? COLORS.warning : COLORS.danger,
            }]}>
              <Text style={[styles.confidenceText, {
                color: prediction.confidence_level === 'Tres eleve' ? COLORS.success :
                  prediction.confidence_level === 'Eleve' ? COLORS.primary :
                  prediction.confidence_level === 'Moyen' ? COLORS.warning : COLORS.danger,
              }]}>
                Confiance: {prediction.confidence_level || 'Moyen'}
              </Text>
            </View>
          </GradientView>

          <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.card}>
            <Text style={styles.cardTitle}>Probabilites</Text>
            <View style={styles.probBar}>
              <View style={[styles.probSegment, { flex: pHome, backgroundColor: COLORS.success, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }]} />
              <View style={[styles.probSegment, { flex: pDraw, backgroundColor: COLORS.warning }]} />
              <View style={[styles.probSegment, { flex: pAway, backgroundColor: COLORS.info, borderTopRightRadius: 8, borderBottomRightRadius: 8 }]} />
            </View>
            <View style={styles.probLabels}>
              <View style={styles.probLabelItem}>
                <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.probLabelText}>1 (Dom.) {pHome}%</Text>
              </View>
              <View style={styles.probLabelItem}>
                <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.probLabelText}>Nul {pDraw}%</Text>
              </View>
              <View style={styles.probLabelItem}>
                <View style={[styles.dot, { backgroundColor: COLORS.info }]} />
                <Text style={styles.probLabelText}>2 (Ext.) {pAway}%</Text>
              </View>
            </View>
          </GradientView>

          <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.card}>
            <Text style={styles.cardTitle}>Analyse IA</Text>
            <Text style={styles.analysisText}>
              {prediction.reliability >= 75
                ? 'Analyse basee sur les performances recentes, confrontations directes et statistiques avancees. Pronostic haute confiance recommande pour le coupon.'
                : prediction.reliability >= 55
                ? 'Analyse moderee. Plusieurs facteurs concordent mais une incertitude subsiste. A utiliser avec prudence dans vos combinés.'
                : 'Incertitude elevee. Ce match presente des parametres contradictoires. Risque recommande uniquement pour les experts.'}
            </Text>
          </GradientView>

          <GradientView colors={['#232A3D', '#1A1F2E']} style={styles.card}>
            <Text style={styles.cardTitle}>Conseil</Text>
            <Text style={styles.analysisText}>
              {prediction.reliability >= 70
                ? '✅ Pronostic fiable — peut etre inclus dans vos coupons combines'
                : prediction.reliability >= 55
                ? '⚠️ Pronostic modere — combinez avec d\'autres matchs fiables'
                : '❌ Pronostic risque — evitez les gros montants'}
            </Text>
          </GradientView>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={toggleFavorite}>
              <GradientView colors={[isFavorite ? COLORS.danger + '30' : COLORS.surface, COLORS.surface]} style={styles.actionBtnGradient}>
                <Text style={styles.actionBtnText}>{isFavorite ? '♥ Retirer des favoris' : '♡ Ajouter aux favoris'}</Text>
              </GradientView>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={handleShare}>
              <GradientView colors={[COLORS.primary, COLORS.primaryDark]} style={styles.actionBtnGradient}>
                <Text style={[styles.actionBtnText, { color: '#0C0F1A' }]}>📤 Partager</Text>
              </GradientView>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 24 },
  backBtn: { marginBottom: 12 },
  backText: { color: COLORS.primary, fontSize: FONTS.body, fontWeight: '600' },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.text, letterSpacing: 1 },
  content: { padding: 16 },
  matchCard: { borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.large, marginBottom: 16 },
  league: { fontSize: FONTS.small, color: COLORS.textMuted, marginBottom: 8, fontWeight: '600' },
  matchTitle: { fontSize: 22, fontWeight: '800', color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  reliabilityBadge: { borderRadius: 20, paddingVertical: 6, paddingHorizontal: 16 },
  reliabilityText: { color: '#fff', fontWeight: '700', fontSize: FONTS.caption },
  card: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.medium, marginBottom: 16 },
  cardTitle: { fontSize: FONTS.body, color: COLORS.primary, fontWeight: '700', marginBottom: 12 },
  predictionValue: { fontSize: 24, fontWeight: '800', color: COLORS.text, marginBottom: 8 },
  cote: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginBottom: 8 },
  confidenceBadge: { borderRadius: 8, borderWidth: 1, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start' },
  confidenceText: { fontSize: FONTS.small, fontWeight: '700' },
  probBar: { flexDirection: 'row', height: 16, borderRadius: 8, marginBottom: 16, overflow: 'hidden' },
  probSegment: { height: '100%' },
  probLabels: { flexDirection: 'row', justifyContent: 'space-around' },
  probLabelItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  probLabelText: { fontSize: FONTS.small, color: COLORS.textSecondary, fontWeight: '600' },
  analysisText: { fontSize: FONTS.caption, color: COLORS.textSecondary, lineHeight: 22 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 32 },
  actionBtn: { flex: 1, borderRadius: 14, overflow: 'hidden', ...SHADOWS.small },
  actionBtnGradient: { padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 14 },
  actionBtnText: { color: COLORS.text, fontSize: FONTS.small, fontWeight: '700' },
});

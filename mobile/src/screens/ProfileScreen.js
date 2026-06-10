import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
import GradientView from '../utils/GradientView';
import * as SecureStore from 'expo-secure-store';
import { authAPI } from '../services/api';
import { COLORS, FONTS, SHADOWS, APP_NAME, APP_VERSION, BOOKMAKERS } from '../utils/constants';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(cardAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
    ]).start();
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await authAPI.profile();
      setUser(res.data);
    } catch (e) {
      setUser(null);
    }
    setLoading(false);
  }

  async function handleLogout() {
    Alert.alert(
      'Deconnexion',
      'Voulez-vous vraiment vous deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se deconnecter', style: 'destructive',
          onPress: async () => {
            await SecureStore.deleteItemAsync('auth_token');
            await SecureStore.deleteItemAsync('user_data');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }
        },
      ]
    );
  }

  const getBookmakerInfo = (bookmakerId) => {
    if (!bookmakerId) return null;
    return BOOKMAKERS.find(b => b.id === bookmakerId.toLowerCase());
  };

  return (
    <View style={styles.container}>
      <StatusBarSpacer />
      <GradientView colors={['#1A1F2E', '#0C0F1A']} style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
      </GradientView>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingAvatar} />
            <View style={styles.loadingLine} />
            <View style={[styles.loadingLine, { width: 150 }]} />
          </View>
        ) : user ? (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: cardAnim }] }}>
            <GradientView
              colors={['#232A3D', '#1A1F2E']}
              style={styles.profileCard}
            >
              <GradientView
                colors={[COLORS.primary, COLORS.primaryDark]}
                style={styles.avatar}
              >
                <Text style={styles.avatarText}>
                  {user.username?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </GradientView>
              <Text style={styles.username}>{user.username || 'Utilisateur'}</Text>
              <Text style={styles.email}>{user.email || ''}</Text>

              <View style={styles.badgeRow}>
                <View style={[styles.statusBadge, {
                  backgroundColor: user.premium ? COLORS.success + '20' : COLORS.textMuted + '20',
                  borderColor: user.premium ? COLORS.success : COLORS.textMuted,
                }]}>
                  <Text style={[styles.statusText, {
                    color: user.premium ? COLORS.success : COLORS.textMuted
                  }]}>
                    {user.premium ? 'Premium ✓' : 'Gratuit'}
                  </Text>
                </View>

                {user.bookmaker && (() => {
                  const bm = getBookmakerInfo(user.bookmaker);
                  return bm ? (
                    <View style={[styles.statusBadge, {
                      backgroundColor: bm.accent + '20',
                      borderColor: bm.accent,
                    }]}>
                      <Text style={[styles.statusText, { color: bm.accent }]}>{bm.name}</Text>
                    </View>
                  ) : null;
                })()}
              </View>

              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Statut</Text>
                  <Text style={[styles.infoValue, { color: user.premium ? COLORS.success : COLORS.textMuted }]}>
                    {user.premium ? 'Premium' : 'Gratuit'}
                  </Text>
                </View>
                {user.bookmaker && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Bookmaker</Text>
                    <Text style={styles.infoValue}>{BOOKMAKERS.find(b => b.id === user.bookmaker.toLowerCase())?.name || user.bookmaker}</Text>
                  </View>
                )}
                {user.promo_code && (
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Code promo</Text>
                    <Text style={[styles.infoValue, { color: COLORS.primary }]}>{user.promo_code}</Text>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Membre depuis</Text>
                  <Text style={styles.infoValue}>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Aujourdhui'}
                  </Text>
                </View>
              </View>
            </GradientView>

            <View style={styles.actionsSection}>
              <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Promo')}>
                <GradientView
                  colors={['#232A3D', '#1A1F2E']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionIcon}>🎁</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Activer un code promo</Text>
                    <Text style={styles.actionSubtitle}>Obtenez l'acces premium</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </GradientView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <GradientView
                  colors={['#232A3D', '#1A1F2E']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionIcon}>📊</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Mes statistiques</Text>
                    <Text style={styles.actionSubtitle}>Historique des pronostics</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </GradientView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <GradientView
                  colors={['#232A3D', '#1A1F2E']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionIcon}>⚙️</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Parametres</Text>
                    <Text style={styles.actionSubtitle}>Notifications, preference</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </GradientView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <GradientView
                  colors={['#232A3D', '#1A1F2E']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionIcon}>📊</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Mes statistiques</Text>
                    <Text style={styles.actionSubtitle}>Historique des pronostics</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </GradientView>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <GradientView
                  colors={['#232A3D', '#1A1F2E']}
                  style={styles.actionCardGradient}
                >
                  <Text style={styles.actionIcon}>⚙️</Text>
                  <View style={styles.actionInfo}>
                    <Text style={styles.actionTitle}>Parametres</Text>
                    <Text style={styles.actionSubtitle}>Notifications, preference</Text>
                  </View>
                  <Text style={styles.actionArrow}>›</Text>
                </GradientView>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Se deconnecter</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <View style={styles.notLoggedIn}>
            <Text style={styles.notLoggedIcon}>🔒</Text>
            <Text style={styles.notLoggedText}>Impossible de charger le profil</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
              <Text style={styles.retryText}>Reessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.version}>{APP_NAME} v{APP_VERSION}</Text>
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
  content: { padding: 16 },
  loadingContainer: { alignItems: 'center', padding: 40 },
  loadingAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.card, marginBottom: 16 },
  loadingLine: { height: 14, width: 200, backgroundColor: COLORS.card, borderRadius: 7, marginBottom: 8 },
  profileCard: {
    borderRadius: 24, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    ...SHADOWS.medium,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#0C0F1A' },
  username: { fontSize: FONTS.subtitle, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  email: { fontSize: FONTS.caption, color: COLORS.textSecondary, marginBottom: 16 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statusBadge: {
    borderRadius: 20, paddingVertical: 4, paddingHorizontal: 14,
    borderWidth: 1,
  },
  statusText: { fontSize: FONTS.small, fontWeight: '700' },
  infoSection: { width: '100%' },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  infoLabel: { fontSize: FONTS.caption, color: COLORS.textSecondary },
  infoValue: { fontSize: FONTS.caption, color: COLORS.text, fontWeight: '600' },
  actionsSection: { marginTop: 24, gap: 10 },
  actionCard: { borderRadius: 14, overflow: 'hidden', ...SHADOWS.small },
  actionCardGradient: {
    flexDirection: 'row', alignItems: 'center', padding: 18,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 14,
  },
  actionIcon: { fontSize: 24, marginRight: 14 },
  actionInfo: { flex: 1 },
  actionTitle: { fontSize: FONTS.body, color: COLORS.text, fontWeight: '600' },
  actionSubtitle: { fontSize: FONTS.small, color: COLORS.textMuted, marginTop: 2 },
  actionArrow: { fontSize: 24, color: COLORS.textMuted, fontWeight: '300' },
  logoutBtn: {
    marginTop: 24, borderRadius: 14, padding: 18, alignItems: 'center',
    backgroundColor: COLORS.danger + '15', borderWidth: 1, borderColor: COLORS.danger + '40',
  },
  logoutText: { color: COLORS.danger, fontSize: FONTS.body, fontWeight: '700' },
  notLoggedIn: { alignItems: 'center', padding: 40 },
  notLoggedIcon: { fontSize: 50, marginBottom: 16 },
  notLoggedText: { color: COLORS.textSecondary, fontSize: FONTS.body },
  retryBtn: { marginTop: 16, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 24 },
  retryText: { color: '#0C0F1A', fontWeight: '700', fontSize: FONTS.caption },
  version: { color: COLORS.textMuted, textAlign: 'center', marginTop: 24, fontSize: FONTS.small },
});

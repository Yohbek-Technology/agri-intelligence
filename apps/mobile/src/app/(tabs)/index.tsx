import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/hooks/use-theme';
import { AuthCard } from '@/components/auth/auth-card';
import { Spacing, MaxContentWidth } from '@/constants/theme';
import { API_BASE_URL } from '@/lib/config';

export default function HomeScreen() {
  const theme = useTheme();
  const { user, role, token, isAuthenticated, isLoading, signOut, refreshSession } = useAuth();
  const [signingOut, setSigningOut] = useState<boolean>(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Ping backend /health endpoint to show live server status
  useEffect(() => {
    let mounted = true;
    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (mounted) {
          setServerStatus(res.ok ? 'online' : 'offline');
        }
      } catch {
        if (mounted) setServerStatus('offline');
      }
    };
    void checkServer();
    const interval = setInterval(checkServer, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleSignOut = async () => {
    const doLogout = async () => {
      setSigningOut(true);
      try {
        await signOut();
      } finally {
        setSigningOut(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        await doLogout();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out of Agri Intelligence?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doLogout },
      ]);
    }
  };

  const getRoleBadge = () => {
    switch (role) {
      case 'da':
        return { label: 'Development Agent (DA)', color: '#0284C7', bg: '#E0F2FE' };
      case 'officer':
        return { label: 'Agricultural Officer', color: '#7C3AED', bg: '#EDE9FE' };
      case 'system_admin':
        return { label: 'System Admin', color: '#DC2626', bg: '#FEE2E2' };
      case 'farmer':
      default:
        return { label: 'Farmer / Producer', color: theme.primary, bg: theme.primarySubtle };
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingCenter, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
          Connecting to Agri Intelligence...
        </Text>
      </View>
    );
  }

  const roleInfo = getRoleBadge();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top App Header & Connectivity */}
        <View style={styles.headerRow}>
          <View>
            <View style={styles.brandRow}>
              <Text style={styles.brandLeaf}>🌿</Text>
              <Text style={[styles.brandTitle, { color: theme.text }]}>Agri Intelligence</Text>
            </View>
            <Text style={[styles.zoneSubtitle, { color: theme.textSecondary }]}>
              Adama Extension Zone • Oromia
            </Text>
          </View>

          {/* Server live indicator */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor:
                  serverStatus === 'online'
                    ? theme.primarySubtle
                    : serverStatus === 'offline'
                      ? theme.dangerLight
                      : theme.backgroundElement,
              },
            ]}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    serverStatus === 'online'
                      ? theme.primary
                      : serverStatus === 'offline'
                        ? theme.danger
                        : theme.accent,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    serverStatus === 'online'
                      ? theme.primary
                      : serverStatus === 'offline'
                        ? theme.danger
                        : theme.textSecondary,
                },
              ]}>
              {serverStatus === 'online' ? 'API Online' : serverStatus === 'offline' ? 'API Offline' : 'Connecting'}
            </Text>
          </View>
        </View>

        {/* AUTHENTICATED STATE */}
        {isAuthenticated && user ? (
          <View style={styles.authenticatedContainer}>
            {/* User Profile Card */}
            <View
              style={[
                styles.userCard,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.userCardHeader}>
                <View style={[styles.avatarCircle, { backgroundColor: theme.primarySubtle }]}>
                  <Text style={[styles.avatarText, { color: theme.primary }]}>
                    {user.name ? user.name.charAt(0).toUpperCase() : '👨‍🌾'}
                  </Text>
                </View>

                <View style={styles.userInfoCol}>
                  <Text style={[styles.userName, { color: theme.text }]}>{user.name || 'Agri Member'}</Text>
                  <Text style={[styles.userContact, { color: theme.textSecondary }]}>
                    {user.phoneNumber || user.email}
                  </Text>
                </View>

                <View style={[styles.roleBadge, { backgroundColor: roleInfo.bg }]}>
                  <Text style={[styles.roleBadgeText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
                </View>
              </View>

              {/* Meta pills */}
              <View style={styles.metaRow}>
                <View style={[styles.metaPill, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Language:</Text>
                  <Text style={[styles.metaValue, { color: theme.text }]}>
                    {user.preferredLanguage?.toUpperCase() || 'AM'}
                  </Text>
                </View>

                <View style={[styles.metaPill, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Auth:</Text>
                  <Text style={[styles.metaValue, { color: theme.primary }]}>Active Session</Text>
                </View>

                {user.cityOfficeId && (
                  <View style={[styles.metaPill, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={[styles.metaLabel, { color: theme.textSecondary }]}>Office:</Text>
                    <Text style={[styles.metaValue, { color: theme.text }]}>Adama Central</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Field Status & Weather Snippet */}
            <View style={[styles.fieldStatusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardSectionTitle, { color: theme.text }]}>🌱 Field Extension Advisory</Text>
                <Text style={[styles.seasonBadge, { color: theme.primary, backgroundColor: theme.primarySubtle }]}>
                  Meher Season
                </Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={styles.statIcon}>☀️</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>26°C</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Adama Forecast</Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={styles.statIcon}>💧</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>68%</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Soil Moisture</Text>
                </View>

                <View style={[styles.statBox, { backgroundColor: theme.backgroundElement }]}>
                  <Text style={styles.statIcon}>🌧️</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>15%</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Rain Chance</Text>
                </View>
              </View>
            </View>

            {/* Quick Actions Grid */}
            <Text style={[styles.sectionHeading, { color: theme.text }]}>Quick Operations</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => Alert.alert('Crop Diagnostic', 'Leaf diagnostic camera module ready for inspection.')}>
                <Text style={styles.actionIcon}>🔬</Text>
                <Text style={[styles.actionTitle, { color: theme.text }]}>Crop Diagnostics</Text>
                <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                  Analyze leaf pests, rust, or blight with AI
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => Alert.alert('Market Rates', 'Teff: 9,200 ETB/Quintal\nDurum Wheat: 6,400 ETB/Quintal')}>
                <Text style={styles.actionIcon}>📈</Text>
                <Text style={[styles.actionTitle, { color: theme.text }]}>Market Rates</Text>
                <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                  Live Adama & ECX commodity prices
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => Alert.alert('Extension Desk', 'Direct line to your Kebele DA specialist.')}>
                <Text style={styles.actionIcon}>📞</Text>
                <Text style={[styles.actionTitle, { color: theme.text }]}>Extension Desk</Text>
                <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                  Direct consultation with assigned DA
                </Text>
              </Pressable>

              <Pressable
                style={[styles.actionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => Alert.alert('Field Reports', 'Local tickets and observations synced.')}>
                <Text style={styles.actionIcon}>📋</Text>
                <Text style={[styles.actionTitle, { color: theme.text }]}>Field Records</Text>
                <Text style={[styles.actionDesc, { color: theme.textSecondary }]}>
                  Offline field logs & submission queue
                </Text>
              </Pressable>
            </View>

            {/* Sign Out Button */}
            <View style={styles.footerControls}>
              <Pressable
                style={[styles.signOutBtn, { borderColor: theme.danger }]}
                disabled={signingOut}
                onPress={handleSignOut}>
                {signingOut ? (
                  <ActivityIndicator color={theme.danger} size="small" />
                ) : (
                  <Text style={[styles.signOutBtnText, { color: theme.danger }]}>🚪 Sign Out of Mobile</Text>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          /* UNAUTHENTICATED STATE -> SHOW AUTH PORTAL */
          <View style={styles.unauthenticatedContainer}>
            {/* Hero Banner */}
            <View style={styles.heroBanner}>
              <Text style={[styles.heroHeadline, { color: theme.text }]}>
                Field Extension Authentication
              </Text>
              <Text style={[styles.heroSubheadline, { color: theme.textSecondary }]}>
                Sign in with your Ethiopian phone number or username to sync with the Agri Intelligence backend.
              </Text>
            </View>

            {/* Interactive Auth Card */}
            <AuthCard onSuccess={() => void refreshSession()} />

            {/* Offline & Security Guarantee */}
            <View style={styles.securityNote}>
              <Text style={[styles.securityText, { color: theme.textSecondary }]}>
                🔒 Secured with Better Auth session tokens & SMS OTP verification
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six + 40,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandLeaf: {
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  zoneSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  authenticatedContainer: {
    gap: Spacing.four,
  },
  userCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  userCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userContact: {
    fontSize: 13,
    marginTop: 2,
  },
  roleBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: Spacing.two,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
  },
  fieldStatusCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  seasonBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    gap: 2,
  },
  statIcon: {
    fontSize: 18,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  actionCard: {
    width: '48%',
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.three,
    gap: 6,
  },
  actionIcon: {
    fontSize: 26,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  footerControls: {
    marginTop: Spacing.four,
    alignItems: 'center',
  },
  signOutBtn: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
  },
  signOutBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  unauthenticatedContainer: {
    alignItems: 'center',
    gap: Spacing.four,
  },
  heroBanner: {
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
    marginVertical: Spacing.two,
  },
  heroHeadline: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSubheadline: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 380,
  },
  securityNote: {
    marginTop: Spacing.two,
  },
  securityText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii, TouchTargets } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VisualCard } from '@/components/common/VisualCard';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function AnnouncementsScreen() {
  const acknowledgeEmergency = () => {
    Alert.alert(
      'Emergency Directive Acknowledged',
      'Acknowledgement confirmed. Automated SMS fallback has been cancelled.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Official Agricultural Directives</Text>
          <Text style={styles.subtitle}>
            Announcements & emergency pest notices issued by the Adama City Agriculture Desk.
          </Text>
        </View>

        {/* Pinned Emergency Directive (COMM-1, COMM-3, COMM-5) */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <Text style={styles.emergencyBadge}>EMERGENCY DIRECTIVE</Text>
            <Text style={styles.emergencyDate}>Issued Today</Text>
          </View>
          <Text style={styles.emergencyTitle}>Migratory Fall Armyworm Quarantine Notice</Text>
          <Text style={styles.emergencyBody}>
            Active outbreaks confirmed in Kebele 01 and 02. All maize farmers must scout whorls and report symptoms immediately. Chemical spraying teams mobilized.
          </Text>

          <Pressable style={styles.ackButton} onPress={acknowledgeEmergency}>
            <Text style={styles.ackButtonText}>✓ Acknowledge Receipt (Stops SMS Fallback)</Text>
          </Pressable>
        </View>

        {/* Seasonal Farming Advisories */}
        <Text style={styles.sectionHeading}>Seasonal Farming Advice</Text>

        <VisualCard
          icon="📢"
          title="Subsidized Urea Distribution Schedule"
          subtitle="Primary Cooperatives starting distribution this Thursday for Kebele 01–05."
          value="Input Availability"
          badgeText="Published"
          badgeColor={Colors.light.primary}
          badgeBackground={Colors.light.primarySubtle}
          onAudioPress={() => {}}
        />

        <VisualCard
          icon="🌾"
          title="Certified Seed Variety Guidance"
          subtitle="Recommended varieties for Weyna Dega: Quncho Teff and Kakaba Bread Wheat."
          value="Agronomic Advice"
          badgeText="Seasonal"
          badgeColor={Colors.light.accent}
          badgeBackground={Colors.light.accentLight}
          onAudioPress={() => {}}
        />
      </ScrollView>
      <VoiceAssistant />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.seven,
  },
  header: {
    marginBottom: Spacing.three,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  emergencyCard: {
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: Colors.light.danger,
    borderRadius: Radii.card,
    padding: Spacing.four,
    marginVertical: Spacing.three,
  },
  emergencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  emergencyBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    backgroundColor: Colors.light.danger,
    paddingHorizontal: Spacing.two,
    paddingVertical: 2,
    borderRadius: Radii.small,
  },
  emergencyDate: {
    fontSize: 12,
    color: Colors.light.danger,
    fontWeight: '600',
  },
  emergencyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.danger,
    marginBottom: Spacing.one,
  },
  emergencyBody: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: Spacing.three,
  },
  ackButton: {
    backgroundColor: Colors.light.danger,
    borderRadius: Radii.large,
    height: TouchTargets.primaryButton,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ackButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.light.text,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
});

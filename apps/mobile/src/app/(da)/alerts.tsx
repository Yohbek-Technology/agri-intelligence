import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Radio, AlertOctagon, ScanLine, ShieldAlert, ArrowRight } from 'lucide-react-native';
import { useTranslation } from '@/i18n';

export default function DaAlertsScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [clusters, setClusters] = useState([
    {
      id: 'cluster-1',
      pest: 'Fall Armyworm (Spodoptera frugiperda)',
      severity: 'CRITICAL',
      reportsCount: 5,
      radiusKm: 3.5,
      kebele: 'Boku Shenen',
      advice: 'Immediate chemical spray containment window between 06:00 and 09:00 AM using approved Pyrethroid formulations.',
    },
    {
      id: 'cluster-2',
      pest: 'Yellow Rust (Puccinia striiformis)',
      severity: 'HIGH',
      reportsCount: 3,
      radiusKm: 6.0,
      kebele: 'Dire Dawa Peripheral',
      advice: 'Foliar fungicide application recommended on susceptible wheat cultivars before jointing stage.',
    },
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.alerts')}</Text>
        <Text style={styles.subtitle}>
          Active pest outbreak clusters automatically formed from 3+ reports
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {clusters.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View style={styles.iconCircle}>
                <AlertOctagon size={24} color="#DC2626" />
              </View>
              <View style={styles.pestInfo}>
                <Text style={styles.pestName}>{c.pest}</Text>
                <Text style={styles.kebeleText}>{c.kebele} Zone</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{c.reportsCount}</Text>
                <Text style={styles.statLabel}>Verified Reports</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{c.radiusKm} km</Text>
                <Text style={styles.statLabel}>Cluster Radius</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statValue, { color: '#DC2626' }]}>{c.severity}</Text>
                <Text style={styles.statLabel}>Threat Level</Text>
              </View>
            </View>

            <View style={styles.adviceBox}>
              <Text style={styles.adviceTitle}>Containment Directive:</Text>
              <Text style={styles.adviceText}>{c.advice}</Text>
            </View>

            <TouchableOpacity
              style={styles.reportBtn}
              onPress={() => router.push('/(farmer)/diagnose')}
              activeOpacity={0.8}
            >
              <ScanLine size={16} color="#FFFFFF" />
              <Text style={styles.reportBtnText}>Log New Field Diagnostic Case</Text>
              <ArrowRight size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#151A14',
  },
  subtitle: {
    fontSize: 13,
    color: '#566153',
    marginTop: 2,
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#FECACA',
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pestInfo: {
    flex: 1,
  },
  pestName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#991B1B',
  },
  kebeleText: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
  },
  statLabel: {
    fontSize: 10,
    color: '#71717A',
    fontWeight: '600',
    marginTop: 2,
  },
  adviceBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  adviceTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
    textTransform: 'uppercase',
  },
  adviceText: {
    fontSize: 13,
    color: '#374151',
    marginTop: 4,
    lineHeight: 18,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 12,
  },
  reportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});


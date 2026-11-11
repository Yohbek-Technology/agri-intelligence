import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertTriangle, Cloud, HardDrive } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';
import { syncEngine } from '@/database/sync';

export default function SyncStatusScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Today at 09:15 AM');
  const [pendingOps, setPendingOps] = useState([
    { id: '1', table: 'plots', type: 'INSERT', name: 'Northern Valley Plot', time: '10 mins ago' },
    { id: '2', table: 'farm_activities', type: 'INSERT', name: 'Plowing Pass #2', time: '5 mins ago' },
  ]);

  const [conflicts, setConflicts] = useState([
    {
      id: 'conf-1',
      table: 'plots',
      field: 'area_value',
      clientVal: '4.0 Timad',
      serverVal: '3.5 Timad (updated by DA)',
      reason: 'Concurrent modification during offline period',
    },
  ]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await syncEngine.syncNow();
      setLastSyncTime('Just now');
      setPendingOps([]);
    } catch {
      // Offline fallback
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResolveConflict = (id: string, resolution: 'MINE' | 'SERVER') => {
    setConflicts(conflicts.filter((c) => c.id !== id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('nav.sync')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Sync Summary Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Cloud size={24} color="#16A34A" />
            <View>
              <Text style={styles.statusTitle}>Offline Synchronisation Service</Text>
              <Text style={styles.lastSyncText}>Last synced: {lastSyncTime}</Text>
            </View>
          </View>

          <View style={styles.queueStats}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{pendingOps.length}</Text>
              <Text style={styles.statLabel}>Pending Writes</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNumber, conflicts.length > 0 && styles.conflictNumber]}>
                {conflicts.length}
              </Text>
              <Text style={styles.statLabel}>Active Conflicts</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.syncNowBtn}
            onPress={handleSyncNow}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.buttonInner}>
                <RefreshCw size={18} color="#FFFFFF" />
                <Text style={styles.syncNowText}>Sync With Office Now</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Conflicts Desk Section */}
        {conflicts.length > 0 && (
          <View style={styles.conflictSection}>
            <Text style={styles.sectionTitle}>Sync Conflicts Awaiting Decision (BR-15)</Text>
            {conflicts.map((c) => (
              <View key={c.id} style={styles.conflictCard}>
                <View style={styles.conflictHeader}>
                  <AlertTriangle size={18} color="#C78326" />
                  <Text style={styles.conflictTitle}>Table: {c.table} ({c.field})</Text>
                </View>
                <Text style={styles.conflictReason}>{c.reason}</Text>

                <View style={styles.diffBox}>
                  <View style={styles.diffCol}>
                    <Text style={styles.diffLabel}>Device (Your Version):</Text>
                    <Text style={styles.diffVal}>{c.clientVal}</Text>
                  </View>
                  <View style={styles.diffCol}>
                    <Text style={styles.diffLabel}>Server (Office Version):</Text>
                    <Text style={styles.diffVal}>{c.serverVal}</Text>
                  </View>
                </View>

                <View style={styles.conflictActions}>
                  <TouchableOpacity
                    style={[styles.resolveBtn, styles.mineBtn]}
                    onPress={() => handleResolveConflict(c.id, 'MINE')}
                  >
                    <Text style={styles.mineText}>Keep Mine</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.resolveBtn, styles.serverBtn]}
                    onPress={() => handleResolveConflict(c.id, 'SERVER')}
                  >
                    <Text style={styles.serverText}>Keep Server</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pending Operations Queue */}
        <Text style={styles.sectionTitle}>Pending Upload Queue</Text>
        {pendingOps.length === 0 ? (
          <View style={styles.emptyQueue}>
            <CheckCircle2 size={24} color="#16A34A" />
            <Text style={styles.emptyQueueText}>All local changes are fully synced to server.</Text>
          </View>
        ) : (
          pendingOps.map((op) => (
            <View key={op.id} style={styles.opCard}>
              <View style={styles.opLeft}>
                <HardDrive size={18} color="#566153" />
                <View>
                  <Text style={styles.opTitle}>{op.name}</Text>
                  <Text style={styles.opSub}>{op.table} • {op.type} • {op.time}</Text>
                </View>
              </View>
              <View style={styles.pendingBadge}>
                <Text style={styles.pendingBadgeText}>QUEUED</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
      <VoiceBar title={t('nav.sync')} readAloudText={t('nav.sync')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  scroll: {
    padding: 16,
    paddingBottom: 28,
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#151A14',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
  },
  queueStats: {
    flexDirection: 'row',
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '900',
    color: '#151A14',
  },
  conflictNumber: {
    color: '#DC2626',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#71717A',
    marginTop: 2,
  },
  syncNowBtn: {
    backgroundColor: '#16A34A',
    minHeight: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  syncNowText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  conflictSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
    marginVertical: 10,
  },
  conflictCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  conflictTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },
  conflictReason: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 10,
  },
  diffBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    gap: 6,
    marginBottom: 12,
  },
  diffCol: {
    gap: 2,
  },
  diffLabel: {
    fontSize: 11,
    color: '#71717A',
    fontWeight: '600',
  },
  diffVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
  },
  conflictActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resolveBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  mineBtn: {
    backgroundColor: '#16A34A',
  },
  serverBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
  },
  mineText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  serverText: {
    color: '#151A14',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyQueue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DCFCE7',
    padding: 16,
    borderRadius: 14,
  },
  emptyQueueText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  opCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 12,
    marginBottom: 8,
  },
  opLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  opTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
  },
  opSub: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  pendingBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pendingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
});


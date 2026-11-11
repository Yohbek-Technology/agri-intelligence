// M-31 DA Multi-Farmer Shared Device Mode
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { UserCheck, RefreshCw, LogOut, Sprout, PlusCircle, FileText } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { ConfirmSpoken } from '@/components/ConfirmSpoken';

export default function MultiFarmerModeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [activeFarmer, setActiveFarmer] = useState({
    id: params.farmerId || 'f-2',
    name: 'Almaz Ayana',
    localId: 'KB-2024-042',
    kebele: 'Boku Shenen',
    plots: 1,
  });

  const [confirmExit, setConfirmExit] = useState(false);

  const handleExitConfirm = () => {
    setConfirmExit(false);
    router.replace('/(da)/farmers');
  };

  return (
    <View style={styles.container}>
      {/* Persistent Multi-Farmer Shared Banner */}
      <View style={styles.sharedBanner}>
        <View style={styles.farmerIdentityRow}>
          <View style={styles.avatarCircle}>
            <UserCheck size={28} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.activeLabel}>{t('da.activeFarmer')}</Text>
            <Text style={styles.farmerName}>{activeFarmer.name}</Text>
            <Text style={styles.farmerSub}>
              {activeFarmer.localId} • {activeFarmer.kebele}
            </Text>
          </View>
        </View>

        <View style={styles.bannerControls}>
          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => router.push('/(da)/farmers')}
          >
            <RefreshCw size={14} color="#15803D" />
            <Text style={styles.switchText}>{t('da.switchFarmer')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => setConfirmExit(true)}
          >
            <LogOut size={14} color="#DC2626" />
            <Text style={styles.exitText}>{t('da.exitMode')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Shared Record Actions</Text>
        <Text style={styles.sectionSubtitle}>
          All records entered below are automatically stamped on behalf of this farmer.
        </Text>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/plots/new')}
          activeOpacity={0.8}
        >
          <Sprout size={32} color="#16A34A" />
          <View style={styles.actionCardText}>
            <Text style={styles.actionCardTitle}>Register Plot for Farmer</Text>
            <Text style={styles.actionCardSub}>Capture GPS coordinates, boundary, and soil profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/cycles/new')}
          activeOpacity={0.8}
        >
          <PlusCircle size={32} color="#16A34A" />
          <View style={styles.actionCardText}>
            <Text style={styles.actionCardTitle}>Log Crop Cycle & Inputs</Text>
            <Text style={styles.actionCardSub}>Record planting date, seed rate, and fertilizer dosage</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => router.push('/(farmer)/voice-box')}
          activeOpacity={0.8}
        >
          <FileText size={32} color="#16A34A" />
          <View style={styles.actionCardText}>
            <Text style={styles.actionCardTitle}>Submit Voice Complaint</Text>
            <Text style={styles.actionCardSub}>Record spoken input shortage or pest grievance</Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation on Exit */}
      <ConfirmSpoken
        visible={confirmExit}
        title="Exit Shared Mode?"
        message="Are you sure you want to stop operating on behalf of this farmer?"
        onConfirm={handleExitConfirm}
        onCancel={() => setConfirmExit(false)}
        confirmLabel="Exit Mode"
        cancelLabel="Continue Working"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  sharedBanner: {
    backgroundColor: '#DCFCE7',
    borderBottomWidth: 2,
    borderBottomColor: '#86EFAC',
    padding: 16,
    gap: 12,
  },
  farmerIdentityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
    textTransform: 'uppercase',
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  farmerSub: {
    fontSize: 12,
    color: '#374151',
  },
  bannerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#16A34A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minHeight: 56,
  },
  switchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    minHeight: 56,
  },
  exitText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#566153',
    marginTop: 2,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    gap: 16,
    elevation: 2,
    minHeight: 56,
  },
  actionCardText: {
    flex: 1,
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#151A14',
  },
  actionCardSub: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
    lineHeight: 16,
  },
});


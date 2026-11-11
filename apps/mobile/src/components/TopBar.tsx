import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Globe, RefreshCw, Wifi, WifiOff, UserCheck } from 'lucide-react-native';
import { useTranslation, LanguageCode } from '@/i18n';
import { Colors } from '@/constants/theme';

interface TopBarProps {
  activeFarmerName?: string | null;
  onSyncPress?: () => void;
}

export function TopBar({ activeFarmerName, onSyncPress }: TopBarProps) {
  const { language, setLanguage, t } = useTranslation();
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? false);
    });
    return () => unsubscribe();
  }, []);

  const languageOptions: { code: LanguageCode; label: string }[] = [
    { code: 'am', label: 'አማርኛ' },
    { code: 'om', label: 'Afaan Oromoo' },
    { code: 'ti', label: 'ትግርኛ' },
    { code: 'en', label: 'English' },
  ];

  return (
    <View style={styles.container}>
      {/* Network / Sync Status */}
      <TouchableOpacity
        style={[styles.statusBadge, isConnected ? styles.onlineBadge : styles.offlineBadge]}
        onPress={onSyncPress}
        activeOpacity={0.7}
      >
        {isSyncing ? (
          <RefreshCw size={16} color="#C78326" />
        ) : isConnected ? (
          <Wifi size={16} color="#16A34A" />
        ) : (
          <WifiOff size={16} color="#DC2626" />
        )}
        <Text
          style={[
            styles.statusText,
            { color: isConnected ? '#15803D' : '#DC2626' },
          ]}
        >
          {isSyncing ? t('common.syncing') : isConnected ? t('common.online') : t('common.offline')}
        </Text>
      </TouchableOpacity>

      {/* DA Shared Device / Active Farmer Banner */}
      {activeFarmerName && (
        <View style={styles.daFarmerPill}>
          <UserCheck size={14} color="#16A34A" />
          <Text style={styles.daFarmerText} numberOfLines={1}>
            {activeFarmerName}
          </Text>
        </View>
      )}

      {/* Language Switcher */}
      <TouchableOpacity
        style={styles.langButton}
        onPress={() => setShowLanguageModal(true)}
        activeOpacity={0.7}
      >
        <Globe size={16} color="#151A14" />
        <Text style={styles.langText}>
          {language.toUpperCase()}
        </Text>
      </TouchableOpacity>

      {/* Language Selector Modal */}
      <Modal visible={showLanguageModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('auth.selectLanguage')}</Text>
            {languageOptions.map((opt) => (
              <TouchableOpacity
                key={opt.code}
                style={[
                  styles.languageRow,
                  language === opt.code && styles.activeLanguageRow,
                ]}
                onPress={() => {
                  setLanguage(opt.code);
                  setShowLanguageModal(false);
                }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    language === opt.code && styles.activeLanguageOptionText,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={styles.closeModalText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FAF8F4',
    borderBottomWidth: 1,
    borderBottomColor: '#DFD9CB',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  onlineBadge: {
    backgroundColor: '#DCFCE7',
  },
  offlineBadge: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  daFarmerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#16A34A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: 160,
  },
  daFarmerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#151A14',
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#F0ECE1',
    borderRadius: 16,
  },
  langText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#151A14',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#151A14',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#FAF8F4',
  },
  activeLanguageRow: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1.5,
    borderColor: '#16A34A',
  },
  languageOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#151A14',
    textAlign: 'center',
  },
  activeLanguageOptionText: {
    color: '#15803D',
    fontWeight: '700',
  },
  closeModalButton: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeModalText: {
    fontSize: 14,
    color: '#566153',
    fontWeight: '600',
  },
});


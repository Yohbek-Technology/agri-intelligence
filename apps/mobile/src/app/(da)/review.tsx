import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Check, Edit3, X, AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { useTranslation } from '@/i18n';

interface FlaggedDiagnosis {
  id: string;
  farmer: string;
  crop: string;
  stage: string;
  aiSuggested: string;
  confidence: number;
  severity: 'HIGH' | 'CRITICAL' | 'MEDIUM';
  imageUrl: string;
  reasonFlagged: string;
}

export default function DaReviewQueueScreen() {
  const { t } = useTranslation();

  const [queue, setQueue] = useState<FlaggedDiagnosis[]>([
    {
      id: 'diag-rev-1',
      farmer: 'Kenisa Bekele (KB-2024-089)',
      crop: 'Wheat (Kakaba)',
      stage: 'Tillering',
      aiSuggested: 'Yellow Rust (Puccinia striiformis)',
      confidence: 0.68,
      severity: 'CRITICAL',
      imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80',
      reasonFlagged: 'High Severity quarantine pest & confidence below 75%',
    },
    {
      id: 'diag-rev-2',
      farmer: 'Almaz Ayana (KB-2024-042)',
      crop: 'Maize (BH-661)',
      stage: 'Vegetative',
      aiSuggested: 'Fall Armyworm (Spodoptera frugiperda)',
      confidence: 0.88,
      severity: 'HIGH',
      imageUrl: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80',
      reasonFlagged: 'Quarantine pest alert threshold triggered',
    },
  ]);

  const handleAction = (id: string, action: 'CONFIRM' | 'CORRECT' | 'REJECT') => {
    setQueue(queue.filter((q) => q.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('da.reviewQueue')}</Text>
        <Text style={styles.subtitle}>
          {queue.length} diagnoses require field verification before official registration
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {queue.length === 0 ? (
          <View style={styles.emptyContainer}>
            <ShieldCheck size={48} color="#16A34A" />
            <Text style={styles.emptyTitle}>Queue Cleared</Text>
            <Text style={styles.emptySub}>All flagged field diagnoses have been evaluated.</Text>
          </View>
        ) : (
          queue.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Image source={{ uri: item.imageUrl }} style={styles.photo} />
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.farmerName}>{item.farmer}</Text>
                  <Text style={styles.cropInfo}>
                    {item.crop} • {item.stage}
                  </Text>
                  <View style={styles.severityBadge}>
                    <AlertTriangle size={12} color="#DC2626" />
                    <Text style={styles.severityText}>
                      {item.severity} SEVERITY
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.aiResultBox}>
                <Text style={styles.aiTitle}>AI Identification:</Text>
                <Text style={styles.pestName}>{item.aiSuggested}</Text>
                <Text style={styles.confidenceText}>
                  Confidence: {Math.round(item.confidence * 100)}% • {item.reasonFlagged}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.confirmBtn]}
                  onPress={() => handleAction(item.id, 'CONFIRM')}
                >
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.btnText}>{t('da.confirm')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.correctBtn]}
                  onPress={() => handleAction(item.id, 'CORRECT')}
                >
                  <Edit3 size={16} color="#FFFFFF" />
                  <Text style={styles.btnText}>{t('da.correct')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.rejectBtn]}
                  onPress={() => handleAction(item.id, 'REJECT')}
                >
                  <X size={16} color="#FFFFFF" />
                  <Text style={styles.btnText}>{t('da.reject')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
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
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 30,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#151A14',
  },
  emptySub: {
    fontSize: 14,
    color: '#566153',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  photo: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
  },
  cardHeaderInfo: {
    flex: 1,
    gap: 3,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#151A14',
  },
  cropInfo: {
    fontSize: 13,
    color: '#566153',
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  aiResultBox: {
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
  },
  aiTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
  },
  pestName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#16A34A',
    marginTop: 2,
  },
  confidenceText: {
    fontSize: 12,
    color: '#566153',
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmBtn: {
    backgroundColor: '#16A34A',
  },
  correctBtn: {
    backgroundColor: '#C78326',
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});


import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Volume2, MapPin, CheckCircle, MessageSquare } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { audioService } from '@/services/audio';

export default function DaGrievancesScreen() {
  const { t, language } = useTranslation();

  const [grievances, setGrievances] = useState([
    {
      id: 'grv-1',
      farmer: 'Abebe Bikila (KB-2024-001)',
      category: 'FERTILIZER_SHORTAGE',
      categoryLabel: 'Fertilizer Shortage',
      severity: 'HIGH',
      age: '4 hours ago',
      transcript: 'Cooperative depot in Boku Shenen refused NPS distribution citing shortage.',
      status: 'ASSIGNED',
      plotLocation: 'Plot Eastern Parcel (8.5432 N, 39.2711 E)',
    },
    {
      id: 'grv-2',
      farmer: 'Kenisa Bekele (KB-2024-089)',
      category: 'WATER_CONFLICT',
      categoryLabel: 'Irrigation Water Conflict',
      severity: 'MEDIUM',
      age: '1 day ago',
      transcript: 'Canal diversion dispute at tertiary junction near river bend.',
      status: 'IN_PROGRESS',
      plotLocation: 'River Plot (8.5510 N, 39.2640 E)',
    },
  ]);

  const handlePlayVoice = (text: string) => {
    audioService.speak(text, language);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('nav.grievances')}</Text>
        <Text style={styles.subtitle}>
          Assigned complaints prioritized by severity and SLA age
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {grievances.map((g) => (
          <View key={g.id} style={styles.card}>
            <View style={styles.cardTop}>
              <View>
                <Text style={styles.farmerName}>{g.farmer}</Text>
                <Text style={styles.category}>{g.categoryLabel} • {g.age}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  g.status === 'ASSIGNED' ? styles.assignedBadge : styles.progressBadge,
                ]}
              >
                <Text style={styles.statusText}>{g.status}</Text>
              </View>
            </View>

            <View style={styles.transcriptBox}>
              <Text style={styles.transcriptText}>{g.transcript}</Text>
              <TouchableOpacity
                style={styles.playBtn}
                onPress={() => handlePlayVoice(g.transcript)}
              >
                <Volume2 size={16} color="#16A34A" />
                <Text style={styles.playBtnText}>Listen Voice Submission</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.locationRow}>
              <MapPin size={14} color="#566153" />
              <Text style={styles.locationText}>{g.plotLocation}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.replyButton}>
                <MessageSquare size={16} color="#FFFFFF" />
                <Text style={styles.replyButtonText}>Record Voice Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resolveButton}>
                <CheckCircle size={16} color="#15803D" />
                <Text style={styles.resolveButtonText}>Mark Resolved</Text>
              </TouchableOpacity>
            </View>
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
    borderColor: '#DFD9CB',
    elevation: 2,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#151A14',
  },
  category: {
    fontSize: 12,
    color: '#C78326',
    fontWeight: '700',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  assignedBadge: {
    backgroundColor: '#FEF3C7',
  },
  progressBadge: {
    backgroundColor: '#DCFCE7',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#151A14',
  },
  transcriptBox: {
    backgroundColor: '#FAF8F4',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  transcriptText: {
    fontSize: 13,
    color: '#151A14',
    lineHeight: 18,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  playBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  locationText: {
    fontSize: 12,
    color: '#566153',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0ECE1',
    paddingTop: 12,
  },
  replyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#16A34A',
    paddingVertical: 10,
    borderRadius: 12,
  },
  replyButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  resolveButtonText: {
    color: '#15803D',
    fontSize: 13,
    fontWeight: '700',
  },
});


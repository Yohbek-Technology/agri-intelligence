import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2, ChevronRight, Sprout, Sparkles, DollarSign, Activity } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { VoiceBar } from '@/components/VoiceBar';

const stages = [
  'LAND_PREPARATION',
  'PLANTING',
  'GROWING',
  'FLOWERING',
  'GRAIN_FILLING',
  'HARVEST',
] as const;

export default function CropCycleDetailScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [currentStageIndex, setCurrentStageIndex] = useState(2); // GROWING

  const cycle = {
    id: params.id || 'c-1',
    plotName: 'Boku Eastern Parcel',
    crop: 'Wheat (Kakaba)',
    season: '2024 Meher',
    plantedDate: 'July 14, 2024',
  };

  const handleAdvanceStage = () => {
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex(currentStageIndex + 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={22} color="#151A14" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{cycle.crop} ({cycle.season})</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* 6-Stage Interactive Growth Tracker */}
        <View style={styles.trackerCard}>
          <Text style={styles.trackerTitle}>Crop Growth Stage Timeline</Text>
          <View style={styles.stageTrack}>
            {stages.map((st, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <View key={st} style={styles.stageNode}>
                  <View
                    style={[
                      styles.nodeCircle,
                      isPast && styles.pastNode,
                      isCurrent && styles.currentNode,
                    ]}
                  >
                    {isPast ? (
                      <CheckCircle2 size={16} color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.nodeNum, isCurrent && styles.currentNodeNum]}>
                        {idx + 1}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.nodeLabel, isCurrent && styles.currentNodeLabel]} numberOfLines={1}>
                    {st.replace('_', ' ')}
                  </Text>
                </View>
              );
            })}
          </View>

          <TouchableOpacity
            style={styles.advanceButton}
            onPress={handleAdvanceStage}
            disabled={currentStageIndex === stages.length - 1}
          >
            <Text style={styles.advanceText}>
              Advance to Next Stage ({stages[currentStageIndex + 1]?.replace('_', ' ') || 'Completed'})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Tiles Grid */}
        <Text style={styles.sectionTitle}>Farm Operations & Logs</Text>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push(`/cycles/${cycle.id}/planting` as any)}
        >
          <View style={styles.tileLeft}>
            <Sprout size={24} color="#16A34A" />
            <View>
              <Text style={styles.tileTitle}>{t('agronomy.planting')}</Text>
              <Text style={styles.tileSub}>Planted: {cycle.plantedDate} • 120 kg seed</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#566153" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push(`/cycles/${cycle.id}/fertilizer` as any)}
        >
          <View style={styles.tileLeft}>
            <Activity size={24} color="#C78326" />
            <View>
              <Text style={styles.tileTitle}>{t('agronomy.fertilizer')}</Text>
              <Text style={styles.tileSub}>Basal NPS applied • Urea 1st top-dressing logged</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#566153" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push(`/cycles/${cycle.id}/activities` as any)}
        >
          <View style={styles.tileLeft}>
            <Activity size={24} color="#2563EB" />
            <View>
              <Text style={styles.tileTitle}>{t('agronomy.activities')}</Text>
              <Text style={styles.tileSub}>2 plowing passes, 1 manual weeding recorded</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#566153" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push(`/cycles/${cycle.id}/harvest` as any)}
        >
          <View style={styles.tileLeft}>
            <Sprout size={24} color="#15803D" />
            <View>
              <Text style={styles.tileTitle}>{t('agronomy.harvest')}</Text>
              <Text style={styles.tileSub}>Record quintals, date & grain moisture %</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#566153" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tile}
          onPress={() => router.push(`/cycles/${cycle.id}/finance` as any)}
        >
          <View style={styles.tileLeft}>
            <DollarSign size={24} color="#16A34A" />
            <View>
              <Text style={styles.tileTitle}>{t('agronomy.costsIncome')}</Text>
              <Text style={styles.tileSub}>Ledger in ETB & cycle profit/loss summary</Text>
            </View>
          </View>
          <ChevronRight size={20} color="#566153" />
        </TouchableOpacity>

        {/* AI Yield Gap Diagnostic Button */}
        <TouchableOpacity
          style={styles.yieldGapCard}
          onPress={() => router.push(`/cycles/${cycle.id}/yield-gap` as any)}
        >
          <Sparkles size={24} color="#FFFFFF" />
          <View style={styles.yieldGapTextWrapper}>
            <Text style={styles.yieldGapTitle}>{t('agronomy.yieldGap')}</Text>
            <Text style={styles.yieldGapSub}>Compare plot productivity vs top 25% peer benchmark</Text>
          </View>
          <ChevronRight size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </ScrollView>

      <VoiceBar
        title={cycle.crop}
        readAloudText={`${cycle.crop}. Current stage: ${stages[currentStageIndex].replace('_', ' ')}.`}
      />
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
  trackerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DFD9CB',
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  trackerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#151A14',
    marginBottom: 12,
  },
  stageTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stageNode: {
    alignItems: 'center',
    width: 48,
  },
  nodeCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F0ECE1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  pastNode: {
    backgroundColor: '#16A34A',
  },
  currentNode: {
    backgroundColor: '#C78326',
    borderWidth: 2,
    borderColor: '#78350F',
  },
  nodeNum: {
    fontSize: 12,
    fontWeight: '700',
    color: '#71717A',
  },
  currentNodeNum: {
    color: '#FFFFFF',
  },
  nodeLabel: {
    fontSize: 9,
    color: '#71717A',
    textAlign: 'center',
  },
  currentNodeLabel: {
    color: '#C78326',
    fontWeight: '800',
  },
  advanceButton: {
    backgroundColor: '#FAF8F4',
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  advanceText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#151A14',
    marginVertical: 10,
  },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    padding: 14,
    marginBottom: 10,
  },
  tileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tileTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#151A14',
  },
  tileSub: {
    fontSize: 12,
    color: '#566153',
    marginTop: 2,
  },
  yieldGapCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    gap: 12,
    elevation: 3,
  },
  yieldGapTextWrapper: {
    flex: 1,
  },
  yieldGapTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  yieldGapSub: {
    fontSize: 12,
    color: '#DCFCE7',
    marginTop: 2,
  },
});


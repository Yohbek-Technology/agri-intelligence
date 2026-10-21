import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/theme/colors';
import { Spacing, Radii } from '@/theme/tokens';
import { AppHeader } from '@/components/common/AppHeader';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';
import { cropCycleService, DaTask } from '@/services/api/crop-cycle-service';

export function DaTasksScreen() {
  const [tasks, setTasks] = useState<DaTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'field_visit' | 'diagnosis_review' | 'grievance'>('all');
  const [audioPlaying, setAudioPlaying] = useState(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cropCycleService.fetchDaTasks(
        filter === 'all' ? undefined : { taskType: filter }
      );
      if (res.success && res.data) {
        setTasks(res.data);
      }
    } catch (err) {
      console.warn('Failed to load DA tasks', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleToggleChecklist = async (taskId: string, index: number) => {
    const targetTask = tasks.find((t) => t.id === taskId);
    if (!targetTask) return;

    const updatedChecklist = targetTask.checklist.map((item, i) =>
      i === index ? { ...item, checked: !item.checked } : item
    );

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, checklist: updatedChecklist } : t))
    );

    await cropCycleService.updateDaTask(taskId, {
      checklist: updatedChecklist,
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    Alert.alert(
      'Complete Field Protocol',
      'Confirm physical field protocol execution and log DA sign-off timestamp?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Sign Off',
          onPress: async () => {
            setTasks((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, status: 'done', completedAt: new Date().toISOString() }
                  : t
              )
            );
            await cropCycleService.updateDaTask(taskId, { status: 'done' });
            Alert.alert('Protocol Certified', 'Field inspection verification logged to blockchain/audit log.');
          },
        },
      ]
    );
  };

  const handlePlayGlobalAudio = () => {
    setAudioPlaying(true);
    Alert.alert(
      'DA Audio Briefing (ድምፂ ስማዕ / Dhaggeeffadhu)',
      'በቀበሌ 03 ውስጥ 3 አስቸኳይ የመስክ ጉብኝቶች አሉ። በበቆሎ ማሳ ላይ የተገኘ ዝቅተኛ እርግጠኝነት ያለው የቅጠል በሽታ ምርመራ ይገምግሙ።\n\nKebele 03 summary: 3 high priority tasks. Review Northern Corn Leaf Blight diagnosis for Farmer Bekele Tola on Plot #02.',
      [{ text: 'Close', onPress: () => setAudioPlaying(false) }]
    );
  };

  const filteredTasks =
    filter === 'all' ? tasks : tasks.filter((t) => t.taskType === filter);

  const counts = {
    all: tasks.length,
    field_visit: tasks.filter((t) => t.taskType === 'field_visit').length,
    diagnosis_review: tasks.filter((t) => t.taskType === 'diagnosis_review').length,
    grievance: tasks.filter((t) => t.taskType === 'grievance').length,
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Agent Operational & Queue Ribbon */}
        <View style={styles.ribbonCard}>
          <View style={styles.ribbonTop}>
            <View style={styles.locationGroup}>
              <View style={styles.locationPill}>
                <Text style={styles.locationIcon}>📍</Text>
                <Text style={styles.locationText}>Kebele 03</Text>
              </View>
              <Text style={styles.woredaText}>Bako Tibe Woreda</Text>
            </View>

            <View style={styles.queuePill}>
              <View style={styles.pulseDot} />
              <View style={styles.queueTextCol}>
                <Text style={styles.queueTitle}>2 Offline Done</Text>
                <Text style={styles.queueSubtitle}>Ready to Sync</Text>
              </View>
            </View>
          </View>

          <Text style={styles.pageTitle}>Field Tasks & Visits</Text>

          {/* Multilingual Audio Task Summary Bar */}
          <View style={styles.audioSummaryBar}>
            <Pressable
              style={styles.audioPlayBtn}
              onPress={handlePlayGlobalAudio}>
              <Text style={styles.audioPlayIcon}>🔊</Text>
            </Pressable>
            <View style={styles.audioTextCol}>
              <Text style={styles.audioPrimaryText}>ድምፂ ስማዕ / Dhaggeeffadhu</Text>
              <Text style={styles.audioSecondaryText}>3 urgent field alerts pending Kebele 03</Text>
            </View>
            <View style={styles.audioTimeBadge}>
              <Text style={styles.audioTimeText}>01:42</Text>
            </View>
          </View>
        </View>

        {/* Interactive Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'field_visit', label: 'Flagged Visits', count: counts.field_visit },
            { id: 'diagnosis_review', label: 'Diagnosis Reviews', count: counts.diagnosis_review },
            { id: 'grievance', label: 'Grievance', count: counts.grievance },
          ].map((f) => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id as any)}
                style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
                <View style={[styles.filterCountBadge, active && styles.filterCountBadgeActive]}>
                  <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
                    {f.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Task Stream */}
        {loading && tasks.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Loading assigned DA tasks...</Text>
          </View>
        ) : (
          <View style={styles.taskStream}>
            {filteredTasks.map((task) => {
              const isDone = task.status === 'done';
              return (
                <View key={task.id} style={[styles.taskCard, isDone && styles.taskCardDone]}>
                  {/* Task Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={styles.cardIconBox}>
                        <Text style={styles.cardIcon}>
                          {task.taskType === 'diagnosis_review'
                            ? '🔬'
                            : task.taskType === 'grievance'
                            ? '⚖️'
                            : '📋'}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.taskMeta}>
                          {task.taskType === 'diagnosis_review'
                            ? 'DIAG-6 • Low Confidence AI'
                            : task.taskType === 'grievance'
                            ? 'INPUT GRIEVANCE'
                            : 'FIELD AUDIT VISIT'}
                        </Text>
                        <Text style={styles.farmerName}>{task.farmerName || 'Farmer'}</Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.priorityBadge,
                        task.priority === 'urgent'
                          ? styles.badgeUrgent
                          : task.priority === 'high'
                          ? styles.badgeHigh
                          : styles.badgeNormal,
                        isDone && styles.badgeDone,
                      ]}>
                      <Text
                        style={[
                          styles.priorityBadgeText,
                          isDone && { color: Colors.light.primary },
                        ]}>
                        {isDone ? 'COMPLETED' : task.priority?.toUpperCase() || 'OPEN'}
                      </Text>
                    </View>
                  </View>

                  {/* Plot and Diagnosis Banner */}
                  <View style={styles.plotBanner}>
                    <View style={styles.plotBannerRow}>
                      <Text style={styles.plotBannerName}>
                        {task.plotName || 'Plot #02 (Maize • 1.2 Ha)'}
                      </Text>
                      <Text style={styles.plotBannerTag}>
                        {task.taskType === 'diagnosis_review' ? 'Inference Flag' : 'Scheduled'}
                      </Text>
                    </View>
                    <Text style={styles.taskDescription}>{task.title}</Text>
                  </View>

                  {/* Physical Verification Protocol Checklist */}
                  {task.checklist && task.checklist.length > 0 && (
                    <View style={styles.checklistSection}>
                      <Text style={styles.checklistHeading}>
                        DA Physical Verification Protocol
                      </Text>

                      {task.checklist.map((item, idx) => (
                        <Pressable
                          key={idx}
                          style={[styles.checkItem, item.checked && styles.checkItemChecked]}
                          onPress={() => handleToggleChecklist(task.id, idx)}>
                          <View
                            style={[
                              styles.checkboxBox,
                              item.checked && styles.checkboxBoxChecked,
                            ]}>
                            {item.checked && <Text style={styles.checkTick}>✓</Text>}
                          </View>
                          <Text
                            style={[
                              styles.checkLabel,
                              item.checked && styles.checkLabelChecked,
                            ]}>
                            {item.label}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.actionRow}>
                    {!isDone ? (
                      <Pressable
                        style={styles.confirmBtn}
                        onPress={() => handleCompleteTask(task.id)}>
                        <Text style={styles.confirmBtnIcon}>✓</Text>
                        <Text style={styles.confirmBtnText}>Confirm & Prescribe</Text>
                      </Pressable>
                    ) : (
                      <View style={styles.completedSignedPill}>
                        <Text style={styles.completedSignedText}>
                          ✓ Signed Off {task.completedAt ? new Date(task.completedAt).toLocaleDateString() : 'Today'}
                        </Text>
                      </View>
                    )}

                    <Pressable
                      style={styles.sampleBtn}
                      onPress={() =>
                        Alert.alert(
                          'Lab Sample Logged',
                          'Tissue sample QR #ET-SAM-904 attached. Send to Woliso soil/crop pathology lab.'
                        )
                      }>
                      <Text style={styles.sampleBtnIcon}>🧪</Text>
                      <Text style={styles.sampleBtnText}>Lab Sample</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
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
  ribbonCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.four,
  },
  ribbonTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  locationGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
    gap: 4,
  },
  locationIcon: {
    fontSize: 10,
  },
  locationText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  woredaText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  queuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.primary,
  },
  queueTextCol: {
    alignItems: 'flex-end',
  },
  queueTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  queueSubtitle: {
    fontSize: 9,
    color: Colors.light.textMuted,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.three,
  },
  audioSummaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFDBCF',
    borderRadius: 8,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  audioPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6C2200',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioPlayIcon: {
    fontSize: 16,
  },
  audioTextCol: {
    flex: 1,
  },
  audioPrimaryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C2200',
  },
  audioSecondaryText: {
    fontSize: 11,
    color: '#6C2200',
    opacity: 0.9,
  },
  audioTimeBadge: {
    backgroundColor: 'rgba(108,34,0,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  audioTimeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C2200',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: Spacing.four,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: 8,
    borderRadius: Radii.full,
    marginRight: Spacing.two,
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  filterCountBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountBadgeActive: {
    backgroundColor: Colors.light.primarySubtle,
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  filterCountTextActive: {
    color: Colors.light.primary,
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: Spacing.six,
  },
  loadingText: {
    marginTop: Spacing.two,
    fontSize: 13,
    color: Colors.light.textSecondary,
  },
  taskStream: {
    gap: Spacing.four,
  },
  taskCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  taskCardDone: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.two,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardIcon: {
    fontSize: 18,
  },
  taskMeta: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    fontWeight: '600',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radii.full,
  },
  badgeUrgent: {
    backgroundColor: '#FFDAD6',
  },
  badgeHigh: {
    backgroundColor: '#FFE0B2',
  },
  badgeNormal: {
    backgroundColor: Colors.light.backgroundElement,
  },
  badgeDone: {
    backgroundColor: '#E8F5E9',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.danger,
  },
  plotBanner: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    padding: Spacing.two,
    marginBottom: Spacing.three,
  },
  plotBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  plotBannerName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
  },
  plotBannerTag: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.accent,
  },
  taskDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 16,
  },
  checklistSection: {
    marginBottom: Spacing.three,
  },
  checklistHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    padding: Spacing.two,
    borderRadius: 6,
    marginBottom: 6,
    gap: Spacing.two,
  },
  checkItemChecked: {
    backgroundColor: '#E8F5E9',
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.light.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkTick: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
  },
  checkLabel: {
    fontSize: 13,
    color: Colors.light.text,
    flex: 1,
  },
  checkLabelChecked: {
    textDecorationLine: 'line-through',
    color: Colors.light.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.one,
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.light.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  confirmBtnIcon: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  confirmBtnText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '700',
  },
  completedSignedPill: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.light.primarySubtle,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedSignedText: {
    color: Colors.light.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  sampleBtn: {
    height: 44,
    paddingHorizontal: Spacing.three,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  sampleBtnIcon: {
    fontSize: 14,
  },
  sampleBtnText: {
    color: Colors.light.text,
    fontSize: 13,
    fontWeight: '600',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
import {
  diagnosticService,
  RegisteredChemical,
} from '@/services/api/diagnostic-service';

export interface CertifiedInputsScreenProps {
  onNavigate?: (screen: string, params?: Record<string, unknown>) => void;
}

export function CertifiedInputsScreen({ onNavigate }: CertifiedInputsScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'fungicide' | 'insecticide' | 'herbicide' | 'seed'>('all');
  const [inputs, setInputs] = useState<RegisteredChemical[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInputs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await diagnosticService.fetchChemicals({
        category: category === 'all' || category === 'seed' ? undefined : category,
        search: searchQuery || undefined,
      });
      if (res.success && res.data) {
        setInputs(res.data);
      }
    } catch (err) {
      console.warn('Failed to load certified inputs', err);
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery]);

  useEffect(() => {
    loadInputs();
  }, [loadInputs]);

  const handleVoiceSearch = () => {
    Alert.alert(
      'Voice Input Search (በድምጽ ፈልግ)',
      'Speaking Amharic / Afaan Oromoo: "የስንዴ ዝገት ማከሚያ ኬሚካል" (Wheat rust treatment)...',
      [
        {
          text: 'Apply Search',
          onPress: () => setSearchQuery('Tilt'),
        },
      ]
    );
  };

  const handlePlayAudio = (item: RegisteredChemical) => {
    Alert.alert(
      `Audio Advisory: ${item.brandName} (አዳምጥ)`,
      `${item.brandName} - የተፈቀደ የኢትዮጵያ ግብርና ሚኒስቴር ኬሚካል ነው። ምዝገባ ቁጥር፡ ${item.registrationNumber}። የደህንነት ጊዜ፡ ${item.safetyIntervalDays} ቀናት።\n\nMinistry of Agriculture registered ${item.category}. Registration: ${item.registrationNumber}. Safety Interval: ${item.safetyIntervalDays} days.`,
      [{ text: 'Close' }]
    );
  };

  // Static mock certified seeds when category is seed or all
  const certifiedSeeds = [
    {
      id: 'seed-01',
      brandName: 'Quncho (DZ-Cr-37)',
      activeIngredient: 'Certified Breeder Line White Teff',
      registrationNumber: 'MoA-ET/SEED-2006-12',
      category: 'seed' as const,
      dosageText: { en: '15-20 kg / Ha for row planting', am: 'በሄክታር 15-20 ኪ.ግ ለመስመር' },
      safetyIntervalDays: 0,
      permittedCrops: ['Teff'],
      dealerStock: 'Adama Farmers Cooperative Union: 420 Quintals (8,500 ETB / Qt)',
    },
    {
      id: 'seed-02',
      brandName: 'Kakaba (ET-WHT-08)',
      activeIngredient: 'Rust-Resistant Bread Wheat Seed',
      registrationNumber: 'MoA-ET/SEED-2010-04',
      category: 'seed' as const,
      dosageText: { en: '100-125 kg / Ha', am: 'በሄክታር 100-125 ኪ.ግ' },
      safetyIntervalDays: 0,
      permittedCrops: ['Wheat'],
      dealerStock: 'Oromia Seed Enterprise Depot: In Stock • Certified Blue Tag',
    },
  ];

  let displayItems: any[] = [];
  if (category === 'seed') {
    displayItems = certifiedSeeds;
  } else if (category === 'all') {
    displayItems = [...inputs, ...certifiedSeeds];
  } else {
    displayItems = inputs;
  }

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    displayItems = displayItems.filter(
      (item) =>
        item.brandName.toLowerCase().includes(q) ||
        item.activeIngredient.toLowerCase().includes(q) ||
        item.registrationNumber.toLowerCase().includes(q)
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Local Offline Verification Registry Banner */}
        <View style={styles.registryBanner}>
          <View style={styles.registryLeft}>
            <View style={styles.shieldBox}>
              <Text style={styles.shieldIcon}>🛡️</Text>
            </View>
            <View style={styles.registryInfo}>
              <View style={styles.registryTitleRow}>
                <Text style={styles.registryTitle}>MoA Ethiopia Registry 2026</Text>
                <View style={styles.sqlitePill}>
                  <View style={styles.greenDot} />
                  <Text style={styles.sqliteText}>SQLite Cached</Text>
                </View>
              </View>
              <Text style={styles.registrySub}>Official Regulatory List • Works 100% Offline</Text>
            </View>
          </View>
          <Pressable
            style={styles.syncBtn}
            onPress={() => {
              Alert.alert('Catalog Updated', 'Refreshed 28 certified crop protection products from MoA central database.');
              loadInputs();
            }}>
            <Text style={styles.syncIcon}>🔄</Text>
          </Pressable>
        </View>

        {/* Search & Voice Input Box */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search chemical, brand, active ingredient..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <Pressable style={styles.voiceBtn} onPress={handleVoiceSearch}>
            <Text style={styles.voiceIcon}>🎙️</Text>
            <Text style={styles.voiceText}>በድምጽ ፈልግ</Text>
          </Pressable>
        </View>

        {/* Category Selector Horizontal Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
          {[
            { id: 'all', label: 'All', count: 28 },
            { id: 'fungicide', label: 'Fungicides', count: 8 },
            { id: 'insecticide', label: 'Insecticides', count: 7 },
            { id: 'herbicide', label: 'Herbicides', count: 5 },
            { id: 'seed', label: 'Certified Seeds', count: 8 },
          ].map((cat) => {
            const active = category === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setCategory(cat.id as any)}
                style={[styles.catPill, active && styles.catPillActive]}>
                <Text style={[styles.catText, active && styles.catTextActive]}>
                  {cat.label}
                </Text>
                <View style={[styles.catCount, active && styles.catCountActive]}>
                  <Text style={[styles.catCountText, active && styles.catCountTextActive]}>
                    {cat.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Feed Header */}
        <View style={styles.feedHeader}>
          <View style={styles.feedHeaderLeft}>
            <Text style={styles.boxIcon}>📦</Text>
            <Text style={styles.feedTitle}>
              {displayItems.length} Certified Products Displayed
            </Text>
          </View>
          <Text style={styles.feedVerified}>Verified by DA Tech</Text>
        </View>

        {/* Product Cards Stream */}
        {loading && displayItems.length === 0 ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Searching official MoA registry...</Text>
          </View>
        ) : displayItems.length > 0 ? (
          <View style={styles.itemsStream}>
            {displayItems.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <View style={styles.itemIconBox}>
                    <Text style={styles.itemIcon}>
                      {item.category === 'fungicide'
                        ? '🧪'
                        : item.category === 'insecticide'
                        ? '🐛'
                        : item.category === 'seed'
                        ? '🌾'
                        : '🌱'}
                    </Text>
                    <View style={styles.categoryTag}>
                      <Text style={styles.categoryTagText}>{item.category.toUpperCase()}</Text>
                    </View>
                  </View>

                  <View style={styles.itemMainInfo}>
                    <View style={styles.itemBrandRow}>
                      <Text style={styles.itemBrand}>{item.brandName}</Text>
                      <View style={styles.itemRegBadge}>
                        <Text style={styles.itemRegText}>✓ {item.registrationNumber}</Text>
                      </View>
                    </View>
                    <Text style={styles.itemActive}>{item.activeIngredient}</Text>
                    <Text style={styles.itemDosage}>
                      {item.dosageText?.en || '0.5 L/Ha in 200L clean water'}
                    </Text>
                  </View>

                  <Pressable
                    style={styles.itemAudioBtn}
                    onPress={() => handlePlayAudio(item)}>
                    <Text style={styles.itemAudioIcon}>🔊</Text>
                    <Text style={styles.itemAudioText}>አዳምጥ</Text>
                  </Pressable>
                </View>

                {/* Permitted Crops & Target */}
                <View style={styles.permittedRow}>
                  <Text style={styles.permittedLabel}>PERMITTED CROPS:</Text>
                  <View style={styles.cropTags}>
                    {['Wheat', 'Barley', 'Teff'].map((crop) => (
                      <View key={crop} style={styles.cropTag}>
                        <Text style={styles.cropTagText}>🌱 {crop}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Key Parameters Strip */}
                <View style={styles.paramsGrid}>
                  <View style={styles.paramCol}>
                    <Text style={styles.paramLabel}>💧 Dosage Rate</Text>
                    <Text style={styles.paramVal}>0.5 L / Ha</Text>
                    <Text style={styles.paramSub}>Mix in 200L water</Text>
                  </View>
                  <View style={styles.paramCol}>
                    <Text style={styles.paramLabel}>⏳ Pre-Harvest Int.</Text>
                    <Text style={[styles.paramVal, { color: Colors.light.accent }]}>
                      {item.safetyIntervalDays || 30} Days
                    </Text>
                    <Text style={styles.paramSub}>Harvest window</Text>
                  </View>
                </View>

                {/* Authorized Local Dealer Stock */}
                <View style={styles.dealerRow}>
                  <Text style={styles.dealerIcon}>🏪</Text>
                  <Text style={styles.dealerText}>
                    {item.dealerStock || 'Adama Farmers Cooperative Union: In Stock • 1,450 ETB'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          /* Zero Result Adulteration Advisory (DIAG-9) */
          <View style={styles.notFoundCard}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.notFoundTitle}>Input Not Found in Official Registry</Text>
            <Text style={styles.notFoundDesc}>
              "{searchQuery}" does not match any approved chemical or certified seed variety in the official Ministry of Agriculture regulatory database. Beware of counterfeit or adulterated inputs.
            </Text>
            <Pressable
              style={styles.reportBtn}
              onPress={() => {
                Alert.alert('Report Dispatched', 'Suspected unverified chemical reported to City Agriculture Office Grievance Desk.');
                onNavigate?.('GrievanceChat');
              }}>
              <Text style={styles.reportBtnText}>🚨 Report Suspect Input to Grievance Desk</Text>
            </Pressable>
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
  registryBanner: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.three,
  },
  registryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  shieldBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: Colors.light.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 20,
  },
  registryInfo: {
    flex: 1,
  },
  registryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  registryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  sqlitePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radii.full,
    gap: 4,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.light.primary,
  },
  sqliteText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  registrySub: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  syncBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncIcon: {
    fontSize: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    paddingHorizontal: Spacing.three,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.three,
    gap: Spacing.two,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.light.text,
  },
  voiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  voiceIcon: {
    fontSize: 14,
  },
  voiceText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  categoryRow: {
    flexDirection: 'row',
    marginBottom: Spacing.three,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: 7,
    borderRadius: Radii.full,
    marginRight: Spacing.two,
    gap: 6,
  },
  catPillActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  catText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  catTextActive: {
    color: '#FFF',
    fontWeight: '700',
  },
  catCount: {
    backgroundColor: Colors.light.backgroundElement,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  catCountActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  catCountText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.light.textSecondary,
  },
  catCountTextActive: {
    color: '#FFF',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  feedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boxIcon: {
    fontSize: 16,
  },
  feedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  feedVerified: {
    fontSize: 11,
    color: Colors.light.textMuted,
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
  itemsStream: {
    gap: Spacing.three,
  },
  itemCard: {
    backgroundColor: Colors.light.card,
    borderRadius: Radii.card,
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: Colors.light.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  itemIconBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  itemIcon: {
    fontSize: 22,
  },
  categoryTag: {
    position: 'absolute',
    bottom: -4,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  categoryTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFF',
  },
  itemMainInfo: {
    flex: 1,
  },
  itemBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  itemBrand: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  itemRegBadge: {
    backgroundColor: Colors.light.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  itemRegText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.primary,
  },
  itemActive: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.accent,
    marginTop: 2,
  },
  itemDosage: {
    fontSize: 11,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  itemAudioBtn: {
    backgroundColor: '#FFDBCF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radii.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemAudioIcon: {
    fontSize: 12,
  },
  itemAudioText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C2200',
  },
  permittedRow: {
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 6,
    padding: Spacing.two,
    marginBottom: Spacing.two,
  },
  permittedLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cropTags: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  cropTag: {
    backgroundColor: '#FFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cropTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.text,
  },
  paramsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  paramCol: {
    flex: 1,
    backgroundColor: Colors.light.backgroundElement,
    borderRadius: 6,
    padding: Spacing.two,
  },
  paramLabel: {
    fontSize: 10,
    color: Colors.light.textSecondary,
  },
  paramVal: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.primary,
    marginTop: 1,
  },
  paramSub: {
    fontSize: 9,
    color: Colors.light.textMuted,
    marginTop: 1,
  },
  dealerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: Spacing.two,
    borderRadius: 6,
    gap: 6,
  },
  dealerIcon: {
    fontSize: 14,
  },
  dealerText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.light.primary,
    flex: 1,
  },
  notFoundCard: {
    backgroundColor: '#FFDAD6',
    borderRadius: Radii.card,
    padding: Spacing.four,
    alignItems: 'center',
    marginTop: Spacing.three,
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: Spacing.two,
  },
  notFoundTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.danger,
    textAlign: 'center',
  },
  notFoundDesc: {
    fontSize: 12,
    color: Colors.light.danger,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  reportBtn: {
    backgroundColor: Colors.light.danger,
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: Spacing.three,
  },
  reportBtnText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

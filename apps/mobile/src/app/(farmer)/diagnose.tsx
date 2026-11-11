import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Image as ImageIcon, ScanLine, AlertCircle, Sparkles } from 'lucide-react-native';
import { useTranslation } from '@/i18n';
import { OfflineBanner } from '@/components/OfflineBanner';
import { networkService } from '@/services/network';

export default function PestCaptureScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isOnline = networkService.getIsConnected();

  const [images, setImages] = useState<string[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Wheat (Triticum aestivum)');
  const [selectedStage, setSelectedStage] = useState('Tillering / Vegetative');

  const handleSimulateCapture = () => {
    if (images.length >= 3) return;
    // Mock sample leaf photo URI
    setImages([...images, 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=400&q=80']);
  };

  const handleDiagnose = () => {
    if (images.length === 0) return;
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      router.push('/diagnostics/diag-1' as any);
    }, 1200);
  };

  return (
    <View style={styles.container}>
      {!isOnline && <OfflineBanner />}

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('nav.diagnose')}</Text>
          <Text style={styles.subtitle}>
            Photograph affected leaves or stems for AI diagnostic analysis
          </Text>
        </View>

        {/* Framing Guide Box */}
        <View style={styles.cameraBox}>
          <View style={styles.reticle}>
            <ScanLine size={48} color="#16A34A" />
            <Text style={styles.reticleText}>Align damaged leaf within frame</Text>
          </View>
        </View>

        {/* Capture Action Controls */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleSimulateCapture}
            activeOpacity={0.8}
          >
            <Camera size={24} color="#FFFFFF" />
            <Text style={styles.captureText}>Take Photo ({images.length}/3)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.galleryButton}
            onPress={handleSimulateCapture}
            activeOpacity={0.8}
          >
            <ImageIcon size={22} color="#151A14" />
          </TouchableOpacity>
        </View>

        {/* Image Preview Row */}
        {images.length > 0 && (
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Captured Samples</Text>
            <ScrollView horizontal style={styles.previewRow}>
              {images.map((uri, idx) => (
                <View key={idx} style={styles.thumbnailWrapper}>
                  <Image source={{ uri }} style={styles.thumbnail} />
                  <View style={styles.sampleTag}>
                    <Text style={styles.sampleTagText}>#{idx + 1}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Agronomic Context Pre-fills */}
        <View style={styles.contextBox}>
          <Text style={styles.contextHeader}>Agronomic Diagnostic Context</Text>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>{t('agronomy.crop')}:</Text>
            <Text style={styles.contextValue}>{selectedCrop}</Text>
          </View>
          <View style={styles.contextRow}>
            <Text style={styles.contextLabel}>{t('agronomy.stage')}:</Text>
            <Text style={styles.contextValue}>{selectedStage}</Text>
          </View>
        </View>

        {/* Submit Diagnose Button */}
        <TouchableOpacity
          style={[styles.diagnoseButton, images.length === 0 && styles.disabledButton]}
          onPress={handleDiagnose}
          disabled={images.length === 0 || analyzing}
          activeOpacity={0.85}
        >
          {analyzing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View style={styles.buttonInner}>
              <Sparkles size={20} color="#FFFFFF" />
              <Text style={styles.diagnoseText}>Analyze Symptoms with AI</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F4',
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#151A14',
  },
  subtitle: {
    fontSize: 14,
    color: '#566153',
    marginTop: 4,
    lineHeight: 20,
  },
  cameraBox: {
    height: 220,
    backgroundColor: '#181C18',
    borderRadius: 20,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  reticle: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(74, 222, 128, 0.4)',
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: 24,
  },
  reticleText: {
    color: '#E2DBD0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 10,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#16A34A',
    minHeight: 52,
    borderRadius: 26,
    elevation: 3,
  },
  captureText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  galleryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DFD9CB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewSection: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#151A14',
    marginBottom: 8,
  },
  previewRow: {
    flexDirection: 'row',
  },
  thumbnailWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  sampleTag: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  sampleTagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  contextBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#DFD9CB',
    marginBottom: 20,
    gap: 6,
  },
  contextHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contextLabel: {
    fontSize: 13,
    color: '#566153',
  },
  contextValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#151A14',
  },
  diagnoseButton: {
    backgroundColor: '#16A34A',
    minHeight: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  buttonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diagnoseText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});


import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { ROUTES, type RouteName } from './routes';
import type { SupportedLanguage } from '@/config/constants';

// Screens
import { LanguageSelectionScreen } from '@/screens/auth/LanguageSelectionScreen';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { OtpVerificationScreen } from '@/screens/auth/OtpVerificationScreen';
import { ProfileSetupScreen } from '@/screens/auth/ProfileSetupScreen';
import { FarmerHomeScreen } from '@/screens/main/FarmerHomeScreen';
import { DaOperationsHubScreen } from '@/screens/main/DaOperationsHubScreen';
import { UnifiedInboxScreen } from '@/screens/main/UnifiedInboxScreen';
import { PlotListScreen } from '@/screens/plots/PlotListScreen';
import { RegisterPlotScreen } from '@/screens/plots/RegisterPlotScreen';
import { PlotDetailScreen } from '@/screens/plots/PlotDetailScreen';
import { CropCycleHubScreen } from '@/screens/agronomy/CropCycleHubScreen';
import { UniversalLoggerScreen, type LogType } from '@/screens/agronomy/UniversalLoggerScreen';
import { DaTasksScreen } from '@/screens/agronomy/DaTasksScreen';
import { YieldGapScreen } from '@/screens/ai/YieldGapScreen';
import { WeatherForecastScreen } from '@/screens/ai/WeatherForecastScreen';
import { PestDiagnosisScreen } from '@/screens/ai/PestDiagnosisScreen';
import { CertifiedInputsScreen } from '@/screens/ai/CertifiedInputsScreen';
import { GrievanceChatScreen } from '@/screens/support/GrievanceChatScreen';
import { MarketPricesScreen } from '@/screens/support/MarketPricesScreen';
import { AnnouncementsScreen } from '@/screens/support/AnnouncementsScreen';
import { StorageGuideScreen } from '@/screens/support/StorageGuideScreen';
import { SyncSettingsScreen } from '@/screens/support/SyncSettingsScreen';
import { VoiceAssistant } from '@/components/overlays/VoiceAssistant';

export function RootNavigator() {
  const { isAuthenticated, role } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage | null>(null);
  const [currentScreen, setCurrentScreen] = useState<RouteName>(
    isAuthenticated
      ? role === 'da'
        ? ROUTES.DA_OPERATIONS_HUB
        : ROUTES.FARMER_HOME
      : ROUTES.LANGUAGE_SELECTION
  );
  const [screenParams, setScreenParams] = useState<Record<string, any>>({});

  const navigate = (screenName: string, params: Record<string, any> = {}) => {
    setCurrentScreen(screenName as RouteName);
    setScreenParams(params);
  };

  // 1. Pre-Auth Language Selection
  if (!selectedLanguage && !isAuthenticated) {
    return (
      <LanguageSelectionScreen
        onSelectLanguage={(lang) => {
          setSelectedLanguage(lang);
          navigate(ROUTES.SIGN_IN);
        }}
        onOpenDaHelp={() => navigate(ROUTES.SIGN_IN)}
      />
    );
  }

  // 2. Unauthenticated OTP Verification Flow
  if (!isAuthenticated && currentScreen === ROUTES.OTP_VERIFICATION) {
    return (
      <OtpVerificationScreen
        phoneNumber={screenParams.phoneNumber || ''}
        name={screenParams.name}
        password={screenParams.password}
        isPasswordReset={screenParams.isPasswordReset}
        onSuccess={() => {
          navigate(ROUTES.PROFILE_SETUP);
        }}
        onBack={() => navigate(ROUTES.SIGN_IN)}
      />
    );
  }

  // 3. Unauthenticated Sign In Flow
  if (!isAuthenticated) {
    return (
      <SignInScreen
        onSuccess={() => {
          navigate(ROUTES.PROFILE_SETUP);
        }}
        onNavigateToOtp={(otpParams) => {
          navigate(ROUTES.OTP_VERIFICATION, otpParams);
        }}
        onBackToLanguage={() => {
          setSelectedLanguage(null);
          navigate(ROUTES.LANGUAGE_SELECTION);
        }}
      />
    );
  }

  // 3. Authenticated Screen Router (21 Standalone Screens)
  const renderScreen = () => {
    switch (currentScreen) {
      // Main Hubs
      case ROUTES.FARMER_HOME:
        return <FarmerHomeScreen onNavigate={navigate} />;
      case ROUTES.DA_OPERATIONS_HUB:
        return <DaOperationsHubScreen onNavigate={navigate} />;
      case ROUTES.UNIFIED_INBOX:
        return <UnifiedInboxScreen />;

      // Plots
      case ROUTES.PLOT_LIST:
        return <PlotListScreen onNavigate={navigate} />;
      case ROUTES.REGISTER_PLOT:
        return <RegisterPlotScreen onComplete={() => navigate(ROUTES.PLOT_LIST)} />;
      case ROUTES.PLOT_DETAIL:
        return <PlotDetailScreen plotId={screenParams.plotId} onNavigate={navigate} />;

      // Agronomy
      case ROUTES.CROP_CYCLE_HUB:
        return <CropCycleHubScreen plotId={screenParams.plotId} onNavigate={navigate} />;
      case ROUTES.UNIVERSAL_LOGGER:
        return (
          <UniversalLoggerScreen
            cycleId={screenParams.cycleId}
            initialLogType={screenParams.logType as LogType}
            onComplete={() => navigate(ROUTES.FARMER_HOME)}
            onNavigate={navigate}
          />
        );
      case ROUTES.DA_TASKS:
        return <DaTasksScreen />;

      // AI & Weather
      case ROUTES.YIELD_GAP:
        return <YieldGapScreen cycleId={screenParams.cycleId} onNavigate={navigate} />;
      case ROUTES.WEATHER_FORECAST:
        return <WeatherForecastScreen plotId={screenParams.plotId} onNavigate={navigate} />;
      case ROUTES.PEST_DIAGNOSIS:
        return <PestDiagnosisScreen plotId={screenParams.plotId} onNavigate={navigate} />;
      case ROUTES.CERTIFIED_INPUTS:
        return <CertifiedInputsScreen onNavigate={navigate} />;

      // Support & Trade
      case ROUTES.GRIEVANCE_CHAT:
        return (
          <GrievanceChatScreen
            grievanceId={screenParams.grievanceId}
            onNavigateBack={() => navigate(role === 'da' ? ROUTES.DA_OPERATIONS_HUB : ROUTES.FARMER_HOME)}
          />
        );
      case ROUTES.MARKET_PRICES:
        return <MarketPricesScreen />;
      case ROUTES.ANNOUNCEMENTS:
        return <AnnouncementsScreen />;
      case ROUTES.STORAGE_GUIDE:
        return <StorageGuideScreen />;
      case ROUTES.SYNC_SETTINGS:
        return <SyncSettingsScreen />;

      case ROUTES.PROFILE_SETUP:
        return (
          <ProfileSetupScreen
            onComplete={() => navigate(role === 'da' ? ROUTES.DA_OPERATIONS_HUB : ROUTES.FARMER_HOME)}
            onBack={() => navigate(ROUTES.SIGN_IN)}
          />
        );

      default:
        return role === 'da' ? (
          <DaOperationsHubScreen onNavigate={navigate} />
        ) : (
          <FarmerHomeScreen onNavigate={navigate} />
        );
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      <VoiceAssistant onNavigate={navigate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f9f9ff',
    ...(Platform.OS === 'web'
      ? {
          maxWidth: 480,
          marginHorizontal: 'auto',
          minHeight: '100%',
          overflow: 'hidden',
        }
      : {}),
  },
});

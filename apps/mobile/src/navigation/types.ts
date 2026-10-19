import type { RouteName } from './routes';

export type RootStackParamList = {
  // Auth Flow
  LanguageSelection: undefined;
  SignIn: undefined;
  ProfileSetup: { isClaiming?: boolean };

  // Main Farmer Flows
  FarmerHome: undefined;
  PlotList: undefined;
  RegisterPlot: { farmerId?: string };
  PlotDetail: { plotId: string };
  CropCycleHub: { plotId: string; cycleId?: string };
  UniversalLogger: {
    cycleId: string;
    logType?: 'sowing' | 'basal' | 'urea_1' | 'urea_2' | 'plowing' | 'weeding' | 'spraying' | 'irrigation' | 'harvest' | 'ledger';
  };
  YieldGap: { cycleId: string };
  WeatherForecast: { plotId?: string };
  PestDiagnosis: { plotId?: string };
  CertifiedInputs: undefined;
  GrievanceChat: { grievanceId?: string };
  MarketPrices: undefined;
  Announcements: undefined;
  StorageGuide: undefined;
  UnifiedInbox: undefined;
  SyncSettings: undefined;

  // DA Extension Flows
  DaOperationsHub: undefined;
  DaTasks: { taskId?: string };
};

export type ScreenParamList<T extends keyof RootStackParamList> = RootStackParamList[T];

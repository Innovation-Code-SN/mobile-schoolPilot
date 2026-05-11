import Constants from 'expo-constants';

type Extra = {
  apiBaseUrl?: string;
  appName?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const env = {
  apiBaseUrl: extra.apiBaseUrl ?? 'http://45.92.111.211:5053',
  appName: extra.appName ?? 'SchoolPilotMobile',
};

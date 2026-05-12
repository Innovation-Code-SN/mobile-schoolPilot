import Constants from 'expo-constants';
import { Platform } from 'react-native';

type Extra = {
  apiBaseUrl?: string;
  appName?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

const nativeApiBaseUrl = extra.apiBaseUrl ?? 'http://45.92.111.211:5053';

// On web, calls go through the Netlify proxy (/api/*) to bypass mixed content
// (HTTPS page cannot call HTTP API directly). The proxy is configured in netlify.toml.
const webApiBaseUrl = '/api';

export const env = {
  apiBaseUrl: Platform.OS === 'web' ? webApiBaseUrl : nativeApiBaseUrl,
  appName: extra.appName ?? 'SchoolPilotMobile',
};

import { getSessionItem, setSessionItem } from './session-storage';
import { get } from './request';

export const getDefaultOptions = () => ({
  key: 'userTimingConfigurations',
  isAutoReset: false,
  isTrackingEnabled: true,
  storageApi: {
    getItem: getSessionItem,
    setItem: setSessionItem
  },
  configApi: {
    get
  },
  googleAnalyticsApi: window.gtag
});

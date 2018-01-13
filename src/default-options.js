import { getSessionItem, setSessionItem } from './session-storage';
import { get } from './request';

export const getDefaultOptions = () => ({
  key: 'timing',
  configUrl: '/timing.json',
  isAutoReset: false,
  storageManagerInterface: {
    getItem: getSessionItem,
    setItem: setSessionItem
  },
  httpRequestInterface: {
    get
  },
  googleAnalyticsInterface: window.ga
});

import { getSessionItem, setSessionItem } from './session-storage';
import { get } from './request';

export const getDefaultOptions = () => ({
  key: 'userTimingConfigurations',
  isAutoReset: false,
  storageManagerInterface: {
    getItem: getSessionItem,
    setItem: setSessionItem
  },
  configInterface: {
    get
  },
  googleAnalyticsInterface: window.ga
});

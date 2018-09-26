'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultOptions = undefined;

var _sessionStorage = require('./session-storage');

var _request = require('./request');

var getDefaultOptions = exports.getDefaultOptions = function getDefaultOptions() {
  return {
    key: 'userTimingConfigurations',
    isAutoReset: false,
    isTrackingEnabled: true,
    storageApi: {
      getItem: _sessionStorage.getSessionItem,
      setItem: _sessionStorage.setSessionItem
    },
    configApi: {
      get: _request.get
    },
    googleAnalyticsApi: window.gtag
  };
};
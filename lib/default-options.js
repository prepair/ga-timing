'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDefaultOptions = undefined;

var _sessionStorage = require('./session-storage');

var _request = require('./request');

var getDefaultOptions = exports.getDefaultOptions = function getDefaultOptions() {
  return {
    key: 'timing',
    isAutoReset: false,
    storageManagerInterface: {
      getItem: _sessionStorage.getSessionItem,
      setItem: _sessionStorage.setSessionItem
    },
    configInterface: {
      get: _request.get
    },
    googleAnalyticsInterface: window.ga
  };
};
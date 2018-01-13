'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getSessionItem = exports.getSessionItem = function getSessionItem(key) {
  return JSON.parse(window.sessionStorage.getItem(key));
};

var setSessionItem = exports.setSessionItem = function setSessionItem(key, item) {
  return window.sessionStorage.setItem(key, typeof item === 'string' ? item : JSON.stringify(item));
};
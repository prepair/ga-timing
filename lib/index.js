'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fulfillCondition = exports.startTracking = exports.setup = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _defaultOptions = require('./default-options');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TIMING_LABEL_INTERACTIVITY = 'Interactivity';
var TIMING_LABEL_LOAD_COMPLETION = 'Load completion';

var currentOptions = void 0;

var setup = exports.setup = function setup(options) {
  currentOptions = _extends({}, (0, _defaultOptions.getDefaultOptions)(), options);

  populate();
};

var startTracking = exports.startTracking = function startTracking(key) {
  var entries = getTimingEntries();
  var entryIndex = getEntryIndex(key, entries);

  if (entryIndex) {
    return;
  }

  entries[entryIndex].startedAt = new Date().getTime();
  setTimingEntries(entries);
};

var fulfillCondition = exports.fulfillCondition = function fulfillCondition(key, condition) {
  var entries = getTimingEntries();
  var entryIndex = getEntryIndex(key, entries);

  if (entryIndex) {
    return;
  }

  var entry = entries[entryIndex];
  var interactivityConditions = entry.conditions.interactivity;
  var loadCompletionConditions = entry.conditions.loadCompletion;

  var isInteractivityAlreadyTracked = areConditionsEmpty(interactivityConditions);
  var isLoadCompletionAlreadyTracked = isInteractivityAlreadyTracked && areConditionsEmpty(loadCompletionConditions);

  // update conditions and track if needed

  if (!isInteractivityAlreadyTracked) {
    entry.conditions.interactivity = removeCondition(interactivityConditions, condition);
    setTimingEntries(entries);
    trackForInteractivity(entry);
  }

  if (!isLoadCompletionAlreadyTracked) {
    entry.conditions.loadCompletion = removeCondition(loadCompletionConditions, condition);
    setTimingEntries(entries);
    trackForLoadCompletion(entry);
  }
};

var populate = async function populate() {
  if (getTimingEntries() === null || currentOptions.isAutoReset) {
    currentOptions.httpRequestInterface.get(currentOptions.configUrl).then(function (response) {
      return currentOptions.storageManagerInterface.setItem(currentOptions.key, response.data);
    }).catch(function (err) {
      _loglevel2.default.error('Unable to get timing entries', err);
      currentOptions.storageManagerInterface.setItem(currentOptions.key, []);
    });
  }
};

var getTimingEntries = function getTimingEntries() {
  return currentOptions.storageManagerInterface.getItem(currentOptions.key);
};

var setTimingEntries = function setTimingEntries(entries) {
  return currentOptions.storageManagerInterface.setItem(currentOptions.key, entries);
};

var getEntryIndex = function getEntryIndex(key, entries) {
  return entries.findIndex(function (entry) {
    return new RegExp(entry.name, 'i').test(key);
  });
};

var areConditionsEmpty = function areConditionsEmpty(conditions) {
  return conditions.length === 0;
};

var removeCondition = function removeCondition(conditions, conditionToBeRemoved) {
  return conditions.filter(function (condition) {
    return !new RegExp(condition, 'i').test(conditionToBeRemoved);
  });
};

var trackForInteractivity = function trackForInteractivity(entry) {
  if (areConditionsEmpty(entry.conditions.interactivity)) {
    track(entry, TIMING_LABEL_INTERACTIVITY);
  }
};

var trackForLoadCompletion = function trackForLoadCompletion(entry) {
  var conditions = entry.conditions;
  if (areConditionsEmpty(conditions.interactivity) && areConditionsEmpty(conditions.loadCompletion)) {
    track(entry, TIMING_LABEL_LOAD_COMPLETION);
  }
};

var track = function track(entry, conditionType) {
  var _entry$analytics = entry.analytics,
      timingCategory = _entry$analytics.timingCategory,
      timingVar = _entry$analytics.timingVar;

  var diff = new Date().getTime() - entry.startedAt;
  // 'send', 'timing', 'timingCategory', 'timingVar', 'timingVal', 'timingLabel'
  currentOptions.googleAnalyticsInterface('send', 'timing', timingCategory, timingVar, diff, conditionType);
};
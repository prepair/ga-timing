'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fulfillCondition = exports.resetTracking = exports.startTracking = exports.setup = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _loglevel = require('loglevel');

var _loglevel2 = _interopRequireDefault(_loglevel);

var _defaultOptions = require('./default-options');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TIMING_LABEL_INTERACTIVITY = 'Interactivity';
var TIMING_LABEL_LOAD_COMPLETION = 'Load completion';

var currentOptions = void 0;

var setup = exports.setup = function setup(options) {
  if (currentOptions) {
    _loglevel2.default.warn('Already initialized');
    return;
  }

  currentOptions = _extends({}, (0, _defaultOptions.getDefaultOptions)(), options);

  if (currentOptions.isAutoReset) {
    populate();
    return;
  }

  if (!isEmpty(getEntries())) {
    resetPartiallyTrackedEntries();
  } else {
    populate();
  }
};

var startTracking = exports.startTracking = function startTracking(key) {
  var startedAt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Date().getTime();

  var entries = getEntries();
  var entryIndex = getEntryIndex(key, entries);

  if (entryIndex === -1) {
    return;
  }

  var entry = entries[entryIndex];
  entry.startedAt = startedAt;
  entry.fulfilledConditions = {
    interactivity: [],
    loadCompletion: []
  };
  setEntries(entries);
};

var resetTracking = exports.resetTracking = function resetTracking(key) {
  var entries = getEntries();
  var entryIndex = getEntryIndex(key, entries);

  if (entryIndex === -1) {
    return;
  }

  var _entries$entryIndex = entries[entryIndex],
      name = _entries$entryIndex.name,
      conditions = _entries$entryIndex.conditions,
      analytics = _entries$entryIndex.analytics;

  entries[entryIndex] = { name: name, conditions: conditions, analytics: analytics };

  setEntries(entries);
};

var fulfillCondition = exports.fulfillCondition = function fulfillCondition(key, condition) {
  var entries = getEntries();
  var entryIndex = getEntryIndex(key, entries);

  if (entryIndex === -1) {
    return;
  }

  var entry = entries[entryIndex];

  if (!entry.startedAt) {
    return;
  }

  var interactivityConditions = entry.conditions.interactivity;
  var loadCompletionConditions = entry.conditions.loadCompletion;
  var fulfilledInteractivityConditions = entry.fulfilledConditions.interactivity;
  var fulfilledLoadCompletionConditions = entry.fulfilledConditions.loadCompletion;

  var isInteractivityAlreadyTracked = hasSameElements(interactivityConditions, fulfilledInteractivityConditions);
  var isLoadCompletionAlreadyTracked = isInteractivityAlreadyTracked && hasSameElements(loadCompletionConditions, fulfilledLoadCompletionConditions);

  // update conditions and track if needed

  if (!isInteractivityAlreadyTracked) {
    addCondition(interactivityConditions, fulfilledInteractivityConditions, condition);
    setEntries(entries);
    trackForInteractivity(entry);
  }

  if (!isLoadCompletionAlreadyTracked) {
    addCondition(loadCompletionConditions, fulfilledLoadCompletionConditions, condition);
    setEntries(entries);
    trackForLoadCompletion(entry);
  }
};

var populate = function populate() {
  currentOptions.configApi.get(currentOptions.configUrl).then(function (response) {
    return currentOptions.storageApi.setItem(currentOptions.key, response.data[currentOptions.key]);
  }).catch(function (err) {
    _loglevel2.default.error('Unable to get timing entries', err);
    currentOptions.storageApi.setItem(currentOptions.key, []);
  });
};

var resetPartiallyTrackedEntries = function resetPartiallyTrackedEntries() {
  var entries = getEntries();
  var rawEntries = entries.filter(function (_ref) {
    var conditions = _ref.conditions,
        fulfilledConditions = _ref.fulfilledConditions;
    return !(fulfilledConditions && hasSameElements(conditions.interactivity, fulfilledConditions.interactivity) && hasSameElements(conditions.loadCompletion, fulfilledConditions.loadCompletion));
  }).map(function (_ref2) {
    var name = _ref2.name,
        conditions = _ref2.conditions,
        analytics = _ref2.analytics;
    return { name: name, conditions: conditions, analytics: analytics };
  });

  setEntries(rawEntries);
};

var getEntries = function getEntries() {
  return currentOptions.storageApi.getItem(currentOptions.key) || [];
};

var setEntries = function setEntries(entries) {
  return currentOptions.storageApi.setItem(currentOptions.key, entries);
};

var getEntryIndex = function getEntryIndex(key, entries) {
  return entries.findIndex(function (entry) {
    return new RegExp(entry.name, 'i').test(key);
  });
};

var isEmpty = function isEmpty(array) {
  return array.length === 0;
};

var hasSameElements = function hasSameElements(array1, array2) {
  return array1.sort().join(',') === array2.sort().join(',');
};

var addCondition = function addCondition(conditions, fulfilledConditions, conditionToBeAdded) {
  if (conditions.indexOf(conditionToBeAdded) !== -1 && fulfilledConditions.indexOf(conditionToBeAdded) === -1) {
    fulfilledConditions.push(conditionToBeAdded);
  }
};

var trackForInteractivity = function trackForInteractivity(entry) {
  var conditions = entry.conditions,
      fulfilledConditions = entry.fulfilledConditions;


  if (hasSameElements(conditions.interactivity, fulfilledConditions.interactivity)) {
    track(entry, TIMING_LABEL_INTERACTIVITY);
  }
};

var trackForLoadCompletion = function trackForLoadCompletion(entry) {
  var conditions = entry.conditions,
      fulfilledConditions = entry.fulfilledConditions;


  if (hasSameElements(conditions.interactivity, fulfilledConditions.interactivity) && hasSameElements(conditions.loadCompletion, fulfilledConditions.loadCompletion)) {
    track(entry, TIMING_LABEL_LOAD_COMPLETION);
  }
};

var track = function track(entry, conditionType) {
  var timingCategory = entry.analytics.timingCategory;

  var diff = new Date().getTime() - entry.startedAt;
  // 'send', 'timing', 'timingCategory', 'timingVar', 'timingVal', 'timingLabel'
  if (currentOptions.isTrackingEnabled) {
    currentOptions.googleAnalyticsApi('send', 'timing', timingCategory, conditionType, diff);
  }
};
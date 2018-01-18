import log from 'loglevel';
import { getDefaultOptions } from './default-options';

const TIMING_LABEL_INTERACTIVITY = 'Interactivity';
const TIMING_LABEL_LOAD_COMPLETION = 'Load completion';

let currentOptions;

export const setup = options => {
  if (currentOptions) {
    log.warn('Already initialized');
    return;
  }

  currentOptions = {
    ...getDefaultOptions(),
    ...options
  };

  populate();
};

export const startTracking = (key, startedAt = new Date().getTime()) => {
  let entries = getEntries();
  let entryIndex = getEntryIndex(key, entries);

  if (entryIndex === -1) {
    return;
  }

  entries[entryIndex].startedAt = startedAt;
  setEntries(entries);
};

export const fulfillCondition = (key, condition) => {
  let entries = getEntries();
  let entryIndex = getEntryIndex(key, entries);

  if (entryIndex === -1) {
    return;
  }

  let entry = entries[entryIndex];

  if (!entry.startedAt) {
    return;
  }

  let interactivityConditions = entry.conditions.interactivity;
  let loadCompletionConditions = entry.conditions.loadCompletion;

  let isInteractivityAlreadyTracked = isEmpty(interactivityConditions);
  let isLoadCompletionAlreadyTracked = isInteractivityAlreadyTracked && isEmpty(loadCompletionConditions);

  // update conditions and track if needed

  if (!isInteractivityAlreadyTracked) {
    entry.conditions.interactivity = removeCondition(interactivityConditions, condition);
    setEntries(entries);
    trackForInteractivity(entry);
  }

  if (!isLoadCompletionAlreadyTracked) {
    entry.conditions.loadCompletion = removeCondition(loadCompletionConditions, condition);
    setEntries(entries);
    trackForLoadCompletion(entry);
  }
};

const populate = () => {
  if (isEmpty(getEntries()) || currentOptions.isAutoReset) {
    currentOptions.configApi
      .get(currentOptions.configUrl)
      .then(response => currentOptions.storageApi.setItem(currentOptions.key, response.data[currentOptions.key]))
      .catch(err => {
        log.error('Unable to get timing entries', err);
        currentOptions.storageApi.setItem(currentOptions.key, []);
      });
  }
};

const getEntries = () => currentOptions.storageApi.getItem(currentOptions.key) || [];

const setEntries = entries => currentOptions.storageApi.setItem(currentOptions.key, entries);

const getEntryIndex = (key, entries) => entries.findIndex(entry => new RegExp(entry.name, 'i').test(key));

const isEmpty = array => array.length === 0;

const removeCondition = (conditions, conditionToBeRemoved) =>
  conditions.filter(condition => !new RegExp(condition, 'i').test(conditionToBeRemoved));

const trackForInteractivity = entry => {
  if (isEmpty(entry.conditions.interactivity)) {
    track(entry, TIMING_LABEL_INTERACTIVITY);
  }
};

const trackForLoadCompletion = entry => {
  let conditions = entry.conditions;
  if (isEmpty(conditions.interactivity) && isEmpty(conditions.loadCompletion)) {
    track(entry, TIMING_LABEL_LOAD_COMPLETION);
  }
};

const track = (entry, conditionType) => {
  let { timingCategory } = entry.analytics;
  const diff = new Date().getTime() - entry.startedAt;
  // 'send', 'timing', 'timingCategory', 'timingVar', 'timingVal', 'timingLabel'
  currentOptions.googleAnalyticsApi('send', 'timing', timingCategory, conditionType, diff);
};

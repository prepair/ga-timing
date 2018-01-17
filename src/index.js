import log from 'loglevel';
import { getDefaultOptions } from './default-options';

const TIMING_LABEL_INTERACTIVITY = 'Interactivity';
const TIMING_LABEL_LOAD_COMPLETION = 'Load completion';

let currentOptions;

export const setup = options => {
  currentOptions = {
    ...getDefaultOptions(),
    ...options
  };

  populate();
};

export const startTracking = (key, startedAt = new Date().getTime()) => {
  let entries = getTimingEntries();
  let entryIndex = getEntryIndex(key, entries);

  if (entryIndex === -1) {
    return;
  }

  entries[entryIndex].startedAt = startedAt;
  setTimingEntries(entries);
};

export const fulfillCondition = (key, condition) => {
  let entries = getTimingEntries();
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

  let isInteractivityAlreadyTracked = areConditionsEmpty(interactivityConditions);
  let isLoadCompletionAlreadyTracked = isInteractivityAlreadyTracked && areConditionsEmpty(loadCompletionConditions);

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

const populate = async () => {
  if (getTimingEntries() === null || currentOptions.isAutoReset) {
    currentOptions.configInterface
      .get(currentOptions.configUrl)
      .then(response =>
        currentOptions.storageManagerInterface.setItem(currentOptions.key, response.data[currentOptions.key]))
      .catch(err => {
        log.error('Unable to get timing entries', err);
        currentOptions.storageManagerInterface.setItem(currentOptions.key, []);
      });
  }
};

const getTimingEntries = () => currentOptions.storageManagerInterface.getItem(currentOptions.key);

const setTimingEntries = entries => currentOptions.storageManagerInterface.setItem(currentOptions.key, entries);

const getEntryIndex = (key, entries) => entries.findIndex(entry => new RegExp(entry.name, 'i').test(key));

const areConditionsEmpty = conditions => conditions.length === 0;

const removeCondition = (conditions, conditionToBeRemoved) =>
  conditions.filter(condition => !new RegExp(condition, 'i').test(conditionToBeRemoved));

const trackForInteractivity = entry => {
  if (areConditionsEmpty(entry.conditions.interactivity)) {
    track(entry, TIMING_LABEL_INTERACTIVITY);
  }
};

const trackForLoadCompletion = entry => {
  let conditions = entry.conditions;
  if (areConditionsEmpty(conditions.interactivity) && areConditionsEmpty(conditions.loadCompletion)) {
    track(entry, TIMING_LABEL_LOAD_COMPLETION);
  }
};

const track = (entry, conditionType) => {
  let { timingCategory, timingVar } = entry.analytics;
  const diff = new Date().getTime() - entry.startedAt;
  // 'send', 'timing', 'timingCategory', 'timingVar', 'timingVal', 'timingLabel'
  currentOptions.googleAnalyticsInterface('send', 'timing', timingCategory, timingVar, diff, conditionType);
};

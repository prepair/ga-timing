# GA timing
Google Analytics user timing for UI components
## Installation
```bash
npm i -S @prepair/ga-timing
```
## Setup

```js
import { setup } from '@prepair/ga-timing';
import { myCustomGetStorageItem, myCustomSetStorageItem, myCustomGetConfig } from '../my-custom';

...

setup({
    isAutoReset: false,
    isTrackingEnabled: true,
    storageApi: {
        getItem: myCustomGetStorageItem,
        setItem: myCustomSetStorageItem
    },
    configApi: {
        get: myCustomGetConfig
    },
    googleAnalyticsApi: window.gtag
});
```

## Options
| name | type | default | description |
| - | - | - | - |
| key | **String** | `userTimingConfigurations` | the root key of the config JSON and the key for the storage item |
| isAutoReset | **Boolean** | `false`  | if `true` it loads the default configuration into the storage on every page load |
| isTrackingEnabled | **Boolean** | `true`  | if `false` it won't call the googleAnalyticsApi |
| storageApi | **Object** | [default implementation](../master/src/session-storage.js) | get and set methods for interacting the storage |
| configApi | **Object** | [default implementation](../master/src/request.js) | XHR request wrapper for config endpoint |
| googleAnalyticsApi | **Object** | `window.gtag` | Google Analytics gtag object |

## Example for config JSON
```json
{
  "userTimingConfigurations": [
    {
      "name": "timingCategory.childCategory",
      "conditions": {
        "interactivity": ["COND_0"],
        "loadCompletion": ["COND_1", "COND_2"]
      },
      "analytics": {
        "timingCategory": "Timing category / Child category"
      }
    }
  ]
}
```

## Tracking example
```js
import * as gaTiming from '@prepair/ga-timing';

const TIMING_CATEGORY = 'timingCategory.childCategory';

...

onStart () {
    gaTiming.startTracking(TIMING_CATEGORY);
    // OR gaTiming.startTracking(TIMING_CATEGORY, window.performance.timing.*)
}

...

componentReady () {
    gaTiming.fulfillCondition(TIMING_CATEGORY, 'COND_0');
    // emits the following GA 'timing' event
    // timingCategory: TIMING_CATEGORY, timingVar: 'Interactivity', timingVal: ~1000
}

onLoad1 () {
    gaTiming.fulfillCondition(TIMING_CATEGORY, 'COND_1');
}

onLoad2 () {
    gaTiming.fulfillCondition(TIMING_CATEGORY, 'COND_2');
    // emits the following GA 'timing' event
    // timingCategory: TIMING_CATEGORY, timingVar: 'Load completion', timingVal: ~2000
}

...

onSpecialEvent () {
	gaTiming.skipTracking(TIMING_CATEGORY);
}

...
```

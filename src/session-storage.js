export const getSessionItem = key => JSON.parse(window.sessionStorage.getItem(key));

export const setSessionItem = (key, item) =>
  window.sessionStorage.setItem(key, typeof item === 'string' ? item : JSON.stringify(item));

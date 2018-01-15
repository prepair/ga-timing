'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var get = exports.get = function get(url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      return resolve({
        data: JSON.parse(xhr.responseText),
        status: xhr.status
      });
    };
    xhr.onerror = function (error) {
      return reject(new Error(error));
    };
    xhr.open('GET', '/timing.json');
    xhr.send();
  });
};
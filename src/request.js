export const get = url =>
  new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.onload = () =>
      resolve({
        data: JSON.parse(xhr.responseText),
        status: xhr.status
      });
    xhr.onerror = error => reject(new Error(error));
    xhr.open('GET', url);
    xhr.send();
  });

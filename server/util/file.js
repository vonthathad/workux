import fs from 'fs-extra';
import childProcess from 'child_process';

export function writeFileFromByte64(path, base64Data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, base64Data, 'base64', err => {
      if (err) { reject({ code: 500, err }); return; }
      resolve();
    });
  });
}

export function checkExist(path) {
  return new Promise((resolve) => {
    fs.exists(path, (exists) => {
      resolve(exists);
    });
  });
}
export function optiJPEG(path) {
  return new Promise((resolve, reject) => {
    childProcess.exec(`convert ${path} -sampling-factor 4:2:0 -strip -quality 75 -interlace JPEG -colorspace RGB  ${path}`, (err) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve();
    });
  });
}

export function removeF(path) {
  return new Promise((resolve, reject) => {
    fs.remove(path, err => {
      if (err)reject({ code: 500, err });
      resolve();
    });
  });
}

export function createFolder(path) {
  return new Promise((resolve, reject) => {
    childProcess.exec(`mkdir ${path} `, (err) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve();
    });
  });
}

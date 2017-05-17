import { createClient } from 'redis';
const redis = createClient(6379, 'localhost');

export function redisCheckExist(key) {
  return new Promise((resolve, reject) => {
    redis.ttl(key, (err, value) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(value);
    });
  });
}
export function redisUpdate(key, value) {
  return new Promise((resolve, reject) => {
    redis.set(key, value, (err) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve();
    });
  });
}
export function redisDelete(key) {
  return new Promise((resolve, reject) => {
    redis.del(key, (err) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve();
    });
  });
}
export function redisGet(key) {
  return new Promise((resolve, reject) => {
    redis.get(key, (err, reply) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(reply);
    });
  });
}
export function redisGetAll() {
  return new Promise((resolve, reject) => {
    redis.keys('*', (err, reply) => {
      if (err) { reject({ code: 500, err }); return; }
      resolve(reply);
    });
  });
}
export function redisSetExpire(key, time) {
  return new Promise((resolve) => {
    redis.expire(key, time);
    resolve();
  });
}

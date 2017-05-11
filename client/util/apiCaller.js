import fetch from 'isomorphic-fetch';
import Config from '../../server/config';

// export const API_URL = (typeof window === 'undefined' || process.env.NODE_ENV === 'test') ?
//   process.env.BASE_URL || (`http://localhost:${process.env.PORT || Config.port}/api`) :
//   '/api';
export const API_URL = (process.env.NODE_ENV === 'development' || typeof(window) !== 'undefined' && window.location.href.indexOf('localhost') !== -1) ?
  'http://localhost:4000/api' : 'http://tuoihoctro.co/api';

const guestToken = 'GUEST_TOKEN_HERE';
let token;
export default function callApi(endpoint, method = 'get', body) {
  const authorization = (token) ? `Bearer ${token}` : `Bearer ${guestToken}`;
  const headers = { 'content-type': 'application/json' };
  if (endpoint.indexOf('access_token') < 0) {
    headers.authorization = authorization;
  }
  return fetch(`${API_URL}/${endpoint}`, {
    headers,
    method,
    body: JSON.stringify(body),
  })
  .then(response => response.json().then(json => ({ json, response })))
  .then(({ json, response }) => {
    if (!response.ok) {
      return Promise.reject(json);
    }

    return json;
  })
  .then(
    response => response,
    error => error
  );
}

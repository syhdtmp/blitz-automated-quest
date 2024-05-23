import axios from 'axios';

import { prettyLog } from './log.js';

export async function logRequestTime(url, method, data = {}, headers = {}) {
  const startTime = Date.now();
  try {
    const response = await axios({
      method: method,
      url: url,
      data: data,
      headers: headers
    });
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    prettyLog(`Request to ${url} took ${timeElapsed} ms`, 'info');
    return response;
  } catch (error) {
    const endTime = Date.now();
    const timeElapsed = endTime - startTime;
    prettyLog(`Request to ${url} failed after ${timeElapsed} ms: ${error.message}`, 'error');
    throw error;
  }
}

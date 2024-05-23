import { persistentState, userState } from "../state/index.js";
import { logRequestTime } from './fetch.js';
import { prettyLog } from './log.js';

export async function getProfile() {
  const url = `${persistentState.baseUrl}/user/current-profile`;
  try {
    const response = await logRequestTime(url, 'post', {}, {
      Authorization: `Bearer ${userState.token}`
    });
    const { data } = response;
    if (data.code !== 0) {
      throw new Error(`Error request with code ${data.code}`);
    }
    return data.data;
  } catch (error) {
    prettyLog(`Unable to get profile: ${error.message}`, 'error');
  }
}

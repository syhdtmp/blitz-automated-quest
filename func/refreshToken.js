import axios from "axios";
import { persistentState } from "../state/index.js";
import { logRequestTime } from "./fetch.js";
import { prettyLog } from "./log.js";

export async function refreshAuthToken(refreshToken) {
  const requestData = { refreshToken };
  const url = `${persistentState.baseUrl}/auth/refresh-token`;

  try {
    const response = await logRequestTime(url, 'post', requestData);
    const responseData = response.data;

    if (responseData.code !== 0) {
      throw new Error(`Error request: ${responseData.message}`);
    }

    return responseData.data.token;
  } catch (error) {
    prettyLog(`Error while refreshing the token: ${error.message}`, 'error');
  }
}

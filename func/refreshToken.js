import axios from "axios";
import { persistentState } from "../state/index.js";

export async function refreshAuthToken(refreshToken) {
  const requestData = { refreshToken };
  try {
    const url =
      `${persistentState.baseUrl}/auth/refresh-token`;
    const response = await axios.post(url, requestData);
    const responseData = response.data;
    if (responseData.code != 0) {
      throw new Error("Error request with status code " + responseData.code);
    }
    const token = responseData.data.token;
    return token;
  } catch (error) {
    console.log("Error while refresh the token : " + error.message);
  }
}

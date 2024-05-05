import axios from "axios";
import { persistentState, userState } from "../state/index.js";

export async function getProfile() {
  try {
    const url =
      `${persistentState.baseUrl}/user/current-profile`;
    const response = await axios.post(
      url,
      {},
      { headers: { Authorization: "Bearer " + userState.token } },
    );
    const responseData = response.data;
    if (responseData.code != 0) {
      throw new Error("Error request with code " + responseData.code);
    }
    return responseData.data;
  } catch (error) {
    console.log("Unable to get profile : " + error.message);
  }
}

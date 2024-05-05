import axios from "axios";

export async function refreshAuthToken(refreshToken) {
  const requestData = { refreshToken: refreshToken };
  try {
    const url =
      "https://api-saakuru-gainz.beyondblitz.app/blitz/auth/refresh-token";
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

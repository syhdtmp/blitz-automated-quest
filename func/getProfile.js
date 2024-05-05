import axios from "axios";

export async function getProfile(accessToken) {
  try {
    const url =
      "https://api-saakuru-gainz.beyondblitz.app/blitz/user/current-profile";
    const response = await axios.post(
      url,
      {},
      { headers: { Authorization: "Bearer " + accessToken } },
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

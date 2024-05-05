import axios from "axios";
import { refreshAuthToken } from "./func/refreshToken.js";
import { getProfile } from "./func/getProfile.js";
import { completeAllQuests } from "./func/clearQuest.js";
import { persistentState, processState, userState } from './state/index.js'
import fs from "fs";
import readline from "readline";

async function readTextFile(filePath) {
  const lines = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity, // To recognize both '\r\n' and '\n' as line endings
  });

  for await (const line of rl) {
    if (!line) continue;
    lines.push(line);
  }

  return lines;
}

async function processTokens() {
  processState.attempt++
  const currentTime = new Date().toLocaleString();
  console.log(
    `============================Attempt-${processState.attempt}============================`,
  );
  console.log(
    `[Scheduled Task] [${currentTime}] Executing code every six hours...`,
  );
  console.log(
    "=================================================================",
  );

  const refreshTokens = await readTextFile(persistentState.readFile);
  if (refreshTokens.length == 0) {
    console.log(
      "Please provide refresh tokens in token.txt file (each new line equal to new identity)",
    );
    process.kill(process.pid, "SIGINT");
    return;
  }
  console.log("[-] Read all provided identity : ", refreshTokens.length);

  for (const [index, refreshToken] of refreshTokens.entries()) {
    const token = await refreshAuthToken(refreshToken);
    userState.token = token
    const profile = await getProfile(token);
    userState.name = profile.name
    userState.twitterHandle = profile.twitterHandle

    await applyReferalCode();

    await completeAllQuests();
  }
  console.log(
    `============================End Attempt-${processState.attempt}============================`,
  );
  console.log(
    `[Scheduled Task] [${currentTime}] Waiting for another six hours...`,
  );
  console.log(
    "=================================================================",
  );
}

async function applyReferalCode() {
  try {
    const response = await axios.post(
      `${persistentState.baseUrl}/user/apply-referral-code`,
      { referralCode: persistentState.referralCode },
      { headers: { Authorization: "Bearer " + userState.token } },
    );
    const responseData = response.data;
    if (responseData.code != 0) {
      console.log(`[-][${userState.twitterHandle}] Applying referal code : ${responseData.message}`);
      return;
    }
    console.log(`[-][${userState.twitterHandle}] Applying referal code : success`);
  } catch (error) {
    console.log("Error applying referal code : " + error.message);
  }
}

processTokens();

const interval = 6 * 60 * 60 * 1000; // 6 hours
const intervalId = setInterval(processTokens, interval);

process.on("SIGINT", () => {
  console.log("[Scheduled Task] Received SIGINT. Exiting gracefully...");

  // Clear the interval
  clearInterval(intervalId);

  // Exit the process
  process.exit(0);
});

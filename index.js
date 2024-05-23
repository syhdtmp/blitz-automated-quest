import axios from "axios";
import { refreshAuthToken } from "./func/refreshToken.js";
import { getProfile } from "./func/getProfile.js";
import { completeAllQuests } from "./func/clearQuest.js";
import { persistentState, processState, userState } from './state/index.js'
import fs from "fs";
import readline from "readline";
import { prettyLog } from './func/log.js';

async function readTextFile(filePath) {
  const lines = [];

  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    if (line) lines.push(line);
  }

  return lines;
}

async function processTokens() {
  incrementProcessAttempt();
  logScheduledTaskStart();

  const refreshTokens = await readTextFile(persistentState.readFile);
  if (refreshTokens.length === 0) {
    prettyLog("Please provide refresh tokens in token.txt file (each new line equal to new identity)", "error");
    process.exit();
  }

  prettyLog("[-] Read all provided identity : " + refreshTokens.length, "info");

  for (const refreshToken of refreshTokens) {
    await processSingleToken(refreshToken);
  }

  logScheduledTaskEnd();
}

async function processSingleToken(refreshToken) {
  const token = await refreshAuthToken(refreshToken);
  userState.token = token;
  const profile = await getProfile(token);
  userState.name = profile.name;
  userState.twitterHandle = profile.twitterHandle;

  await applyReferalCode();
  await completeAllQuests();
}

async function applyReferalCode() {
  try {
    const response = await axios.post(
      `${persistentState.baseUrl}/user/apply-referral-code`,
      { referralCode: persistentState.referralCode },
      { headers: { Authorization: "Bearer " + userState.token } },
    );
    const responseData = response.data;
    prettyLog(`[-][${userState.twitterHandle}] Applying referal code : ${responseData.code !== 0 ? responseData.message : 'success'}`, "info");
  } catch (error) {
    prettyLog("Error applying referal code : " + error.message, "error");
  }
}

function incrementProcessAttempt() {
  processState.attempt++;
}

function logScheduledTaskStart() {
  const currentTime = new Date().toLocaleString();
  prettyLog(`============================Attempt-${processState.attempt}============================`, "info");
  prettyLog(`[Scheduled Task] [${currentTime}] Executing code every six hours...`, "info");
  prettyLog("=================================================================", "info");
}

function logScheduledTaskEnd() {
  const currentTime = new Date().toLocaleString();
  prettyLog(`============================End Attempt-${processState.attempt}============================`, "info");
  prettyLog(`[Scheduled Task] [${currentTime}] Waiting for another six hours...`, "info");
  prettyLog("=================================================================", "info");
}

processTokens();

const interval = 6 * 60 * 60 * 1000; // 6 hours
const intervalId = setInterval(processTokens, interval);

process.on("SIGINT", () => {
  prettyLog("[Scheduled Task] Received SIGINT. Exiting gracefully...", "info");
  clearInterval(intervalId);
  process.exit(0);
});

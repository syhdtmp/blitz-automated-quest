import axios from "axios";
import { refreshAuthToken } from "./func/refreshToken.js";
import { getProfile } from "./func/getProfile.js";
import { completeAllQuests } from "./func/clearQuest.js";
import fs from "fs";
import readline from "readline";

const filePath = "token.txt";

let attempt = 0;

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
  attempt++;
  const currentTime = new Date().toLocaleString();
  console.log(
    `============================Attempt-${attempt}============================`,
  );
  console.log(
    `[Scheduled Task] [${currentTime}] Executing code every six hours...`,
  );
  console.log(
    "=================================================================",
  );

  const refreshTokens = await readTextFile(filePath);
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
    const profile = await getProfile(token);
    console.log("[-] Twitter Name : " + profile.name);
    console.log("[-] Twitter Handle : " + profile.twitterHandle);
    await applyReferalCode(token, "U4OKLYBW");

    await completeAllQuests(token);
  }
}

async function applyReferalCode(token, referralCode) {
  try {
    const response = await axios.post(
      "https://api-saakuru-gainz.beyondblitz.app/blitz/user/apply-referral-code",
      { referralCode },
      { headers: { Authorization: "Bearer " + token } },
    );
    const responseData = response.data;
    if (responseData.code != 0) {
      console.log(`[-] Applying referal code : ${responseData.message}`);
      return;
    }
    console.log(`[-] Applying referal code : success`);
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

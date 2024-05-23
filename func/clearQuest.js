import axios from "axios";
import { getAllCompletedQuests, getCurrentQuests } from "./getQuest.js";
import { persistentState, platformState, userState } from "../state/index.js";
import { logRequestTime } from "./fetch.js"; // Import the logRequestTime function
import { prettyLog } from './log.js'; // Import prettyLog for logging

export async function completeAllQuests() {
  try {
    platformState.claimedQuest = []
    platformState.unclaimableQuest = []
    platformState.claimedPoints = 0
    const currentQuests = await getCurrentQuests();
    const completedQuests = (await getAllCompletedQuests()).map(
      (quest) => quest.questTaskId,
    );
    const mappedCurrentQuests = currentQuests.reduce((a, b) => {
      return {
        ...a,
        [b.id]: b
      }
    }, {})

    const incompleteQuests = currentQuests.filter((quest) => {
      return !completedQuests.includes(quest.id);
    });

    let nonFollowTask = [];
    for (const quest of incompleteQuests) {
      if (quest.category === "follow_twitter") {
        await claimQuestFollow(quest.id);
      } else {
        await claimQuest(quest.id);
        nonFollowTask.push(quest.category + " - " + quest.name);
      }
    }
    prettyLog(`[-][${userState.twitterHandle}] Past completed quests : ${completedQuests.length}`);
    prettyLog(`[-][${userState.twitterHandle}] New completed quests : ${platformState.claimedQuest.length}, claimed points : ${platformState.claimedPoints}`);
    prettyLog(
      `[-][${userState.twitterHandle}] Detected ${nonFollowTask.length} non following tasks : \n + ${nonFollowTask.join("\n + ")}`,
    );

    if (platformState.unclaimableQuest.length) {
      prettyLog(
        `[-][${userState.twitterHandle}] Detected ${platformState.unclaimableQuest.length} unclaimable quests : `,
      );
      for (const [index, taskId] of platformState.unclaimableQuest.entries()) {
        const quest = mappedCurrentQuests[taskId]
        if (quest) {
          prettyLog(` + ${quest.name}`)
        } else {
          prettyLog(` + Quest unidentifiable`)
        }
      }
    }
  } catch (error) {
    prettyLog(error.message, 'error');
  }
}

export async function claimQuestFollow(taskId) {
  try {
    const response = await logRequestTime(
      `${persistentState.baseUrl}/quest/claim-task-follow-twitter`,
      'post',
      {
        questId: platformState.questId,
        taskId
      },
      {
        Authorization: "Bearer " + userState.token
      }
    );
    const responseData = response.data
    if (responseData.code != 0) {
      prettyLog(`[-][${userState.twitterHandle}] Skipping unclaimable quests`)
      platformState.unclaimableQuest.push(taskId)
      return
    }
    prettyLog(`[-][${userState.twitterHandle}] Added ${responseData.data.totalPoints} point`);
    platformState.claimedQuest.push(taskId)
    platformState.claimedPoints += responseData.data.totalPoints
  } catch (error) {
    prettyLog("Unable to claim follow quest : " + error.message, 'error');
  }
}

export async function claimQuest(taskId) {
  try {
    const response = await logRequestTime(
      `${persistentState.baseUrl}/quest/claim-quest-task`,
      'post',
      {
        questId: platformState.questId,
        taskIds: [taskId]
      },
      {
        Authorization: "Bearer " + userState.token
      }
    );
    const responseData = response.data
    if (responseData.code != 0) {
      prettyLog(`[-][${userState.twitterHandle}] Skipping unclaimable quests`)
      platformState.unclaimableQuest.push(taskId)
      return
    }
    prettyLog(`[-][${userState.twitterHandle}] Added ${responseData.data.totalPoints} point`);
    platformState.claimedQuest.push(taskId)
    platformState.claimedPoints += responseData.data.totalPoints
  } catch (error) {
    prettyLog("Unable to claim quest : " + error.message, 'error');
  }
}

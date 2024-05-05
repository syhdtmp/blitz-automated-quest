import axios from "axios";
import { getAllCompletedQuests, getCurrentQuests } from "./getQuest.js";
import { persistentState, platformState, userState } from "../state/index.js";

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
    console.log(`[-][${userState.twitterHandle}] Past completed quests : ${completedQuests.length}`);
    console.log(`[-][${userState.twitterHandle}] New completed quests : ${platformState.claimedQuest.length}, claimed points : ${platformState.claimedPoints}`);
    console.log(
      `[-][${userState.twitterHandle}] Detected ${nonFollowTask.length} non following tasks : \n + ${nonFollowTask.join("\n + ")}`,
    );

    if (platformState.unclaimableQuest.length) {
      console.log(
        `[-][${userState.twitterHandle}] Detected ${platformState.unclaimableQuest.length} unclaimable quests : `,
      );
      for (const [index, taskId] of platformState.unclaimableQuest.entries()) {
        const quest = mappedCurrentQuests[taskId]
        if (quest) {
          console.log(` + ${quest.name}`)
        } else {
          console.log(` + Quest unidentifiable`)
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export async function claimQuestFollow(taskId) {
  try {
    const response = await axios.post(
      `${persistentState.baseUrl}/quest/claim-task-follow-twitter`,
      {
        questId: platformState.questId,
        taskId
      },
      {
        headers: { Authorization: "Bearer " + userState.token },
      },
    );
    const responseData = response.data
    if (responseData.code != 0) {
      console.log(`[-][${userState.twitterHandle}] Skipping unclaimable quests`)
      platformState.unclaimableQuest.push(taskId)
      return
    }
    console.log(`[-][${userState.twitterHandle}] Added ${responseData.data.totalPoints} point`);
    platformState.claimedQuest.push(taskId)
    platformState.claimedPoints += responseData.data.totalPoints
  } catch (error) {
    console.log("Unable to claim follow quest : " + error.message);
  }
}

export async function claimQuest(taskId) {
  try {
    const response = await axios.post(
      `${persistentState.baseUrl}/quest/claim-quest-task`,
      {
        questId: platformState.questId,
        taskIds: [taskId]
      },
      {
        headers: { Authorization: "Bearer " + userState.token },
      },
    );
    const responseData = response.data
    if (responseData.code != 0) {
      console.log(`[-][${userState.twitterHandle}] Skipping unclaimable quests`)
      platformState.unclaimableQuest.push(taskId)
      return
    }
    console.log(`[-][${userState.twitterHandle}] Added ${responseData.data.totalPoints} point`);
    platformState.claimedQuest.push(taskId)
    platformState.claimedPoints += responseData.data.totalPoints
  } catch (error) {
    console.log("Unable to claim quest : " + error.message);
  }
}

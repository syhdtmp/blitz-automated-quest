import axios from "axios";
import { getAllCompletedQuests, getCurrentQuests } from "./getQuest.js";

export async function completeAllQuests(accessToken) {
  try {
    const currentQuests = await getCurrentQuests(accessToken);
    const completedQuests = (await getAllCompletedQuests(accessToken)).map(
      (quest) => quest.questTaskId,
    );

    const incompleteQuests = currentQuests.filter((quest) => {
      return !completedQuests.includes(quest.id);
    });

    let nonFollowTask = [];
    let newCompletedQuests = 0;
    for (const quest of incompleteQuests) {
      if (quest.category === "follow_twitter") {
        await claimQuestFollow(quest.id, accessToken);
        newCompletedQuests++;
      } else {
        nonFollowTask.push(quest.category + " - " + quest.name);
      }
    }
    console.log(
      `[-] Detected ${nonFollowTask.length} non follow tasks : \n + ${nonFollowTask.join("\n + ")}`,
    );
    console.log(`[-] New completed quests : ${newCompletedQuests}`);
  } catch (error) {
    console.log(error);
  }
}

export async function claimQuestFollow(questId, accessToken) {
  try {
    const response = await axios.post(
      "https://api-saakuru-gainz.beyondblitz.app/blitz/quest/claim-task-follow-twitter",
      {
        questId: "quest_1",
        taskId: questId,
      },
      {
        headers: { Authorization: "Bearer " + accessToken },
      },
    );
    console.log(`[+] Added ${response.data.data.totalPoints} point`);
  } catch (error) {
    console.log("Unable to claim follow quest : " + error.message);
  }
}

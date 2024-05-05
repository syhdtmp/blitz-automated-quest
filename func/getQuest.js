import axios from "axios";
import { persistentState, platformState, userState } from "../state/index.js";

export async function getAllCompletedQuests() {
  try {
    const response = await axios.post(
      `${persistentState.baseUrl}/quest/get-user-quest-statistic`,
      { questId: platformState.questId },
      { headers: { Authorization: "Bearer " + userState.token } },
    );
    const responseData = response.data;
    if (responseData.code != 0) {
      throw new Error(`Error request with code ${responseData.code}`);
    }

    return responseData.data.questTaskStatistic.filter(
      (quest) => quest.isFinished,
    );
  } catch (error) {
    console.log(`Unable to get user quest statistic : ${error.message}`);
  }
}

export async function getCurrentQuests() {
  try {
    const response = await axios.post(
      `${persistentState.baseUrl}/quest/current-quest`,
      { withQuestTask: true, withStatistic: true },
      { headers: { Authorization: "Bearer " + userState.token } },
    );

    const responseData = response.data
    if (responseData.code != 0) {
      throw new Error("Error request with code " + responseData.code)
    }

    platformState.questId = responseData.data.id

    const quests = response.data.data.tasks.map((quest) => ({
      id: quest.id,
      category: quest.category,
      name: quest.name,
    }));

    return quests;
  } catch (error) {
    console.log(`Unable to get current quests data : ${error.message}`);
  }
}

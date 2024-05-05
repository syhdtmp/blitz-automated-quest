import axios from "axios";

export async function getAllCompletedQuests(accessToken) {
  try {
    const response = await axios.post(
      "https://api-saakuru-gainz.beyondblitz.app/blitz/quest/get-user-quest-statistic",
      { questId: "quest_1" },
      { headers: { Authorization: "Bearer " + accessToken } },
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

export async function getCurrentQuests(accessToken) {
  try {
    const response = await axios.post(
      "https://api-saakuru-gainz.beyondblitz.app/blitz/quest/current-quest",
      { withQuestTask: true, withStatistic: true },
      { headers: { Authorization: "Bearer " + accessToken } },
    );

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

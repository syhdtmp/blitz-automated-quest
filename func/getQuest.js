import { persistentState, platformState, userState } from "../state/index.js";
import { logRequestTime } from './fetch.js';
import { prettyLog } from './log.js'; // Import prettyLog for logging

async function fetchFromApi(endpoint, data, headers) {
  const url = `${persistentState.baseUrl}${endpoint}`;
  const response = await logRequestTime(url, 'POST', data, headers);
  const responseData = response.data;
  if (responseData.code !== 0) {
    throw new Error(`Error request with code ${responseData.code}`);
  }
  return responseData;
}

export async function getAllCompletedQuests() {
  try {
    const responseData = await fetchFromApi(
      '/quest/get-user-quest-statistic',
      { questId: platformState.questId },
      { Authorization: "Bearer " + userState.token }
    );

    return responseData.data.questTaskStatistic.filter(quest => quest.isFinished);
  } catch (error) {
    prettyLog(`Unable to get user quest statistic: ${error.message}`, 'error');
  }
}

export async function getCurrentQuests() {
  try {
    const responseData = await fetchFromApi(
      '/quest/current-quest',
      { withQuestTask: true, withStatistic: true },
      { Authorization: "Bearer " + userState.token }
    );

    platformState.questId = responseData.data.id;

    return responseData.data.tasks.map(quest => ({
      id: quest.id,
      category: quest.category,
      name: quest.name,
    }));
  } catch (error) {
    prettyLog(`Unable to get current quests data: ${error.message}`, 'error');
  }
}

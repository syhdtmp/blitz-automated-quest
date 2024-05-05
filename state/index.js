export const persistentState = {
  referralCode: "U31QUAKN",
  baseUrl: 'https://api.beyondblitz.app/blitz',
  readFile: 'token.txt'
}

export let processState = {
  attempt: 0,
}

export let platformState = {
  questId: '',
  unclaimableQuest: 0,
  claimedQuest: 0,
  claimedPoints: 0
}

export let userState = {
  name: "",
  twitterHandle: "",
  token: "",
};

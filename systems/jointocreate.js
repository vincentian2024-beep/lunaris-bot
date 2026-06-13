import fs from "fs";

const JTC_CHANNEL = "1514875884975423518";
const VC_CATEGORY = "1514630686630346945";

const DATA_FILE = "./data/voice.json";

function loadData() {
  return JSON.parse(
    fs.readFileSync(DATA_FILE, "utf8")
  );
}

function saveData(data) {
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify(data, null, 2)
  );
}

export async function handleJoinToCreate(
  oldState,
  newState
) {

}

export async function handleVCButtons(
  interaction
) {

}

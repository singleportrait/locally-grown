import clone from 'rfdc';

export const repeatProgramBlocks = (programBlocks) => {
  const programBlocksTotal = programBlocks.length - 1;

  let repeatedProgramBlocks = [];

  // Loop through existing program blocks to add to array
  // Set their hours to be 0, 1, 2, ... until there are no more
  // Loop through the programs, increasing hours until we get to 23
  let i = 0;
  let hour = 0;
  while (hour < 24) {
    // consoleLog("i: ", i, "hour: ", hour);
    // Note: Deep-copying object
    const repeatedProgramBlock = clone()(programBlocks[i]);
    repeatedProgramBlock.fields.startTime = hour;
    repeatedProgramBlocks.push(repeatedProgramBlock);

    i < programBlocksTotal ? i++ : i = 0;

    hour++;
  }
  return repeatedProgramBlocks;
}

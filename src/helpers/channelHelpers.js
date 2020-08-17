import clone from 'rfdc';

export const repeatProgramBlocks = (programBlocks) => {
  const total = programBlocks.length - 1;

  // Loop through existing program blocks to add to array
  // Set their hours to be 0, 1, 2, ... until there are no more
  // Loop through the programs, increasing hours until we get to 23
  let repeatedProgramBlocks = [];
  let i = 0;
  let hour = 0;

  while (hour < 24) {
    // Note: Deep-copying object
    const _block = clone()(programBlocks[i]);
    _block.fields.startTime = hour;

    repeatedProgramBlocks.push(_block);

    i < total ? i++ : i = 0;
    hour++;
  }
  return repeatedProgramBlocks;
}

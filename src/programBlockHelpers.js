export const getRelativeSortedProgramBlocks = (programBlocks, currentHour) => {
  const nextHour = currentHour + 1;
  let afterList = [], beforeList = [];

  programBlocks.forEach(item => {
    item.fields.startTime >= nextHour && afterList.push(item);

    item.fields.startTime < currentHour && beforeList.push(item);
  });

  afterList.sort((a, b) => a.fields.startTime - b.fields.startTime);
  beforeList.sort((a, b) => a.fields.startTime - b.fields.startTime);

  return afterList.concat(beforeList);
};

// Also need one that's all program blocks starting now (TV Guide)

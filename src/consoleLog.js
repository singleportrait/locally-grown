const showLogs = process.env.NODE_ENV === `development`;

const consoleLog = (log) => {
  return showLogs ? console.log(log) : null;
}

export default consoleLog;

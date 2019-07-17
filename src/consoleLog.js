const showLogs = process.env.NODE_ENV === `development`;

const consoleLog = (...args) => {
  return showLogs ? console.log(...args) : null;
}

export default consoleLog;

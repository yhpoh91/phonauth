import { configure, getLogger } from 'log4js';

const logLevel = process.env.LOGGING_LEVEL || 'info';

const appenders = {
  out: {
    type: 'stdout',
  },
};

const logConfig = {
  appenders,
  categories: {
    default: {
      appenders: Object.keys(appenders),
      level: logLevel,
    },
  },
};

const buildLog = (logger) => {
  configure(logConfig);
  return {
    L: getLogger(logger),
  };
};

export default buildLog;

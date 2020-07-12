import loggerService from './logger';

const showStack = (process.env.NODE_ENV || 'development').toLowerCase() === 'development';

const { L } = loggerService('Error Handler');

const handleResponseError = (error, req, res, next) => {
  const { response } = error;
  const { status, data } = response;

  L.debug(`Response Error detected (${status})`);
  res.status(status).json(data);
};

const handleError = (error, req, res, next) => {
  if (error.response != null) {
    // Is Response Error
    return handleResponseError(error, req, res, next);
  }

  L.error(error);
  const response = {
    code: 500,
    message: error.message,
    errors: error.errors,
    stack: error.stack,
  };

  if (!showStack) {
    delete response.stack;
  }

  res.status(500).json(response);
};

const handleUnmatched = (req, res, next) => {
  res.status(404).send();
};

export default {
  handleError,
  handleUnmatched,
};

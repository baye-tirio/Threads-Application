export const errorHandler = (statusCode, message) => {
  let error = new Error();
  if (statusCode) error.statusCode = statusCode;
  if (message) error.message = message;
  return error;
};

export const success = (res, data = null, message = 'Success', status = 200) => {
  const body = { success: true };
  if (message) body.message = message;
  if (data !== null && data !== undefined) body.data = data;
  return res.status(status).json(body);
};

export const error = (res, message = 'An error occurred', errors = null, status = 500) => {
  const body = { success: false, message };
  if (errors) body.errors = errors;
  return res.status(status).json(body);
};

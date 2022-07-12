exports.sendResponse = (res, code, success, msg, data, err) => {
  return res.status(code).json({
    success: success,
    message: msg,
    data: data,
    error: err,
  });
};

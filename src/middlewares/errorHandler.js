function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    message: err.message || '서버 내부 오류가 발생했습니다.',
  });
}

module.exports = errorHandler;
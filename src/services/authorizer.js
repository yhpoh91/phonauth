const expectedKey = process.env.SECRET_KEY;

const authorize = (req, res, next) => {
  const actualKey = req.headers['x-phonauth-secret'];
  if (actualKey === expectedKey) {
    next();
    return;
  }

  res.status(403).send();
};

export default {
  authorize,
};

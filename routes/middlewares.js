exports.isLoggedIn = (req, res, next) => {  //로그인 판단 미들웨어
  if (req.isAuthenticated()) {
    next();
  } else {
    res.status(403).send('로그인 필요'); //next가없으니 여기서 끝남 다음으로 안넘어감
  }
};

exports.isNotLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    const message = encodeURIComponent('로그인한 상태입니다.');
    res.redirect(`/?error=${message}`);
  }
};

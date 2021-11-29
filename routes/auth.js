const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {    // 회원가입 라우터, isNotLoggedIn으로 이미 로그인 한사람이 회원가입하는걸 막음
  const { email, nick, password } = req.body;   //프론트에서 보냄
  try {
    const exUser = await User.findOne({ where: { email } });  //먼저 이메일가입됬는지 검사
    if (exUser) {
      return res.redirect('/join?error=exist');   //있으면 검사
    }
    const hash = await bcrypt.hash(password, 12);   //비크립트 해쉬화 후 저장 (보안), 12 숫자 높을 수 록 높은 해쉬( 올라가면 하이성능 필요)
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {    //카카오로 로그인 하거나, 이메일로그인 달라지기에 조금 복잡
  passport.authenticate('local', (authError, user, info) => {  //passport 사용하면 로그인 코드 정리가능
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // 세션 쿠키를 브라우저로 보냄
      return res.redirect('/');
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {  //isLoggedIn 로그인 한사람만 로그아웃 하게
  req.logout();
  req.session.destroy();
  res.redirect('/');
});

router.get('/kakao', passport.authenticate('kakao')); //실행시 kakaostrategy로 이동
// 위에서 카카오 로그인을 하게되고 후에 밑 callback 을 쏴주면 자연스럽게 밑에 코드 실행 !!
router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;

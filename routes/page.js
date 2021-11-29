const express = require('express');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = null;
  res.locals.followerCount = 0;
  res.locals.followingCount = 0;
  res.locals.followerIdList = [];
  next();
});

router.get('/profile', (req, res) => {          //profile.html 필요 -> views 폴더
  res.render('profile', { title: '내 정보 - NodeBird' });
});

router.get('/join', (req, res) => {          //join.html 필요 -> views 폴더
  res.render('join', { title: '회원가입 - NodeBird' });
});

router.get('/', (req, res, next) => {   //들어가자마자 메인 게시물들 twits, main.html -> views 폴더
  const twits = [];
  res.render('main', {
    title: 'NodeBird',
    twits,
    user: req.user,   //user: req.user 추가
  });
});

module.exports = router;

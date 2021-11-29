const express = require('express');
const {Post, User} = require('../models');
const router = express.Router();

router.use((req, res, next) => {   // 전체 실행
  res.locals.user = req.user;
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

router.get('/', async(req, res, next) => {   //들어가자마자 메인 게시물들 twits, main.html -> views 폴더
  try {
    const posts = await Post.findAll({  // findAll로 업로드한 게시물 찾기 ( 글)
      include: {
        model: User,
        attributes: ['id', 'nick'],
      },
      order: [['createdAt', 'DESC']],
    });
    res.render('main', {
      title: 'NodeBird',
      twits: posts, //twiits로 넣어주기 posts 찾은 값
      user: req.user,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
});

module.exports = router;

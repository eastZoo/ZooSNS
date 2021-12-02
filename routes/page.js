const express = require('express');
const {Post, User, Hashtag} = require('../models');
const router = express.Router();

router.use((req, res, next) => {   // 전체 실행
  res.locals.user = req.user;
  res.locals.followerCount = req.user ? req.user.Followers.length : 0;  // req.user가 있다는 건 로그인 했다는 것
  res.locals.followingCount = req.user ? req.user.Followings.length : 0;  //req.user는 passprt/index의 deserialize에서 생성!!중요
  res.locals.followerIdList = req.user ? req.user.Followings.map(f => f.id) : [];
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


// GET /hashtag?hashtag=노드
router.get('/hashtag', async (req, res, next) => {
  const query = decodeURIComponent(req.query.hashtag); // 프론트에서 encode로 설정  서버에서는 decode로 받는다.
  if (!query) {
    return res.redirect('/');
  }
  try {
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      //belogstomany 이기 때문에 가져올때 getPosts 복수형
      posts = await hashtag.getPosts({ include: [{ model: User, attributes: ['id', 'nick'] }] }); //attributes: ['id', 'nick'] 필요한 애들만 보내는게 좋다 보안상 
    }

    return res.render('main', {
      title: `#${query} 검색결과 | davidSNS`,
      twits: posts,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

module.exports = router;

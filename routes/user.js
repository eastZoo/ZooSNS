const express = require('express');

const { isLoggedIn } = require('./middlewares');  //follow는 로그인 한 사람만!!
const User = require('../models/user');

const router = express.Router();

// POST/ user/1/follow
router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ where: { id: req.user.id } }); //나에대한 객체 찾기
    if (user) {
      await user.addFollowings(parseInt(req.params.id, 10)); // 내가 n번 사용자를 팔로잉, setFollowings( set 으로 팔로잉 수정 ), remove,get등,,
      res.send('success');
    } else {
      res.status(404).send('no user');
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag } = require('../models');
const { isLoggedIn } = require('./middlewares');
const { Hash } = require('crypto');

const router = express.Router();

try {
  fs.readdirSync('uploads');
} catch (error) {
  console.error('uploads 폴더가 없어 uploads 폴더를 생성합니다.');
  fs.mkdirSync('uploads');    // upload파일 없으면 안되니까 없을때 생성!!!
}

const upload = multer({   // multer 첫사용!!  multer 설정
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, 'uploads/');   //이미지 upload폴더에 저장
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});


// 왜 이미지 따로 게시글 따로 업로드하냐?? 서비스 정책에따라 다르다 순서는 개발자맘
// 너무 큰 이미지를 올리면 이미지 올릴때 까지 기다려야 된다
// but 이미지 게시글 따로 받을때 이미지 먼저 받으면 이미지 압축하는 동안 게시글 쓰니까 빨리 올라간 느낌 줌
// 그래서 보통 이미지 동영상은 선택하는 즉시 업로드 하는거 선호

router.post('/img', isLoggedIn, upload.single('img'), (req, res) => { // 실제파일은 upload에 들었는데 요청주소는 image?? -> express.static 으로 해결!(app.js)
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });  // 업로드 완료시 url 프론트로 돌려주기, 게시글이랑, 이미지 동영상은 url로 프로트에서 묶어주기
});

//이미지는 이미 업로드 된 상태

router.post('/', isLoggedIn, upload.none(), async (req, res, next) => {  //이미지나 파일 업로드 아니라 바디들만 업로드라서 upload.none() 사용
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      UserId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s#]*/g);  //해쉬태그 걸러내기 정규표현식 공부!!!

    // [#노드, #익스프레스]
    // [노드, 익스프레스]
    // [ findOrCreate(노드), findOrCreate(익스프레스)] , 저장되어있으면 조회, 아니면 생성 = findOrCreate
    // findOrCreate promise 라서 Promise.all로 한번에 처리
    //
    if(hashtags){
      const result = await Promise.all(
        hashtags.map(tag => {
          return Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() },
          })
        }),
        // Hashtag.upsert() 업데이트 인서트 합친 개념 공식문서 확인
      );
      console.log(result);
      await post.addHashtags(result.map(r => r[0]));
      // addHashtags([해쉬태그, 해쉬태그]) 배열안에는 아이디만 넣는게 아니라 크리에이트 결과물인 객체를 넣어줘도 시퀄라이즈가 아이디인지 객체인지 판단 후 추가.! 
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});
 
module.exports = router;

// find, update, create, distroy 알면 기본적으로 디비 다 할 수 있을듯>?
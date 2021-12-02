const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();   //dotenv는 최대한 위로 올려주세요
const pageRouter = require('./routes/page');
const authRouter = require('./routes/auth');
const postRouter = require('./routes/post');
const userRouter = require('./routes/user');
const { sequelize } = require('./models');
const passportConfig= require('./passport');

const app = express();
app.set('port', process.env.PORT || 8001);  //개발시:8001, 배포시 포트를 다르게 하기위해 process.env.PORT

app.set('view engine', 'html');  // 템플릿 엔진인 nujucks 설정 방법
nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false })  // models 수정 사항 있을시 force:true로 테이블 삭제 후 재생성 실무 절대x (alter:true), workbench 직접수정
  .then(() => {     //sequelize.sync = promise기 때문에 then,catch 붙여주면 좋음
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
passportConfig(); //passport폴더 실행 

app.use(morgan('dev'));    //6장 내용
app.use(express.static(path.join(__dirname, 'public')));    //정적파일들 , CSS 등,,
app.use('/img', express.static(path.join(__dirname, 'uploads'))); //post.js 31:0
app.use(express.json());
app.use(express.urlencoded({ extended: true }));  //이메일, 패스워드같은 것들을 req.body, req.password로 바꿔줌, enctype = multipart/form-data 인경우에 못바꿔줌( -> multer)
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
}));
app.use(passport.initialize()); //두개가 익스프레스 세션보다 아래에 있어야함
app.use(passport.session());  // 로그인되어 있으면 브라우저가 세션쿠키 보내는걸 받아와 passport의 deserialize롭 보내줌(해석)

app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/post', postRouter);
app.use('/user', userRouter);

app.use((req, res, next) => {   // 53-56 라우터에서 처리가 되지않으면 404에러가 나고 404에러 처리 미들웨어 ( next 반드시 추가 )
  const error =  new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);      //에러미들웨어로 넘겨줌
});

app.use((err, req, res, next) => {  // 에러 미들웨어 next안쓰더라도 4개 다채워야함 ( 에러미들웨어 유의사항 )
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {}; //개발 모드일때는 에러 상세내역 배포일땐 안보이게{} 스택트레이서
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {    // 포트 대기
  console.log(app.get('port'), '번 포트에서 대기중');
});

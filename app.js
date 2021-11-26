const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();   //dotenv는 최대한 위로 올려주세요
const pageRouter = require('./routes/page');

const app = express();
app.set('port', process.env.PORT || 8001);  //개발시:8001, 배포시 포트를 다르게 하기위해 process.env.PORT

app.set('view engine', 'html');  // 템플릿 엔진인 nujucks 설정 방법
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));    //6장 내용
app.use(express.static(path.join(__dirname, 'public')));    //정적파일들 , CSS 등,,
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.use('/', pageRouter);

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

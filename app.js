const express = require('express')
const app = express()
const port = 3000
const mysql = require('mysql')
const path = require('path')
// const bodyParser = require('body-parser')

// 라우터 설정
const loginRouter = require('./routes/login')
const communityRouter = require('./routes/community')
const myPageRouter = require('./routes/myPage')

const jwt = require('./modules/jwt')
const authUtil = require('./middlewares/auth').checkToken

const fs = require('fs')
const IMG_DIR = 'public/img';
const PROFILE_IMG_DIR = 'public/img/userProfile';
const POST_IMG_DIR = 'public/img/postPhoto';


const con = mysql.createConnection({
  host: 'localhost',
  user: 'workout',
  password: '1234',
  database: 'Today_workout_complete',
});

app.use(express.static('public'))
// application/json
app.use(express.json());
// application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }))

app.use('/api/login', loginRouter)
app.use('/api/community', communityRouter)
app.use('/api/myPage', myPageRouter)

// 0. 연결 확인 코드
con.connect(function(err) {
  if (err) throw err;
  console.log('Connected');
});

//라우터에서 설정되어 있지 않은 주소로 접속하려 할때
app.all('*', (req, res) => {
  res.status(404).send('PAGE NOT FOUND');
});

app.listen(port, () => {
  
  // public/img 폴더 없으면 생성
  if (!fs.existsSync(IMG_DIR)) fs.mkdirSync(IMG_DIR);
  else console.log("--------------");

  // public/img/userProfile 폴더 없으면 생성
  if (!fs.existsSync(PROFILE_IMG_DIR)) fs.mkdirSync(PROFILE_IMG_DIR);
  else console.log("--------------");

  // public/img/postPhoto 폴더 없으면 생성
  if (!fs.existsSync(POST_IMG_DIR)) fs.mkdirSync(POST_IMG_DIR);
  else console.log("--------------");

  console.log('Example prot: ${port}')
})




// 잉여 코드, 코드 모듈화 시 사용
// let storage  = multer.diskStorage({
//   destination(req, file, cb) {
//     if(req.body.title==undefined){
//       console.log("USER PROFILE IMG SAVE");
//       cb(null, PROFILE_IMG_DIR+'/');
//     } else {
//       console.log("POST IMG SAVE");
//       cb(null, POST_IMG_DIR+'/');
//     }
//   },
//   filename(req, file, cb) {
//     if(req.body.title==undefined){
//       console.log("USER PROFILE IMG FILENAME");
//       cb(null, `${req.body.mail}_${file.originalname}`);
//     } else {
//       console.log("POST IMG FILENAME");
      
//       cb(null, `${req.body.nickname}_${new Date().toLocaleString}_${file.originalname}`);
//     }
//   },
// });
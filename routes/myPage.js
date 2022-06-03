const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();
const fs = require('fs')
const mysql = require('mysql')
const con = mysql.createConnection({
  host: 'localhost',
  user: 'workout',
  password: '1234',
  database: 'Today_workout_complete',
});

const PROFILE_IMG_DIR = 'public/img/userProfile';

let storage  = multer.diskStorage({
    destination(req, file, cb) {
        console.log("USER PROFILE IMG SAVE");
        cb(null, PROFILE_IMG_DIR+'/');
    },
    filename(req, file, cb) {
        console.log("USER PROFILE IMG FILENAME");
        cb(null, `${req.body.mail}_${file.originalname}`);
    },
});
  
let upload = multer({ storage: storage });



async function clean(file){
    fs.unlink(file, function(err){
        if(err) {
        console.log("Error : ", err)
        }
    })
}

// GET /user 라우터
router.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

//비밀번호변경전 확인
router.post('/checkPassword',(req, res) =>{

    const password = req.body.password;
    console.log(req.body);
    // console.log(req);

    const sql ='select password from memberinfo where password=?';
    con.query(sql, req.body.password, function (err, row, fields){
        let checkPassword = false;
        console.log(row);
        if(row.length == 0){ //중복되는게 없으면
        res.send({checkPassword: checkPassword});// 다시 checkid 객체를 클아이언트로 보낸다
        }
        else{
        checkPassword = true; // 중복돼서 사용 불가
        res.send({checkPassword: checkPassword});
        }
    })
})

//비밀번호 변경
router.patch('/updatePassword',(req, res)=>{
    const sql = 'update memberinfo set password=? where mail=?';
    const parameterList = [req.body.password, req.body.mail]
    accessDB_post(req, res, sql, parameterList);
})

// 유저 정보 변경(이메일, 이름, 자기소개, 이미지)
router.patch('/updateMyInfo', upload.single('profileImage'), function(req,res){ 
    const sql = 'update memberinfo set nickname = ?, introduction = ?, profile_img_path = ?  where mail = ?';
    console.log(req.body);
    console.log(req.file);
    let defaultProfile='default.png'
    console.log("bbbbbbb");
    if(req.file!=undefined){
        newFileName = req.file.filename
    }else{
        newFileName=defaultProfile
    }
    console.log("aaaaaaaa");
    if(newFileName==undefined)
        newFileName = req.body.profile_img_path

    // 기존 이미지 파일 삭제 코드
    console.log(PROFILE_IMG_DIR+'/' + req.body.profile_img_path);
    if(req.body.profile_img_path != undefined){
        newFileName=defaultProfile;
        clean(PROFILE_IMG_DIR + '/' + req.body.profile_img_path);
        
    }
    accessDB_patch(req, res, sql, [req.body.nickname, req.body.introduction, newFileName, req.body.mail])
});

// 사용자 사진 수정
router.put('/updateUserProfile', upload.single('profile_img'), (req, res) => {
    const sql = 'update memberinfo set profile_img_path=? where nickname=?';
    console.log(req.body);
    console.log(req.file);
    console.log(req.file.filename);
    accessDB_put(req, res, sql, [req.file.filename, req.body.nickname])
})

//mypage 자기가 쓴 게시글 전부 가져오기
router.get('/myPagePost',(req,res)=>{
    const sql ='select * from post where nickname =? limit ?,?'
    const parameterList=[req.query.nickname, parseInt(req.query.limit),parseInt(req.query.limit)+9]
    accessDB_get(req, res, sql, parameterList)
})


//nickname 중복검사
router.post('/checkNickname',(req, res) =>{
    const nickname = req.body.nickname;
    console.log(req.body);
    // console.log(req);
  
    const sql ='select nickname from memberinfo where nickname=?';
    con.query(sql, req.body.mail, function (err, row, fields){
      let checkNickname;
      checkNickname=false;
      console.log(row);
      if(row.length == 0){ //중복되는게 없으면
        checkNickname = true;// 사용가능
        res.send({checkNickname: checkNickname});// 다시 checkid 객체를 클아이언트로 보낸다
      }
      else{
        checkNickname=false; // 중복돼서 사용 불가
        res.send({checkNickname: checkNickname});
      }
    })
})


//유저정보삭제
router.delete('/deleteUserInfo', (req,res)=>{
    const sql = 'delete from memberinfo where mail= ?'
    const parameterList=[req.body.mail]
    accessDB_post(req, res, sql, parameterList);
})

function accessDB_put(req, res, sql, parameterList) {
    con.query(sql, parameterList, async function (err, result, fields) {
        if (err) {
        console.log(err);
        } else if(result == undefined) {
        res.send("failure")
        } else {
        console.log(result);
        res.send("success")
        }
    }); 
}


// GET 방식 DB 접근 함수
function accessDB_get(req, res, sql, parameterList) {
  
    con.query(sql, parameterList, function (err, result, fields) {
      if (err) {
        console.log(err);
        res.send("failure")
      } else if(result == undefined || result.length == 0) {
        res.send("failure")
      } else {
        console.log("쿼리 결과");
        console.log(result, req.path);
        switch (req.path){
            case '/getPost':
                console.log('getPost');
                res.send(result);
                break;
            case '/getPostAll':
                console.log('getPostAll');
                res.send(result);
                break;
            default:
                // result = "success"
                res.send(result)
                break;
        }
      }
    });
}

function accessDB_patch(req, res, sql, parameterList) {
    con.query(sql, parameterList, async function (err, result, fields) {
        if (err) {
            console.log(err);
        } else if(result == undefined) {
            res.send("failure")
        } else {
            console.log(result);
            if(req.file!=undefined){
                res.send({profile_img_path: req.file.filename})
            }else{
                res.send({profile_img_path: 'default.png'})
            }
        }
    });
}

module.exports = router;
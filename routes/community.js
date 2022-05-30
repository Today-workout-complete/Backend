const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

const mysql = require('mysql')
const con = mysql.createConnection({
  host: 'localhost',
  user: 'workout',
  password: '1234',
  database: 'Today_workout_complete',
});


const PROFILE_IMG_DIR = 'public/img/userProfile';
const POST_IMG_DIR = 'public/img/postPhoto';

let storage  = multer.diskStorage({
    destination(req, file, cb) {
        console.log("POST IMG SAVE");
        cb(null, POST_IMG_DIR+'/');
    },
    filename(req, file, cb) {
        console.log("POST IMG FILENAME");
        cb(null, `${req.body.nickname}_${new Date().toLocaleString}_${file.originalname}`);
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

router.get('/board', (req, res) => {
    const sql = "SELECT * FROM board"
    console.log(req.ip);
    console.log(res.url);
    console.log(req.path);
    console.log(req.url);
    console.log(req.url == '/board');
  
    accessDB_get(res, sql, [])
});


// 4. 게시판 생성 authUtil
router.post('/createBoard', (req, res) => {
  
    const sql = "INSERT INTO board VALUES (NULL, ?, ?, ?, DEFAULT, ?, NULL)"
    const parameterList = [req.body.member_id, req.body.board_name, req.body.code, req.body.availability]
  
    console.log(req.body);
  
    accessDB_post(req, res, sql, parameterList)
})
  


// 각 카테고리 게시물만 보기
router.get('/showAnotherBoard', (req,res) => {
  const sql= 'select * from post where Board_name=?'
  const parameterList =[req.body.board_id]
  console.log(req.body);
  accessDB_get(req, res, sql, parameterList)

})




router.get('/getBoard', (req, res) => {
    
    const sql = "SELECT board_id, board_name FROM board WHERE availability=1"
    accessDB_get(res, sql, []);
})


// 게시글 가져오기
router.get('/getPost',(req, res)=>{
  
    const sql = "SELECT * FROM post where board_id =? limit ?,?"
    const parameterList =[parseInt(req.query.board_id),parseInt(req.query.limit),parseInt(req.query.limit)+9]
    console.log(req.query);
    console.log(parameterList);
  
    console.log(req.path);
    accessDB_get(req, res, sql, parameterList)
  
})

//게시글 삭제
router.delete('/deletePost', (req,res)=>{
    const sql = 'delete from post where nickname=? and title= ?'
    const parameterList=[req.body.nickname, req.body.title]
    accessDB_post(req, res, sql, parameterList);
})
  
// 6. 댓글 생성
// router.post('/comments', (req, res) => {

//   const sql = "INSERT INTO comments (post_id, nickname, parent_comment_id, ip, content) VALUES (?,?,?,?,?)"
//   let parent_comments_id;

//   // if (req.body.parent_comments_id == 0)
//   //  parent_comments_id = null
//   parent_comment_id = null
//   // ip=null;
//   // post_id=5;
//   delete_stats=1;
//   const parameterList = [req.body.post_id, req.body.nickname, req.body.parent_comment_id,req.ip, req.body.content]
  
//   console.log(req.body);
//   console.log("ip는"+req.ip);

//   accessDB_post(req, res, sql, parameterList)
// })
// 6. 댓글 생성
router.post('/comments', (req, res) => {

  const sql = "INSERT INTO comments (post_id, nickname, parent_comment_id, ip, content) VALUES (?,?,?,?,?)"
  let parent_comments_id;

  // if (req.body.parent_comments_id == 0)
  //  parent_comments_id = null
  parent_comment_id = null
  // ip=null;
  // post_id=5;
  delete_stats=1;
  const parameterList = [req.body.post_id, req.body.nickname, req.body.parent_comment_id,req.ip, req.body.content]

  console.log(req.body);
  console.log("ip는"+req.ip);

  accessDB_post(req, res, sql, parameterList)
})

//댓글 수정
router.patch('/updateComment',(req,res) => {
  const sql = "update comments set content=? where nickname=? and post_id=? and Comments_id =?"
  const parameterList =[req.query.content, req.query.nickname, req.query.post_id, req.query.comments_id]
  accessDB_post(req, res, sql, parameterList)
})

//댓글 삭제
router.delete('/deleteComment', (req,res)=>{
  const sql = 'delete from comments where comments_id=? and post_id= ? '
  const parameterList=[req.body.nickname, req.body.title]
  accessDB_post(req, res, sql, parameterList);
})


// 게시물 모든 댓글 보여주기
router.get('/showComments',(req,res)=>{
  let id = parseInt(req.query.post_id);
  console.log(parseInt(id));
  const sql = "select * from comments where post_id=?"
  const parameterList=[req.query.post_id]
  // accessDB_get[req,res, sql, parameterList]
  con.query(sql, parameterList, async function (err, result, fields) {
    if (err) {
      console.log(err);
    } else if(result == undefined) {
      console.log('jjj');
      res.send("failure")
    } else {
      console.log(result);
      res.send(result);
    }
  });
  console.log(',,m4');
})



// 게시물 모든 댓글 보여주기
// router.get('/showComments',(req,res)=>{
//   let id = parseInt(req.query.post_id);
//   console.log(parseInt(id));
//   const sql = "select * from comments where post_id=?"
//   const parameterList=[req.query.post_id]
//   // accessDB_get[req,res, sql, parameterList]
//   con.query(sql, parameterList, async function (err, result, fields) {
//     if (err) {
//       console.log(err);
//     } else if(result == undefined) {
//       console.log('jjj');
//       res.send("failure")
//     } else {
//       console.log(result);
//       res.send(result);
//     }
//   });
//   console.log(',,m4');
// })


// 7. 게시물 제목 검색 기능 코드
router.get('/searchTitle',(req,res)=>{

  console.log(req.query);

  const sql = "select * from post where title LIKE " + "'%"+req.query.title+"%'"
  console.log(sql);
  
  con.query(sql ,function(err, result, fields){
    if (err) {
      console.log(err);
      res.send("failure")
    } else {
      console.log("쿼리 결과");
      console.log(result);
      res.send(result)
    }
  });
})


// GET 방식 DB 접근 함수
function accessDB_get(req, res, sql, parameterList) {
  
  con.query(sql, parameterList, function (err, result, fields) {
    if (err) {
      console.log(err);
      res.send("failure")
    } else if(result == undefined) {
      console.log('-----undefined----');
      res.send("failure")
    } else {
      console.log("쿼리 결과");
      console.log(result, req.path);
      switch (req.path){
        case '/api/getPostAll':
          console.log('getPost11111');
          res.send(result);
          break;
        default:
          res.send(result);
          console.log('aa', result);
          break;
      }
    }
  });
}

// // 게시물 모든 댓글 보여주기
// router.get('/showComments',(req,res)=>{
//   let id = parseInt(req.query.post_id);
//   console.log('1', req.query);
//   console.log('2', req.query.post_id);
//   console.log(parseInt(id));
//   const sql = "select * from comments where post_id=80"
//   console.log(',,m2');
//   const parameterList=[80]
//   console.log(',,m3');
//   // accessDB_get[req,res, sql, parameterList]
//   con.query(sql, parameterList, async function (err, result, fields) {
//     if (err) {
//       console.log(err);
//     } else if(result == undefined) {
//       console.log('jjj');
//       res.send("failure")
//     } else {
//       console.log(result);
//       res.send(result);
//     }
//   });
//   console.log(',,m4');
// })
// 해당 게시물 댓글 가져오기
// router.get('/showComments',(req,res)=>{
//   // let id = parseInt(req.query.post_id);
//   // console.log(id);

//   const sql = "select * from comments where post_id=?"
//   const parameterList=[req.query.post_id]

//   con.query(sql, parameterList, async function (err, result, fields) {
//     if (err) {
//       console.log(err);
//     } else if(result == undefined) {
//       res.send("failure")
//     } else {
//       console.log(result);
//       res.send(result);
//     }
//   });
// })

  
// 7. 게시물 제목 검색 기능 코드
router.get('/searchTitle',(req,res)=>{
  
    console.log(req.query);
  
    const sql = "select * from post where title LIKE " + "'%"+req.query.title+"%'"
    console.log(sql);
    
    con.query(sql ,function(err,result, fields){
      if (err) {
        console.log(err);
        res.send("failure")
      } else {
        console.log("쿼리 결과");
        console.log(result);
        res.send(result)
      }
    }); 
})
  
// 전체 게시글 가져오기
// router.get('/getPostAll',(req, res)=>{
  

//   const sql = "SELECT * FROM post where board_id =? limit ?,?"
//   const parameterList =[parseInt(req.query.board_id), parseInt(req.query.limit), parseInt(req.query.limit) + 1000]
//     console.log(req.query);
//     console.log(parameterList);
  
//     console.log(req.path);
//     accessDB_get(req, res, sql, parameterList)
  
// })

// 5. 게시글 생성
router.post('/createPost', upload.single('photographic_path'), (req, res)=>{
  
  const sql = "INSERT INTO post VALUES (NULL, ?, ?,?,?,?,?,DEFAULT,NULL,NULL, DEFAULT, DEFAULT,?,DEFAULT)"

  console.log(req.body);
  console.log(req.file);
  let defaultphotographicfile='default.png'
  if(req.file!=undefined){
    newFileName = req.file.filename
  }else{
      newFileName=defaultphotographicfile
  }
  if(newFileName==undefined){
    newFileName = defaultphotographicfile
  }
  
  const parameterList =[req.body.board_id, req.body.nickname, req.body.title, req.body.content, req.ip, newFileName,req.body.availabilty_comments ];

  console.log(req.body);
  accessDB_post(req, res, sql, parameterList)
})

//게시글 수정
router.patch('/updatePost', upload.single('photographic_path'), function(req,res){ 
  const sql = "update post set title = ?, comment = ?, photographic_path = ?  where post_id = ?";
  console.log(req.body);
  console.log(req.file);
  let defaultphotographicfile='default.png'
  console.log("bbbbbbb");
  if(req.file!=undefined){
    newFileName = req.file.filename
  }else{
      newFileName=defaultphotographicfile
  }
  if(newFileName==undefined){
    newFileName = defaultphotographicfile
  }
 // 기존 이미지 파일 삭제 코드
  console.log(PROFILE_IMG_DIR+'/' + req.body.photographic_path);
  if(req.body.photographic_path != undefined){
      newFileName=photographic_path;
      clean(PROFILE_IMG_DIR + '/' + req.body.photographic_path);
      
  }
  const parameterList =[req.body.title, req.body.comment, newFileName, req.body.post_id];
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
});

//커뮤니티 게시글 최신순부터 나열
router.get('/showPostDesc',(req,res) => {
  const sql = 'SELECT * FROM post ORDER BY creation_datetime desc limit ?,? '
  const parameterList=[parseInt(req.query.limit),parseInt(req.query.limit)+1000]

  accessDB_get(req, res, sql, parameterList)
})

//커뮤니티 게시글 오래된순부터 나열
router.get('/showPostAsc',(req,res) => {
  const sql = 'SELECT * FROM post ORDER BY creation_datetime asc limit ?,?'
  const parameterList=[parseInt(req.query.limit),parseInt(req.query.limit)+1000]
  accessDB_get(req, res, sql, parameterList)
})

// 게시글 가져오기
router.get('/getPostAll',(req, res)=>{

  const sql = "SELECT * FROM post where board_id =? limit ?,?"
  const parameterList =[parseInt(req.query.board_id), parseInt(req.query.limit), parseInt(req.query.limit) + 1000]
  console.log(req.query);
  console.log(parameterList);

  console.log(req.path);
  accessDB_get(req, res, sql, parameterList)

})

// 상세게시글 가져오기
router.get('/getPostDetail',(req, res)=>{

  const sql = "SELECT * FROM post where post_id =? "
  const parameterList =[parseInt(req.query.board_id), parseInt(req.query.limit), parseInt(req.query.limit) + 1000]
  console.log(req.query);
  console.log(parameterList);

  console.log(req.path);
  accessDB_get(req, res, sql, parameterList)

})
router.get('/showCategorySelect',(req, res)=>{

  const sql = "SELECT * FROM post where board_id =? limit ?,?"
  const parameterList =[parseInt(req.query.board_id), parseInt(req.query.limit), parseInt(req.query.limit) + 1000]
  console.log(req.query);
  console.log(parameterList);

  console.log(req.path);
  accessDB_get(req, res, sql, parameterList)

})

// POST 방식 DB 접근 함수
function accessDB_post(req, res, sql, parameterList) {
  
    con.query(sql, parameterList, async function (err, result, fields) {
      if (err) {
        console.log(err);
      } else if(result == undefined || result.length == 0) {
        res.send("failure")
        
      } else {
  
        console.log("쿼리 결과",result, "paht: ",req.path);
        switch(req.path){
          case '/createPost':
            console.log('createPost');
            if(req.file!=undefined){
              res.send({photographic_pathh: req.file.filename})
            }else{
              res.send({photographic_path: 'default.png'})
            }
            break;
          default:
            res.send(result)
            break;

        }

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
          switch(req.path){
            case '/createPost':
                if(req.file!=undefined){
                  res.send({profile_img_path: req.file.filename})
                }else{
                  res.send({profile_img_path: 'default.png'})
                }
                break;
            case '/updatePost' :
                if(req.file!=undefined){
                  res.send({profile_img_path: req.file.filename})
                }else{
                  res.send({profile_img_path: 'default.png'})
                
                }
                break;
            default:
              res.send(result);
              break; 
          }

      }
  });
}

module.exports = router;
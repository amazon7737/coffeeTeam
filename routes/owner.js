var express = require("express");
var router = express.Router();
const pool = require("../db/db");

// 오늘날짜
let today = new Date();
let year = today.getFullYear();
let month = today.getMonth() + 1;
let date = today.getDate();
const wdate = year + "-" + month + "-" + date;

/**
 * owner
 */
/* GET home page. */
router.get("/mypage/1", async (req, res) => {
  const user_id = req.session.user_id;

  // 유저 id 찾기
  const owner_id = await pool.query(
    "select id user_id from user where login_id = ?",
    [user_id]
  );

  // 카페 - 점주 체크
  const cafeCheck = await pool.query(
    "select * from dbseven.cafe where owner_id =?",
    [owner_id[0][0].user_id]
  );

  //
  const cafe = await pool.query(
    "SELECT a.*, b.*, c.* FROM dbseven.owner a inner join dbseven.user b on a.user_id = b.id inner join dbseven.cafe c on a.cafe_id = c.id where user_id = ?;",
    [owner_id[0][0].user_id]
  );

  //   console.log(cafe[0]);

  const sales = await pool.query(
    "select * from dbseven.monthly_record where cafe_id = ?;",
    [Number(cafe[0][0].cafe_id)]
  );

  res.render("cafe_mypage_sales", { sales: sales[0] });
});

router.get("/mypage/4", async (req, res) => {
  const user_id = req.session.user_id;
  const owner_id = await pool.query(
    "select id user_id from user where login_id = ?",
    [user_id]
  );

  // 주인 찾기
  const owner = await pool.query(
    "SELECT a.* , b.*, c.* FROM dbseven.owner a inner join dbseven.cafe b on a.cafe_id = b.id inner join dbseven.user c on a.user_id = c.id where user_id = ?;",
    [owner_id[0][0].user_id]
  );

  //   console.log(owner[0]);

  // 성향 카페의 그 사람의
  const propen = await pool.query(
    "select * from dbseven.cafe_propensity where cafe_id =?",
    [Number(owner[0][0].cafe_id)]
  );

  console.log("propen:", propen[0]);
  //   console.log("owner::", owner[0][0].cafe_id);

  // 매출
  const sales = await pool.query(
    "select * from dbseven.monthly_record where cafe_id = ?;",
    [Number(owner[0][0].cafe_id)]
  );
  //   console.log(sales[0]);

  //성향 가입 날짜
  const register_time = propen[0][0].create_time;
  // 성향 가입 전 매출
  const no_register = [];
  const after_register = [];

  for (var i = 0; i < sales[0].length; i++) {
    console.log(Date.parse(register_time));
    console.log("sales:", i, sales[0][i].create_time);
    // if()
  }

  // 성향 가입 후 매출

  //   console.log("sales:", sales[0]);

  // 성향 json
  // 인테리어
  interior_data = {
    1: "원목",
    2: "모던",
    3: "기타 컨셉",
  };

  // 풍경
  scenery_data = {
    1: "산",
    2: "바다",
    3: "도시",
  };

  // 분위기
  feel_data = {
    1: "고요함",
    2: "잔잔한 음악",
    3: "시끌벅적",
  };

  const partnerShip = await pool.query(
    "select a.partnership from dbseven.cafe a where id =? and owner_id = ?",
    [propen[0][0].cafe_id, owner_id[0][0].user_id]
  );

  // 만료 월
  const expire_month = propen[0][0].create_time.split("-")[1];

  // 오늘 날짜 - 만료 월
  const expire = Number(month) - Number(expire_month);

  //패키지 사이즈
  const package_time = Number(propen[0][0].package_size);

  // 만료일 연산
  const result_time = package_time - expire;

  // 성향 가입을 안했다면
  if (Number(partnerShip[0][0].partnership) == 0) {
    return res.render("cafe_mypage_attract_sign", {});
  } else {
    // 성향 가입을 했다면

    // 날짜가 가입일 보내주고 / 성향 서비스 만료일

    // 결과 json
    const result = [
      {
        create_time: propen[0][0].create_time,
        result_time: result_time,
      },
    ];

    return res.render("cafe_mypage_attract", { sales: "", result: result[0] });

    // res.render("cafe_mypage_atrract", {});
  }

  // 성향 내역 조회
  // 성향 내역이 null 이면 가입페이지 로드 시키고 -> 성향 결제 주문
  // null 아니면 연산 시키기

  //   res.render("cafe_mypage_attract", {});
});

module.exports = router;

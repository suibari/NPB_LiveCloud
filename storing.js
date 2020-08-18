'use strict';

const MAX_WORDS_LENGTH = 1000; // この数以上のword種類の集計は行わない
const MAX_TPS_LENGTH   = 10;

var arr_count         = [];
var obj_tps_tmp       = {};
var obj_time_prvtweet = {};

module.exports.setCount = function (word, teams) {
  teams.forEach((team) => { // teams配列を分解
    var inc_flag = false; // wordとteamの一致があったか確認するためのフラグ

    arr_count.forEach((a) => { // 現在のarr_countを掃引
      if ((a.word == word) && (a.team == team)) {
        // wordとteamが一致したので加算する
        a.count += 1;
        inc_flag = true;
      }
    });
    if (inc_flag == false) { // 掃引して一致がない場合は新規word&teamを追加
      arr_count.push(
        {
          word:  word,
          count: 1,
          team:  team
        }
      );
    }
  })
  // 降順ソートする
  arr_count.sort((a, b) => {
    var x = a.count;
    var y = b.count;
    if (x > y) return 1;
    if (x < y) return -1;
    return 0;
  });
  // メモリひっ迫対策で、配列要素数が一定値以上なら削除
  if (arr_count.length > MAX_WORDS_LENGTH) {
    do {
      arr_count.shift();
    } while (arr_count.length > MAX_WORDS_LENGTH);
  }
  
  //console.log(arr_count);
};

module.exports.getCount = function () {
  return arr_count;
}

module.exports.setTPS = function (teams) {
  teams.forEach((team) => { // teams配列を分解
    if (obj_tps_tmp[team]) {
      // 計測中のチームである
      var time_dst = (new Date().getTime() - obj_time_prvtweet[team].getTime()) / 1000;
      obj_tps_tmp[team].push(1 / time_dst);
      obj_time_prvtweet[team] = new Date(); // 現在時刻に更新
    } else {
      // 初めて計測するチームである
      obj_tps_tmp[team] = [];
      obj_time_prvtweet[team] = new Date();
    };
    // メモリひっ迫対策で、時間計測結果が一定値以上なら削除
    if (obj_tps_tmp[team].length > MAX_TPS_LENGTH) {
      obj_tps_tmp[team].shift();
    }
  })

  console.log(obj_tps_tmp);
}

module.exports.getTPS = function () {
  var obj_tps = {};

  for (let team in obj_tps_tmp) {
    var res;
    const tps_tmp_length_team = obj_tps_tmp[team].length;

    if (tps_tmp_length_team > 0) {
      // たまっているTPSが1以上なら平均を出せる
      var sum = 0;
      for (var i = 0; i < obj_tps_tmp[team].length; i++) {
        sum += obj_tps_tmp[team][i];
      }
      res = sum / obj_tps_tmp[team].length;
    } else {
      // 2つ目のツイートが来るまでは割り算できない(0で割れない)
      res = 0; // 0を入れておく
    }

    // 小数点3位までに丸める
    obj_tps[team] = res.toFixed(3);
  }
  return obj_tps;
}
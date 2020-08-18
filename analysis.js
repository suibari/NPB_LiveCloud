'use strict';

const Mecab  = require('mecab-async');
const mecab  = new Mecab;
const q_json = require('./src/query.json');

module.exports = function (text) {
  var cheer_teams = []; // 該当チーム名を入れる配列

  // チーム名判別
  for (let key in q_json) { // 12球団のloop
    for (let i = 0; i < q_json[key].length; i++) { // チームごとのloop(1)
      var p = new RegExp(q_json[key][i],'i');
      if (p.test(text)) { // textにチーム名クエリが含まれるか
        // チーム名クエリが含まれる
        cheer_teams.push(key);
        break; // チームごとのfor-loop(1)を抜ける。次のチームに移る
      }
    }
  };
  // チーム名配列をstoring.jsに渡す
  require('./storing.js').setTPS(cheer_teams);

  // 形態素解析実行
  mecab.parse(text, (err, arr_words) => {
    if (err) throw err; // エラーならthrowする

    arr_words.forEach((word) => {
      if (((word[1]=="名詞") || (word[1]=="固有名詞")) && (checkJa(word[0]))) {
        // wordが「名詞or固有名詞」かつ「日本語」なら
        // そのwordとチーム名配列のセットをstoring.jsに渡す
        require('./storing.js').setCount(word[0], cheer_teams);
      }
    });
  });

  // 文字コードから日本語を判別する関数
  function checkJa(str) {
    var isJapanese = false;
    
    for(let i=0; i < str.length; i++){
      if(str.charCodeAt(i) >= 256) {
        return isJapanese = true;
      }
    }
  }
}
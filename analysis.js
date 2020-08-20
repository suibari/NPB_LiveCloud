'use strict';

const Mecab  = require('mecab-async');
const mecab  = new Mecab;
const q_json = require('./src/query.json');

const exclusuon_word = [ // 除外ワード配列
  "横浜", "ベイスターズ", "ＤｅＮＡ",
  "読売", "ジャイアンツ", "巨人", "東京ドーム",
  "阪神", "タイガース",
  "ヤクルト", "スワローズ",
  "中日", "ドラゴンズ",
  "広島", "カープ",
  "福岡", "ソフトバンク", "ホークス",
  "埼玉", "西武", "ライオンズ",
  "オリックス", "バファローズ",
  "楽天", "イーグルス",
  "ファイターズ", "日ハム",
  "千葉ロッテ", "マリーンズ", "ロッテマリーンズ"
];

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
      var isCount = ((word[1]=="名詞") || (word[1]=="固有名詞")) && checkJa(word[0]) && !(checkEmoji(word[0]) && (exclusuon_word.indexOf(word[0])==-1));
      if (isCount) {
        console.log(word);
        // wordが「名詞or固有名詞」かつ「日本語を含む」かつ「絵文字を含まない」かつ「除外ワードと完全一致しない」なら
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

  // 文字コードから絵文字を判別する関数
  function checkEmoji(str) {
    const ranges = [
      '\ud83c[\udf00-\udfff]',
      '\ud83d[\udc00-\ude4f]',
      '\ud83d[\ude80-\udeff]',
      '\ud7c9[\ude00-\udeff]',
      '[\u2600-\u27BF]'
    ];
    const regexp = new RegExp(ranges.join('|'), 'g');
    return regexp.test(str);
  }
}
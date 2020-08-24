'use strict';

const Mecab  = require('mecab-async');
const mecab  = new Mecab;
const q_json = require('./src/query.json');

const exclusuon_word = [ // 除外ワード配列
  "横浜", "ベイスターズ", "ＤｅＮＡ",
  "読売", "ジャイアンツ", "巨人", "東京ドーム",
  "阪神", "タイガース", "阪神タイガース",
  "ヤクルト", "スワローズ", "ヤクルトスワローズ", "東京", "神宮球場", "神宮",
  "中日", "ドラゴンズ", "ナゴヤドーム",
  "広島", "カープ", "広島東洋カープ", "スタジアム",
  "福岡", "ソフトバンク", "ホークス", "ソフトバンクホークス",
  "埼玉", "西武", "ライオンズ", "西武ライオンズ",
  "オリックス", "バファローズ", "オリックス・バファローズ", "オリックスバファローズ",
  "楽天", "イーグルス",
  "ファイターズ", "日ハム",
  "千葉ロッテ", "ロッテ", "マリーンズ", "ロッテマリーンズ",
  "投", "捕", "一", "二", "三", "遊", "左", "中", "右",
  "くん", "さん", "ちゃん"
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
  console.log(cheer_teams);
  // チーム名配列をstoring.jsに渡す
  require('./storing.js').setTPS(cheer_teams);

  // 形態素解析実行
  mecab.parse(text, (err, arr_words) => {
    if (err) throw err; // エラーならthrowする

    arr_words.forEach((word) => {
      var isCount = ((word[1]=="名詞") || (word[1]=="固有名詞")) && checkJa(word[0]) && (exclusuon_word.indexOf(word[0])==-1) && !(checkPattern(word[0]));
      if (isCount) {
        //console.log(word);
        // wordが「名詞or固有名詞」かつ「日本語を含む」かつ「除外ワードと完全一致しない」かつ「絵文字を含まない」かつ「記号のみなど特殊文字ではない」なら
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

  // 特定の文字パターンを正規表現で判別する関数
  function checkPattern(str) {
    const ranges = [
      '\ud83c[\udf00-\udfff]',  // 絵文字コード
      '\ud83d[\udc00-\ude4f]',  // 絵文字コード
      '\ud83d[\ude80-\udeff]',  // 絵文字コード
      '\ud7c9[\ude00-\udeff]',  // 絵文字コード
      '[\u2600-\u27BF]',        // 絵文字コード
      '^[0-9]$', '^[０-９]$',   // 数字1文字だけ
      '^[!！]*$',               // ビックリマークの連続だけ
      '^.ー*$', '^ー*.$',       // 伸ばし棒+一文字だけ
      '[ -~]+',                 // 半角英数字または記号のみ連続
      '^[＃～「」『』　]+$'      // 全角記号のみの連続
    ];
    const regexp = new RegExp(ranges.join('|'), 'g');
    return regexp.test(str);
  }
}
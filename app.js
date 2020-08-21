'use strict';

const express = require('express');
const app     = new express();
const http    = require('http').Server(app);
const io      = require('socket.io')(http);
const twit    = require('twit')({
  consumer_key:        process.env.CONSUMER_KEY,
  consumer_secret:     process.env.CONSUMER_SECRET,
  access_token:        process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
});

// twitterストリーミングエンドポイントとの接続
const stream = twit.stream('statuses/filter',
  {
    track: convertAry( require('./src/query.json') ), 
    language: "ja"
  }
);

// ツイートがあるたびになにかする
stream.on('tweet', (tweet) => {
  console.log(tweet.user.name + "> " + tweet.text);
  // analysis.jsにtweet.textを渡す
  require('./analysis.js')(tweet.text);
});

// Webサーバ動作(GETが来たらindex.htmlを渡す)
app.use('/client', express.static(__dirname + '/client')); // ./client/wordCloud.jsをGETできるよう、client以下もGET対象にする
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Socket.ioサーバを立てる
http.listen(process.env.PORT || 8080, () => { console.log('YUKI.N > Server has runned.') });
io.on('connection', (socket) => {
  // コネクションがあった
  console.log('YUKI.N > a user connected. so emit data to the client.');
  socket.emit('update', {
    count: require('./storing.js').getCount(),
    tps:   require('./storing.js').getTPS()
  })
  // コネクションが閉じられた
  socket.on('disconnect', () => {
    console.log('YUKI.N > user disconnected.');
  });
});

// 一定時間ごとにクライアントにemitする
setInterval(() => {
  console.log('YUKI.N > emit data to clients.');
  io.emit('update', {
    count: require('./storing.js').getCount(),
    tps:   require('./storing.js').getTPS()
  })
}, 10000);

// JSONから配列にパースする関数
function convertAry(json) {
  var q = [];
  for (let key in json) {
    for (let i = 0; i < json[key].length; i++) {
      q.push(json[key][i]);
    }
  }
  return q;
};
NPB Live-cloud!
====

[NPB Live-cloud!](https://npb-livecloud.herokuapp.com/) は、プロ野球実況支援Webアプリケーションです。

Twitter上のプロ野球関連ツイートを集計し、トレンドワードと思われる言葉をワードクラウドにして表示します。**どのチームでどういう話題が盛り上がっているのか**を、特別な知識がなくてもグラフィカルに見ることができます。

## Description
![npb_livecloud](https://user-images.githubusercontent.com/61776220/90955213-9ac4f000-e4b6-11ea-80a3-a5ab3a0c1945.png)
本アプリケーションは以下の機能を持ちます。

### 1. Twitterからデータ取得

* Twitter-Streaming API (status/filter) へ接続確立する
* ツイートを取得する

### 2. 形態素解析の実行

* 1のツイート文章に対する、MeCabによる形態素解析実行する
* 解析結果から、どのチームの関連ツイートであるか判別し属性を付与する

### 3. 解析結果の分析

* A) 2の結果から、ある言葉が何回ツイートされたか および その言葉がどのチームのものであるか をカウント
* B) 2の結果から、各チームのファンが毎秒何ツイートしているか計算(あるチームのtweetの秒間隔を求め、逆数をとることで算出する)
* 集計対象でない単語(動詞や接続詞など)は除外する

### 4. ワードクラウド表示

* ブラウザは3の結果をサーバから定期的に受信する
* 3-Aの結果から、ブラウザはD3.jsおよびD3-cloud.jsを用いてワードクラウドを生成する
* ブラウザが既にワードクラウドを生成済みの状態で、再び3の結果を受信した場合、ワードクラウドを滑らかに遷移させる(突然消えたり現れたりしない)
* ブラウザは3-Bの数値を表示する

## Requirement
* GoogleChrome v84
* (作成中...)

## Usage
以下にアクセス！

[NPB Live-cloud!](https://npb-livecloud.herokuapp.com/)

## License
MIT

## Auther
suibari
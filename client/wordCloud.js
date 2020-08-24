'use strict';

class wordCloud {
  constructor(selector) {
    this._size = {
      width:  $(selector).width(),
      height: $(window).height() - 150 // ビューポート高さからTPS表示部分の分+余白+フッター の約150を引く
    }
    this._cloud = d3.select(selector)
    .append('svg')
      .attr('width', this._size.width)
      .attr('height', this._size.height)
      .attr('viewBox', "0 0 " + this._size.width + " " + this._size.height)
    .append('g')
      .attr('transform', 'translate(' + this._size.width/2 + ',' + this._size.height/2 +')')
    // 集計結果を結びつける対象
    //this._cloud = d3.select(selector).selectAll('g text');
  }

  _draw(words) {
    let cloud = d3.select('svg').select('g').selectAll('text').data(words); // wordsオブジェクトが渡され、単語に対応するデータが更新される
    
    // exit():既存の余分な要素を扱う
    cloud.exit() // 対応するデータが無くなった単語を削除
      .transition().duration(200)
        .remove();
    
    // enter(): 新しく生成した要素を扱う
    cloud.enter()          
      .append('text')                                      // 新しい単語のtext要素を作成&選択
      .attr("text-anchor", "middle")                       // 文字位置の指定
    .merge(cloud)     // merge(): 新しいtext要素に加えて既存のtext要素も含めて扱う
      .transition().duration(600)
      .style('paint-order', 'stroke')
      .style('fill', (d) => { return d.color })            // 新しい単語を球団カラーで塗りつぶす
      .style('stroke-width', (d) => { if ((d.team=="tigers")||(d.team=="lions")) return d.size/12+'px' }) // 阪神or西武の場合、文字色だけだとみづらいので黒で縁取り(フチのサイズ)
      .style('stroke',       (d) => { if ((d.team=="tigers")||(d.team=="lions")) return "#000" })         // 同上(フチの色)
      .text((d) => { return d.text; })                     // 単語全てにテキスト設定
      //.style("font-family", "Kazesawa-Regular")            // フォントを設定
      .style("font-size", (d) => { return d.size + "px" }) // 単語全てにサイズ設定
      .attr("transform", (d) => {                          // 単語全てに位置を指定
         return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")" 
      });
  }

  update(words) {
    d3.layout.cloud()
    .size([this._size.width, this._size.height])
    .words(this._getWords(words))              // words配列を_drawに渡す
    //.font("Kazesawa-Regular")                  // フォントを設定
    .fontSize((d) => { return d.size })        // フォントサイズを設定
    .rotate(() => { return 0 })                // 回転なしを設定
    .padding(4)                                // ワードクラウド文字間隔を拡大(defaultは1)
    .on("end", this._draw) // layoutが全ての単語の配置を完了したら、_draw関数を実行する
    .start();                                  // _draw関数の実行
  }

  // 集計データをd3.cloudで読み取り可能なオブジェクトに変換する関数
  _getWords(data) {
    var countMax   = d3.max(data, (d) => {return d.count});
    var countMin   = d3.min(data, (d) => {return d.count});
    var sizeScale  = d3.scaleLog().domain([countMin, countMax]).range([10, 60]); //ログスケール
    var colorScale = function(t){
      switch(t) {
        case "baystars":  return d3.color("dodgerblue");
        case "giants":    return d3.color("orange");
        case "tigers":    return d3.color("yellow");
        case "swallows":  return d3.color("limegreen");
        case "dragons":   return d3.color("darkblue");
        case "carp":      return d3.color("red");
        case "hawks":     return d3.color("gold");
        case "lions":     return d3.color("aqua");
        case "buffaloes": return d3.color("darkgoldenrod");
        case "eagles":    return d3.color("firebrick");
        case "fighters":  return d3.color("steelblue");
        case "marines":   return d3.color("black");
        default:          return d3.color("gray");
      }
    };
    return data.map( function(d) {
      return {
        text:  d.word, 
        size:  sizeScale(d.count),
        color: colorScale(d.team),
        team:  d.team
      }
    })
  }
}
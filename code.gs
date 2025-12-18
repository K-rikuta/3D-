function doGet() {
  var template = HtmlService.createTemplateFromFile('index');

  // 地図データを取得して、安全な形式(Base64)に変換して渡す
  try {
    var options = {
      muteHttpExceptions: false,
      timeout: 60,  // タイムアウトを60秒に延長
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    };
    
    var response = UrlFetchApp.fetch('https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson', options);
    
    if (response.getResponseCode() === 200) {
      var blob = response.getBlob();
      var jsonStr = blob.getDataAsString('utf-8');
      
      // JSON 妥当性チェック
      var data = JSON.parse(jsonStr);
      if (data.features && data.features.length > 0) {
        template.mapData = Utilities.base64Encode(blob.getBytes());
      } else {
        throw new Error('Invalid GeoJSON: no features');
      }
    } else {
      throw new Error('HTTP ' + response.getResponseCode());
    }
  } catch (e) {
    Logger.log('GAS地図取得エラー: ' + e);
    // 失敗時は空文字（フロント側でCDNから取得）
    template.mapData = "";
  }

  return template.evaluate()
    .setTitle('3Dクマ目撃マップ 🐻')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}
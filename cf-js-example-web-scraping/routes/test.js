
var request = require("request");
var cheerio = require("cheerio");

exports.get_wether_info = function(req, res){
	//台南市的氣溫
	var url = "http://www.wunderground.com/weather-forecast/zmw:00000.1.59358";
	// 取得網頁資料
	request(url, function (error, response, body) {
	  if (!error) {

	    // 用 cheerio 解析 html 資料
	    var $ = cheerio.load(body);

	    // 篩選有興趣的資料
	    var temperature = $("[data-variable='temperature'] .wx-value").html();
	    var humidity = $("[data-variable='humidity'] .wx-value").html();

	    // 輸出
	    console.log("氣溫：攝氏 " + temperature + " 度");
	    console.log("濕度：" + humidity + "%");
	    res.send(body);

	  } else {
	    console.log("擷取錯誤：" + error);
	  }
	});	
};

exports.get_rate_info = function(req, res){
	//銀行匯率
	var url = "http://www.taiwanrate.org/exchange_rate.php?c=USD#.WHmA3_l97IV";
	// 取得網頁資料
	request(url, function (error, response, body) {
	  if (!error) {
		var myRegexp = /(台北富邦)([^0-9]+)([0-9]+\.[0-9]+)([^0-9]+)([0-9]+\.[0-9]+)/g;
		var match = myRegexp.exec(body);
		var cnt = 0;
		var outMsg="";
		while (match != null) {
			  // matched text: match[0]
			  // match start: match.index
			  // capturing group n: match[n]
			  if (cnt==0){
				  /*
				  outMsg += "台北富邦銀行 [美金(USD)對新台幣現金匯率] ==> 銀行買入價: "+match[3]+
						  "銀行賣出價: "+match[5]+"<p>";
				  */
			  }
			  if (cnt==1){
				  outMsg += "台北富邦銀行 [美金(USD)對新台幣即期匯率] ==> 銀行買入價: "+match[3]+
						  ",  銀行賣出價: "+match[5]+"<p>";				  
			  }
			  //console.log(match[0]);
			  //console.log(match[3]);
			  //console.log(match[5]);
			  match = myRegexp.exec(body);
			  cnt += 1
		}
	    //res.send(body);
	    res.send(outMsg);

	  } else {
	    console.log("擷取錯誤：" + error);
	  }
	});	
	
};

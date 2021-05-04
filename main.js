var mysetTime = null;
showList();
/*測試用*/
document.getElementById('pic').addEventListener('click',function(){
    testt('666');
});

document.getElementById('searchBtn').addEventListener('click',function(){
    search(document.getElementById('searchId').value);
});
function testt(string)
{/*
    chrome.storage.local.get(['teststring1'], function(result) {
        temp = result.teststring1;
        console.log('Value currently is ' + temp);
        showList(temp);
    });*/
    showList();
}

function showList(list)
{
    console.log('show')
    chrome.storage.local.get(['teststring1'], function(result) {
        $('#mainTable').empty();
        if(result.teststring1 == null || result.teststring1 == '')
            return;
        list = result.teststring1;
        console.log('Value currently is ' + list);
        var listArray = list.split(',');
        if(listArray.length > 0)
        {
            $('#mainTable').append('<table id="gg1" style="border:3px #cccccc solid;" cellpadding="10" border="1"><tr>'+
                '<td>K</td>'+
                '<td>個股</td>'+
                '<td>價格</td>'+
                '<td>漲跌</td>'+
                '<td>最高</td>'+
                '<td>最低</td>'+
                '<td>類股</td>'+
                '<td>賣單</td>'+
                '<td>買單</td>'+
                '<td>操作</td>'+
                '</tr></table>');
				
			var count = 0;
            $.ajaxSettings.async = false;
            listArray.forEach(
                item => {	
					count ++;
                    $.get("https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;fields=avgPrice%2Corderbook;symbols="+item,
                        function(data,status){
                            if(data[0].change > 0)
                                var color = 'red';
                            else
                                var color = 'green';
							
                            var clickId = 'cancelBtn_id_'+item;
							var chartId = item + '_chart_' + count;
							var chartId_K = item + '_K_' + count;
							var chartIn = $('<div class="chart inMarket"></div>');
							var chartOut = $('<div class="chart outMarket"></div>');
							var chartK_1 = $('<div class="chartK_1 chartK"></div>');
							var chartK_2 = $('<div class="chartK_2 chartK"></div>');
							/* 長條圖 */
                            /*內盤 外盤*/
                            /*
                            inMarket
                            inMarketPercentage
                            outMarket
                            outMarketPercentage
                            */

                            /* 委買 委賣*/
                            var buyRate = (data[0].sumBidVolK / (data[0].sumBidVolK + data[0].sumAskVolK))*100;
                            buyRate = buyRate.toFixed(2);
                            var sellRate = 100 - buyRate;
                            sellRate = sellRate.toFixed(2);
                        
                            /* K線資料 */
                            /* 最高高度*/
                            var chartK_Height = 50;
                            var limitRange = data[0].limitUpPrice - data[0].limitDownPrice;
                            var K_info = new Object();
                            K_info.value1 = (data[0].regularMarketDayHigh - data[0].regularMarketDayLow)/limitRange*chartK_Height;
                            K_info.value2 = (data[0].price - data[0].regularMarketOpen)/limitRange*chartK_Height;
                            if(K_info.value2 < 0){
                                K_info.top = K_info.value1-(data[0].regularMarketDayHigh - data[0].regularMarketOpen)/limitRange*chartK_Height;
                                K_info.color = 'green';
                            }else{
                                K_info.top = K_info.value1-(data[0].regularMarketDayHigh - data[0].price)/limitRange*chartK_Height;
                                K_info.color = 'red';
                            }
                        
                            /* 圖表設定 */
							chartIn.css('width',sellRate+'%');
							chartOut.css('width',buyRate+'%');
                            chartK_1.css({'height':K_info.value1,'background-color':'black'});
                            chartK_2.css({'height':Math.abs(K_info.value2),'margin-top':-K_info.top,'background-color':K_info.color});
                        
                            var itemobj = '<tr>'+
                                '<td id="'+ chartId_K +'"></td>'+
                                '<td>'+item+'<br>'+data[0].symbolName+'</td>'+
                                '<td>'+data[0].price+'</td>'+
                                '<td style="color:'+color+';">'+data[0].change+'<br>'+data[0].changePercent+'</td>'+
                                '<td>'+data[0].regularMarketDayHigh+'</td>'+
                                '<td>'+data[0].regularMarketDayLow+'</td>'+
                                '<td>'+data[0].sectorName+'</td>'+
                                '<td colspan="2" style="width:200px" id="'+ chartId +'" ><div class="text-wrap"><div class="text inMarket">'+data[0].sumAskVolK+' ('+sellRate+')</div><div class="text outMarket">'+data[0].sumBidVolK+' ('+buyRate+')</div><br></div>'+
                                '<td><input id="'+clickId+'" type="button" value="X"></td>>'
                                +'</tr>>'
                            ;
                            $('#gg1').append(itemobj);
							$('#'+ chartId).append(chartIn);
							$('#'+ chartId).append(chartOut);
							$('#'+ chartId_K).append(chartK_1);
							$('#'+ chartId_K).append(chartK_2);
                            $('#'+ chartId_K).append($('<div></div>').css('height',K_info.value1-Math.abs(K_info.value2)));
                            $('#'+ chartId_K).css({'height':chartK_Height});
 
                            $('#'+clickId).click(function(){
                                deleteList(item);
                            });
                        });
                });
        }
    });
    clearTimeout(mysetTime);
    if(new Date().getHours()<14 && new Date().getHours()>8){
        mysetTime = setTimeout("showList()",5000);
    }
    
}

function search(string)
{
    console.log('!! ' + string);
    $.get("https://tw.stock.yahoo.com/_td-stock/api/resource/AutocompleteService;query="+string,
        function(data,status){
            if(data.ResultSet.Result[0].symbol == string+'.TW')
            {
                chrome.storage.local.get(['teststring1'], function(result) {
                    if(result.teststring1 == null || result.teststring1 == '')
                    {
                        saveTemp = string;
                    }
                    else
                    {
                        temp = result.teststring1;
                        var listArray = temp.split(',');
                        listArray.push(string);
                        saveTemp = listArray.join(',');
                    }

                    alert("Data: " + data.ResultSet.Result[0].symbol + "\n name: " + data.ResultSet.Result[0].name);
                    chrome.storage.local.set({
                        'teststring1': saveTemp
                    }, function() {
                        console.log('Value is set to ' + saveTemp);
                    });
                    showList();
                });
            }
            else
                alert('NO');
        });
}

function deleteList(id)
{
    chrome.storage.local.get(['teststring1'], function(result) {
        if(result.teststring1 == null)
            return;
        temp = result.teststring1;
        var listArray = temp.split(',');
        listArray.removeEle(id);
        saveTemp = listArray.join(',');
        chrome.storage.local.set({
            'teststring1': saveTemp
        }, function() {
            console.log('Value is set to ' + saveTemp);
        });
        showList();
    });
}


Array.prototype.removeEle = function(val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

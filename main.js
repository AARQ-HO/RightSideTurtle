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
                '<td>個股</td>'+
                '<td>價格</td>'+
                '<td>漲跌</td>'+
                '<td>最高</td>'+
                '<td>最低</td>'+
                '<td>類股</td>'+
                '<td>內盤</td>'+
                '<td>外盤</td>'+
                '<td>操作</td>'+
                '</tr></table>');
            $.ajaxSettings.async = false;
            listArray.forEach(
                item => {
                    $.get("https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;fields=avgPrice%2Corderbook;symbols="+item,
                        function(data,status){
                            if(data[0].change > 0)
                                var color = 'red';
                            else
                                var color = 'green';

                            var clickId = 'cancelBtn_id_'+item;
                            var itemobj = '<tr>'+
                                '<td>'+item+'<br>'+data[0].symbolName+'</td>'+
                                '<td>'+data[0].price+'</td>'+
                                '<td style="color:'+color+';">'+data[0].change+'<br>'+data[0].changePercent+'</td>'+
                                '<td>'+data[0].regularMarketDayHigh+'</td>'+
                                '<td>'+data[0].regularMarketDayLow+'</td>'+
                                '<td>'+data[0].sectorName+'</td>'+
                                '<td colspan="2" style="width:200px"><div class="text-wrap"><div class="text inMarket">'+data[0].inMarket+' ('+data[0].inMarketPercentage+')</div><div class="text outMarket">'+data[0].outMarket+' ('+data[0].outMarketPercentage+')</div></div>'+
								'<div class="chart inMarket"></div><div class="chart outMarket"></div></td>'+
                                
                                '<td><input id="'+clickId+'" type="button" value="X"></td>>'
                                +'</tr>>'
                            ;
                            $('#gg1').append(itemobj);
                            $('#'+clickId).click(function(){
                                deleteList(item);
                            });
							/* 長條圖 */
							$('.chart.inMarket').css('width',data[0].inMarketPercentage);
							$('.chart.outMarket').css('width',data[0].outMarketPercentage);
							
                        });
                });
        }
    });
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
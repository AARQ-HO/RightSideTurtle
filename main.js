var mysetTime = null;
showList();
/*測試用*/
document.getElementById('pic').addEventListener('click', function () {
    testt('666');
});

document.getElementById('searchBtn').addEventListener('click', function () {
    search(document.getElementById('searchId').value);
});
var DT;
$(document).ready(function () {
    $("#searchId").keypress(function (e) {
        if (e.which == 13) {
            search($(this).val());
        }
    });
    $("#toggleBtn").on('click', function () {
        if ($(this).val() == "自我激勵") {
            $(this).val('龜龜退下')
            $("#pic").show();
            $("#TurFace").show();
            $("#mainTable").css("margin-top", "0px")
        } else {
            $(this).val('自我激勵')
            $("#pic").hide();
            $("#TurFace").hide();
            $("#mainTable").css("margin-top", "60px")
        }
    })
})

function testt(string) {
    /*
        chrome.storage.local.get(['teststring1'], function(result) {
            temp = result.teststring1;
            console.log('Value currently is ' + temp);
            showList(temp);
        });*/
    showList();
}

function showList(list) {
    var tableCellpadding = 10;
    console.log('show')
    chrome.storage.local.get(['teststring1'], function (result) {
        $('#mainTable').empty();
        if (result.teststring1 == null || result.teststring1 == '')
            return;
        list = result.teststring1;
        console.log('Value currently is ' + list);
        var listArray = list.split(',');
        if (listArray.length > 0) {
            $('#mainTable').append('<table id="gg1" class="table table-striped dataTable" style="border:3px #cccccc solid;" cellpadding="' + tableCellpadding + '" border="1"><thead><tr>' +
                '<th class="sorting sorting_disabled">K</th>' +
                '<th class="sorting">個股</th>' +
                '<th class="sorting">價格</th>' +
                '<th class="sorting">漲跌</th>' +
                '<th class="sorting">最高</th>' +
                '<th class="sorting">最低</th>' +
                '<th class="sorting">類股</th>' +
                '<th class="sorting">內盤/外盤</th>' +
                '<th class="sorting">功能</th>' +
                '</tr></thead><tbody></tbody></table>');

            var count = 0;
            $.ajaxSettings.async = false;
            listArray.forEach(
                item => {
                    count++;
                    /*  */
                    $.get("https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;fields=avgPrice%2Corderbook;symbols=" + item, function (d, s) {
                        try {
                            showList_Callback(d, s, item, count);
                        } catch (e) {
                            console.log(e);

                        }

                    });
                });
        }
    })


    /* 一秒後重新增加外掛功能，不重載後可以移除此定時 */
    setTimeout(function () {
        $("#gg1").find('tbody').sortable();

        DT = $("#gg1").DataTable({
            columnDefs: [{
                orderable: false,
                targets: [0, 8]
                }],
            "paging": false,
            "searching": false,
            "info": false,
            "destroy": true
        })
    }, 1000);
    
    TurtleMood();

    /* 十秒重刷一次 */
    clearTimeout(mysetTime);
    if (new Date().getHours() < 14 && new Date().getHours() > 8) {
        /*建置完後 就只跑UPDATE*/
        mysetTime = setTimeout("updateList()", 10000);
    }

}

function showList_Callback(data, status, item, count) {

    if (!data[0]) {
        /* 會有找得到代號卻無資料的情況 帶入必須是她找到的symbo */
        console.log(data)
        return
    }

    if (data[0].change > 0) {
        var color = 'red';
    } else {
        var color = 'green';
    }

    var itemForId = item.replace(/.TWO|.TW/ig, "");
    var clickId = 'cancelBtn_id_' + itemForId;
    var chartId = itemForId + '_chart_' + count;
    var chartId_K = itemForId + '_K_' + count;
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
    /*
    var buyRate = (data[0].sumBidVolK / (data[0].sumBidVolK + data[0].sumAskVolK)) * 100;
    buyRate = buyRate.toFixed(2);
    var sellRate = 100 - buyRate;
    sellRate = sellRate.toFixed(2);
    */
    /* K線資料 */
    /* 最高高度*/
    var chartK_Height = 50;
    var limitRange = data[0].limitUpPrice - data[0].limitDownPrice;
    var limitavg = (parseFloat(data[0].limitUpPrice) + parseFloat(data[0].limitDownPrice)) / 2;
    var avgPrice = (parseFloat(data[0].regularMarketDayHigh) + parseFloat(data[0].regularMarketDayLow)) / 2;
    var K_info = new Object();
    /*K線高度*/
    K_info.value1 = (data[0].regularMarketDayHigh - data[0].regularMarketDayLow) / limitRange * chartK_Height;
    /*K棒高度(會有正負)*/
    K_info.value2 = (data[0].price - data[0].regularMarketOpen) / limitRange * chartK_Height;

    /*K位置*/
    K_info.top1 = chartK_Height - parseFloat((data[0].limitUpPrice - data[0].regularMarketDayHigh) / limitRange * chartK_Height);

    /*綠棒*/
    if (K_info.value2 < 0) {
        K_info.top2 = K_info.value1 - (data[0].regularMarketDayHigh - data[0].regularMarketOpen) / limitRange * chartK_Height;
        K_info.color = 'green';
    }
    /*紅棒*/
    else {
        K_info.top2 = K_info.value1 - (data[0].regularMarketDayHigh - data[0].price) / limitRange * chartK_Height;
        K_info.color = 'red';
    }
    /* 圖表設定 */
    chartIn.css('width', data[0].inMarketPercentage);
    chartOut.css('width', data[0].outMarketPercentage);
    chartK_1.css({
        'height': K_info.value1,
        'margin-top': -K_info.top1,
        'background-color': 'black'
    });
    chartK_2.css({
        'height': Math.abs(K_info.value2),
        'margin-top': -K_info.top2,
        'background-color': K_info.color
    });

    var symboName = data[0].symbolName;
    var nameSpan = '<span>' + symboName + '</span>';
    if (symboName.length > 4) {
        symboName = symboName.slice(0, 4);
        nameSpan = '<span>' + symboName + '<img class="imgMore" src="images/more.png" title="' + data[0].symbolName + '" /></span>'
    }

    var itemobj;

    try {
        itemobj = '<tr id="'+itemForId+'">' +
            '<td id="' + chartId_K + '"></td>' +
            '<td class="stockName">' + item + '<br>' + nameSpan + '</td>' +
            '<td class="stockPrice">' + data[0].price + '</td>' +
            '<td class="stockChange" style="color:' + color + ';">' + data[0].change + '<br>' + data[0].changePercent + '</td>' +
            '<td class="stockMarketDayHight">' + data[0].regularMarketDayHigh + '</td>' +
            '<td class="stockMarketDayLow" class="stockPrice">' + data[0].regularMarketDayLow + '</td>' +
            '<td class="stockSectorName">' + data[0].sectorName + '</td>' +
            '<td class="stockInOut" style="width:250px" id="' + chartId + '" ><div class="text-wrap"><div class="text inMarket">' + data[0].inMarket + ' (' + data[0].inMarketPercentage + ')</div><div class="text outMarket">' + data[0].outMarket + ' (' + data[0].outMarketPercentage + ')</div><br></div>' +
            '<td class=""><input id="' + clickId + '" type="button" class="btnDel"></td>>' +
            '</tr>>';
    } catch (e) {
        console.log(e);
        itemobj = '<tr><td id="' + chartId_K + '">"' + e.message + '"</td>';
    }

    $('#gg1').find('tbody').append(itemobj);

    $('#' + chartId).append(chartIn);
    $('#' + chartId).append(chartOut);
    //$('#'+ chartId_K).append($('<div></div>').css('height','50px'));
    $('#' + chartId_K).append('<div style="height: ' + chartK_Height + 'px; width:10px;border: dotted 0.5px; "></div>');
    $('#' + chartId_K).append(chartK_1);
    $('#' + chartId_K).append(chartK_2);
    $('#' + chartId_K).append($('<div></div>').css('height', K_info.value1 - Math.abs(K_info.value2)));
    $('#' + chartId_K).css({
        'height': chartK_Height
    });
    $('#' + chartId_K).css({
        'display': 'block',
        'box-sizing': 'content-box'
    });

    $('#' + clickId).click(function () {
        deleteList(item);
    });

}

function updateList(list) {
    console.log('update')
    chrome.storage.local.get(['teststring1'], function (result) {
        if (result.teststring1 == null || result.teststring1 == '')
            return;
        list = result.teststring1;
        console.log('Value currently is ' + list);
        var listArray = list.split(',');
        if (listArray.length > 0) {
            $.ajaxSettings.async = false;
            listArray.forEach(
                item => {
            /*  */
            $.get("https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;fields=avgPrice%2Corderbook;symbols=" + item, function (d, s) {
                try {
                    updateStock(d, item);
                } catch (e) {
                    console.log(e);

                }

            });
        });
        }
    })

    TurtleMood();

    /* 十秒重刷一次 */
    clearTimeout(mysetTime);
    if (new Date().getHours() < 14 && new Date().getHours() > 8) {
        mysetTime = setTimeout("updateList()", 10000);
    }

}

function updateStock(data,item)
{
    if (!data[0]) {
        /* 會有找得到代號卻無資料的情況 帶入必須是她找到的symbo */
        console.log(data)
        return
    }
    if (data[0].change > 0) {
        var color = 'red';
    } else {
        var color = 'green';
    }

    var itemForId = item.replace(/.TWO|.TW/ig, "");
    /* 長條圖 */
    /*內盤 外盤*/
    /*
    inMarket
    inMarketPercentage
    outMarket
    outMarketPercentage
    */

    /* 委買 委賣*/
    /*
    var buyRate = (data[0].sumBidVolK / (data[0].sumBidVolK + data[0].sumAskVolK)) * 100;
    buyRate = buyRate.toFixed(2);
    var sellRate = 100 - buyRate;
    sellRate = sellRate.toFixed(2);
    */

    /* K線資料 */
    /* 最高高度*/
    var chartK_Height = 50;
    var limitRange = data[0].limitUpPrice - data[0].limitDownPrice;
    var limitavg = (parseFloat(data[0].limitUpPrice) + parseFloat(data[0].limitDownPrice)) / 2;
    var avgPrice = (parseFloat(data[0].regularMarketDayHigh) + parseFloat(data[0].regularMarketDayLow)) / 2;
    var K_info = new Object();
    /*K線高度*/
    K_info.value1 = (data[0].regularMarketDayHigh - data[0].regularMarketDayLow) / limitRange * chartK_Height;
    /*K棒高度(會有正負)*/
    K_info.value2 = (data[0].price - data[0].regularMarketOpen) / limitRange * chartK_Height;

    /*K位置*/
    K_info.top1 = chartK_Height - parseFloat((data[0].limitUpPrice - data[0].regularMarketDayHigh) / limitRange * chartK_Height);

    /*綠棒*/
    if (K_info.value2 < 0) {
        K_info.top2 = K_info.value1 - (data[0].regularMarketDayHigh - data[0].regularMarketOpen) / limitRange * chartK_Height;
        K_info.color = 'green';
    }
    /*紅棒*/
    else {
        K_info.top2 = K_info.value1 - (data[0].regularMarketDayHigh - data[0].price) / limitRange * chartK_Height;
        K_info.color = 'red';
    }

    try {
        $('#'+itemForId+' .stockPrice').html(data[0].price);
        $('#'+itemForId+' .stockChange').css("color",color);
        $('#'+itemForId+' .stockChange').html(data[0].change+'<br>'+data[0].changePercent);
        $('#'+itemForId+' .stockPrice').html(data[0].price);
        $('#'+itemForId+' .stockMarketDayHight').html(data[0].regularMarketDayHigh);
        $('#'+itemForId+' .stockMarketDayLow').html(data[0].regularMarketDayLow);
        $('#'+itemForId+' .chart.inMarket').css('width',data[0].inMarketPercentage);
        $('#'+itemForId+' .text.inMarket').html(data[0].inMarket+' ('+data[0].inMarketPercentage+')');
        $('#'+itemForId+' .chart.outMarket').css('width',data[0].outMarketPercentage);
        $('#'+itemForId+' .text.outMarket').html(data[0].outMarket+' ('+data[0].outMarketPercentage+')');

        $('#'+itemForId+' .chartK_1').css('height',K_info.value1);
        $('#'+itemForId+' .chartK_1').css('margin-top',-K_info.top1);
        $('#'+itemForId+' .chartK_2').css('height',Math.abs(K_info.value2));
        $('#'+itemForId+' .chartK_2').css('margin-top',-K_info.top2);
        $('#'+itemForId+' .chartK_2').css('background-color',K_info.color);

    } catch (e) {
        console.log(e);
    }
}

function search(string) {
    console.log('!! ' + string);
    $.get("https://tw.stock.yahoo.com/_td-stock/api/resource/AutocompleteService;query=" + string,
        function (data, status) {
            var isInTW = false;
            if (data.ResultSet && data.ResultSet.Result.length != 0) {
                /* 跑迴圈搜尋結果清單是否有台股項目，找到第一項即停止 */
                for (var i = 0; i < data.ResultSet.Result.length; i++) {
                    if (data.ResultSet.Result[i].exch == 'TWO' || data.ResultSet.Result[i].exch == 'TAI') {
                        chrome.storage.local.get(['teststring1'], function (result) {
                            /* 改存API找到的symbo 而非原本自己鍵入搜尋的字串 */
                            if (result.teststring1 == null || result.teststring1 == '') {
                                saveTemp = data.ResultSet.Result[i].symbol;
                            } else {
                                temp = result.teststring1;
                                var listArray = temp.split(',');
                                listArray.push(data.ResultSet.Result[i].symbol);
                                saveTemp = listArray.join(',');
                            }

                            var confirmAdd = confirm("您將新增的是：\n股票代碼: " + data.ResultSet.Result[i].symbol + "\n股票名稱: " + data.ResultSet.Result[i].name);
                            if (confirmAdd) {
                                chrome.storage.local.set({
                                    'teststring1': saveTemp
                                }, function () {
                                    console.log('Value is set to ' + saveTemp);
                                });
                                showList();
                            }
                        });
                        isInTW = true;
                        break;
                    }
                }

                if (!isInTW) {
                    alert('台股中找不到此檔股票！\n請再次確認。');
                }

            } else {
                alert('找不到此檔股票！\n請再次確認。');
            }
        });
}

function deleteList(id) {
    chrome.storage.local.get(['teststring1'], function (result) {
        if (result.teststring1 == null)
            return;
        temp = result.teststring1;
        var listArray = temp.split(',');
        listArray.removeEle(id);
        saveTemp = listArray.join(',');
        chrome.storage.local.set({
            'teststring1': saveTemp
        }, function () {
            console.log('Value is set to ' + saveTemp);
        });
        showList();
    });
}

function svgAnimate(num) {
console.log(num)
    var animateSet = []
    animateSet[0] = [];
    animateSet[1] = [];
    animateSet[0][0] = "M45,110.5c0,0-4.5,3-4,5.5s15.5,11,36-5.5c0,0,14,8.836,15.5,9.918 s29.5,12.082,46.456,0.749c0,0,1.044-2.773-0.372-7";
    animateSet[0][1] = "M44.809,127.742c5.998,0.318,14.209,0.391,31.025-5.909 c11.305,1.921,16.488,4.833,21.083,5.917c7.417,1.75,26.083,4.624,44.083,1.583";
    animateSet[0][2] = "M51.5,130.666c5.998,0.318,7.518-2.533,24.334-8.833 c11.305,1.921,16.488,4.833,21.083,5.917c7.417,1.75,18.833,4.507,37.083,6.5";
    animateSet[0][3] = "M58,133c5.998,0.318,1.018-4.867,17.834-11.167 c11.305,1.921,22.479,6.984,26.666,9.167c6.235,3.25,7.75,5.14,22,4.5";
    animateSet[0][4] = "M58,133c5.518-3.888,1.018-4.867,17.834-11.167 C87.139,123.754,98.04,129.45,102.5,131c10.466,3.636,10.466,3.636,16.5,6.5";
    animateSet[0][5] = "M63.5,133.686c-1.205-4.02,0.488-6.2,12.334-11.853 c11.305,1.921,16.922,5.447,21.382,6.997c10.466,3.636,11.534,3.67,13.534,8.6";
    animateSet[0][6] = "M64.75,140.032c-1.205-4.02-0.762-12.547,11.084-18.199 c11.305,1.921,17.712,4.026,21.382,6.997c4.534,3.67,7.034,6.202,9.034,11.202";
    animateSet[0][7] = "M45,106.5c0,0-4.5,3-4,5.5s15.5,15,36-1.5 c0,0,13.903,8.983,15.5,9.918c9.75,5.707,29.5,8.082,46.456-3.251c0,0,1.794-3.042-1.331-7.667";
    animateSet[0][8] = "M46,102.5c0,0-4.5,3-4,5.5s15.875,22.375,35,2.5 c0,0,13.903,8.983,15.5,9.918c9.75,5.707,27.5,3.082,44.456-8.251c0,0,1.794-3.042-1.331-7.667";
    animateSet[0][9] = "M46.75,100c0,0-3,5.625-2.5,8.125S56.375,127.875,77,110.5 c0,0,13.903,8.983,15.5,9.918c9.75,5.707,29.625-0.793,41.456-10.251c0,0,0.919-4.792-3.206-9.042";
    animateSet[0][10] = "M46.75,100c0,0-3,5.625-2.5,8.125S56.5,129.625,77.5,108 c0,0,14.414,11.171,16.125,11.875c14.5,5.97,24.294,0.861,36.125-8.597c0,0,2.25-7.028-1.875-11.278";
    animateSet[0][11]="M102.529,133.756C60.5,129.25,68.904,131.151,80.75,125.5 c11.305,1.921,12.796,0.359,16.466,3.33c4.534,3.67,7.034,6.201,9.034,11.201";
    animateSet[0][12] = "M102.096,133.261c0,0,1.747,8.236-6.096,7.239 c-6.807-0.865-9.841-7.587-13.25-6.25c-12.75,5-13.846-3.099-2-8.75c5.819-3,12.796,0.359,16.466,3.33 C99.184,130.423,100.769,131.802,102.096,133.261c1.73,1.901,3.022,3.94,4.154,6.771";
    animateSet[0][13] = "M104.25,140.25c0,0-2.715,8.106-8.75,3 c-8.125-6.875-6.25-9.408-12.75-2.576c-9.44,9.922-12.875-12.526-2-15.174c5.125-4,10.125,0.5,15.026,2.269 c1.968,1.593,3.474,5.481,5.349,5.856c2.521,0.504,3.5,6.375,4.25,8.375";
    animateSet[0][14] = "";
    animateSet[0][15] = "";
    animateSet[0][16] = "";
    animateSet[0][17] = "";
    animateSet[0][18] = "";
    animateSet[0][19] = "";
    animateSet[0][20] = "";
    
    
    animateSet[1][0] = "M147,113.5c0,0,5.5,5.5,0,14.5";
    animateSet[1][1] = "M146.223,126.264c0.791,0.684,2.778,6.184,2.832,9.486";
    animateSet[1][2] = "M135.416,128.257c0.791,0.684,2.778,6.184,2.832,9.486";
    animateSet[1][3] = "M128.445,133.686c0.791,0.684,1.555,2.532,0,5.064";
    animateSet[1][4] = "M128.445,133.686c0.791,0.684,1.555,2.532,0,5.064";
    animateSet[1][5] = "M115,136.25c-0.083,2.083-0.458,3.042-2.142,3.782";
    animateSet[1][6] = "M109.313,140.5c0,3.437-1.438,3.938-4.063,3.314";
    animateSet[1][7] = "M147,113.5c0,0,2.75,7.125-3.875,10.875";
    animateSet[1][8] = "M139.502,100.73c0,0,7.873,5.145,2.248,13.77";
    animateSet[1][9] = "M94.264,121.319c0,0-15.514,17.056-27.907-4.371";
    animateSet[1][10] = "M97.766,121.317c0,0-19.766,35.933-33.813-3.965";
    animateSet[1][11] = "M109.313,140.5c0,3.438-1.438,3.938-4.063,3.314";
    animateSet[1][12] = "M81.569,139.568c2.874-1.886,4.081-0.958,5,1.578";
    animateSet[1][13] = "M82.263,134.667c2.136-5.696,5.417-10.894,10.244-0.806";
    animateSet[1][14] = "";
    animateSet[1][15] = "";
    animateSet[1][16] = "";
    animateSet[1][17] = "";
    animateSet[1][18] = "";
    animateSet[1][19] = "";
    animateSet[1][20] = "";

    if (num < animateSet[0].length) {
        $("#animate1")[0].onend = function () {
            $("#path1").attr("d", animateSet[0][num]);

        }
        $("#animate2")[0].onend = function () {
            $("#path2").attr("d", animateSet[1][num]);
        }
        $("#animate1").attr("to", animateSet[0][num]);
        $("#animate2").attr("to", animateSet[1][num]);
        $("#animate1")[0].beginElement();
        $("#animate2")[0].beginElement();
    }
}

function TurtleMood() {
    $.get("https://tw.stock.yahoo.com/_td-stock/api/resource/StockServices.stockList;fields=avgPrice%2Corderbook;symbols=%5ETWII",
        function (data, status) {
            var change = 0;
            var smileNum = 7;

            if (data[0]) {
                change = data[0].changePercent.replace("%", "");
                change = eval(change).toFixed(0);
            }
        
        console.log(change)
            if (change < 0) {
                /* 當大盤為負 */
                svgAnimate(-eval(change))
            } else {
                svgAnimate(eval(change) + smileNum)
            }
        })


}


Array.prototype.removeEle = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

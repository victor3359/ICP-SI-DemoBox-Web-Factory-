"use strict";
$(document).ready(function() {
    var powerdata = [];
    var voltagedata = [];
    var amperedata = [];
    var powerdata_c = [];
    var chartdata = [];
    var RHdata = [];
    var TEMPdata = [];

    var room = 'room';

    var gauge2=new JustGage({
        id: "gauge2",
        relativeGaugeSize: true,
        value: 0,
        min: 0,
        max: 100,
        decimals: 1,
        levelColors: ["#0fb0c0"],
        valueFontFamily: "Source Sans Pro, sans-serif",
        counter: true
    });
    var gauge3=new JustGage({
        id:"gauge3",
        relativeGaugeSize:true,
        value:0,
        min:0,
        max:100,
        decimals:0,
        levelColors:["#ff8080"],
        valueFontFamily:"Source Sans Pro, sans-serif",
        counter:true
    });

    var gauge1=new JustGage({
        id:"gauge1",
        relativeGaugeSize:true,
        value:0,
        min:0,
        max:100,
        decimals:0,
        valueFontFamily:"Source Sans Pro, sans-serif",
        levelColors:["#00c0ef"],
        counter:true
    });

    socket.on('factory_Light', function (data) {
       var stateA, stateB, colorA, colorB;
        if(data['A_R']){
            stateA = '紅';
            colorA = 'red';
        }else if(data['A_Y']){
            stateA = '黃';
            colorA = 'yellow';
        }else if(data['A_G']){
            stateA = '綠';
            colorA = 'green';
        }else{
            stateA = '滅';
            colorA = 'black';
        }
        if(data['B_R']){
            stateB = '紅';
            colorB = 'red';
        }else if(data['B_Y']){
            stateB = '黃';
            colorB = 'yellow';
        }else if(data['A_G']){
            stateB = '綠';
            colorB = 'green';
        }else{
            stateB = '滅';
            colorB = 'black';
        }
        $('#Light_State1').html(stateA).css('color', colorA);
        $('#Light_State2').html(stateB).css('color', colorB);
    });

    socket.on('factory_Motor', function (data) {
        if(data['MotorA']) {
            $('#MachineA_State').html('啟動中').css('color', 'green');
        }else{
            $('#MachineA_State').html('已停止').css('color','red');
        }
        if(data['MotorB']) {
            $('#MachineB_State').html('啟動中').css('color', 'green');
        }else{
            $('#MachineB_State').html('已停止').css('color','red');
        }
    });

    var oldIntervalShock = null;
    socket.on('shock', function(data){
        console.log(data['ID']);
        var machine;
        switch(data){
            case 1:
                machine = 'A';
                break;
            case 2:
                machine = 'B';
                break;
            default:
                break;
        }
        if(data['ID']){
            if(!oldIntervalShock) {
                oldIntervalShock = setInterval(function () {
                    new PNotify({
                        title: '機台故障警報',
                        text: '機台 ' + machine + ' 發生故障！<br>請檢視機台狀況。' + '<br>' + data['TIME'],
                        type: 'error',
                        after_init:
                            function (notice) {
                                notice.attention('rubberBand');
                            }
                    });
                }, 3000);
            }
        }else{
            clearInterval(oldInterval);
            oldIntervalShock = null;
        }
    });

    var oldInterval = null;
    socket.on('factory_TPD', function (data) {
        if(TEMPdata[0]) {
            gauge2.refresh((TEMPdata[0] / data['SETTEMP']) * 100);
                    if (TEMPdata[0] >= data['SETTEMP']) {
                        if(!oldInterval) {
                            oldInterval = setInterval(function () {
                                var title = '機台警報';
                                var message = '溫度超出標準值！';
                                ShowNotify(title, message, data['TIME']);
                            }, 3000);
                        }
                    }else{
                        clearInterval(oldInterval);
                        oldInterval = null;
                    }
        }
        if(data['SETPV']) {
            gauge1.refresh((data['NOWPV']/data['SETPV'])*100);
            gauge3.refresh((data['NOF'] / data['SETPV']) * 100);
        }else{
            gauge1.refresh(0);
            gauge3.refresh(0);
        }
        switch(data['PSTAT']){
            case 1:
                $('#STAT_State').html('命令完成');
                break;
            case 2:
                $('#STAT_State').html('機台A 生產中...');
                break;
            case 3:
                $('#STAT_State').html('機台A 生產完成');
                break;
            case 4:
                $('#STAT_State').html('機台B 生產中...');
                break;
            case 5:
                $('#STAT_State').html('機台B 生產完成');
                break;
            case 6:
                $('#STAT_State').html('機台準備就緒');
                break;
            case 7:
                $('#STAT_State').html('緊急停止');
                break;
            case 8:
                $('#STAT_State').html('恢復動作');
                break;
        }
    });




    function controlalert(name, cmd){
        iziToast.show({
            title:'Command',
            message:'Turn ' + cmd + ' the ' + name + '.' ,
            color:'#00cc99',
            position:'bottomRight',
            timeout: 500
        });
    }
    socket.emit('done', room);

    $('#MachineA_Switch').click(function () {
        if($('#MachineA_State').html() == '已停止'){
            socket.emit('MotorA', 'ON');
            iziToast.show({
                title:'機台測試',
                message:'A 機台開始運轉' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else{
            socket.emit('MotorA', 'OFF');
            iziToast.show({
                title:'機台測試',
                message:'A 機台停止運轉' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }
    });

    $('#MachineB_Switch').click(function () {
        if($('#MachineB_State').html() == '已停止'){
            socket.emit('MotorB', 'ON');
            iziToast.show({
                title:'機台測試',
                message:'B 機台開始運轉' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else{
            socket.emit('MotorB', 'OFF');
            iziToast.show({
                title:'機台測試',
                message:'B 機台停止運轉' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }
    });

    $('#Light_Switch1').click(function () {
        if($('#Light_State1').html() == '滅'){
            socket.emit('LightChangeA', 1);
            iziToast.show({
                title:'燈號測試',
                message:'A 機台燈號 -> 紅' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else if($('#Light_State1').html() == '紅'){
            socket.emit('LightChangeA', 2);
            iziToast.show({
                title:'燈號測試',
                message:'A 機台燈號 -> 黃' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else if($('#Light_State1').html() == '黃'){
            socket.emit('LightChangeA', 3);
            iziToast.show({
                title:'燈號測試',
                message:'A 機台燈號 -> 綠' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else if($('#Light_State1').html() == '綠'){
            socket.emit('LightChangeA', 1);
            iziToast.show({
                title:'燈號測試',
                message:'A 機台燈號 -> 紅' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }
    });

    $('#Light_Switch2').click(function () {
        if($('#Light_State2').html() == '滅'){
            socket.emit('LightChangeB', 1);
            iziToast.show({
                title:'燈號測試',
                message:'B 機台燈號 -> 紅' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else if($('#Light_State2').html() == '紅'){
            socket.emit('LightChangeB', 2);
            iziToast.show({
                title:'燈號測試',
                message:'B 機台燈號 -> 黃' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else if($('#Light_State2').html() == '黃'){
            socket.emit('LightChangeB', 3);
            iziToast.show({
                title:'燈號測試',
                message:'B 機台燈號 -> 綠' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }else if($('#Light_State2').html() == '綠'){
            socket.emit('LightChangeB', 1);
            iziToast.show({
                title:'燈號測試',
                message:'B 機台燈號 -> 紅' ,
                color:'#00cc99',
                position:'bottomRight',
                timeout: 500
            });
        }
    });

    $('#TEST_On').click(function () {
        socket.emit('TESTMode', 'ON');
        iziToast.show({
            title:'模式更新',
            message:'進入測試模式.' ,
            color:'#00cc99',
            position:'bottomRight',
            timeout: 500
        });
    });
    $('#TEST_Off').click(function () {
        socket.emit('TESTMode', 'OFF');
        iziToast.show({
            title:'模式更新',
            message:'離開測試模式.' ,
            color:'#00cc99',
            position:'bottomRight',
            timeout: 500
        });
    });

    //Controller Def End
    function state(name, flag){
        if(flag) {
            document.getElementById(name).innerHTML = 'On';
        }else{
            document.getElementById(name).innerHTML = 'Off';
        }
    }


    function setText(name, value) {
        document.getElementById(name).innerHTML = value;
    }
    function ShowNotify(title, message, datetime){
        new PNotify({
            title: title,
            text: message + '<br>' + datetime,
            type:'error',
            after_init:
                function(notice){
                    notice.attention('rubberBand');
                }
        });
    }

    socket.on('FailedPD', function (data) {
        new PNotify({
            title: '檢測不良警報',
            text: '產品編號 ' + data['ID'] + ' 為不良品！<br>請檢視機台狀況。' +  '<br>' + data['TIME'],
            type:'error',
            after_init:
                function(notice){
                    notice.attention('rubberBand');
                }
        });
    });


    socket.on('factory_Power', function (data) {
        powerdata.push(data['KWH'].toFixed(3));
        voltagedata.push(data['V'].toFixed(3));
        amperedata.push(data['I']).toFixed(3);
        powerdata_c.push(data['KW'].toFixed(3) * 1000);
        new CountUp("widget_countup1", 0,data['KWH'].toFixed(3) , 0, 5.0, options).start();
        new CountUp("widget_countup2", 0,data['V'].toFixed(3) , 0, 5.0, options).start();
        new CountUp("widget_countup3", 0,data['I'].toFixed(3) * 1000, 0, 5.0, options).start();
        new CountUp("widget_countup4", 0,data['KW'].toFixed(3) * 1000 , 0, 5.0, options).start();
        setText("widget_countup12", data['KWH'].toFixed(3));
        setText("widget_countup22", data['V'].toFixed(3));
        setText("widget_countup32", data['I'].toFixed(3) * 1000);
        setText("widget_countup42", data['KW'].toFixed(3) * 1000);



        $("#visitsspark-chart").sparkline(powerdata, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' kWh'
        });
        $('#V_chart').sparkline(voltagedata,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' V'
        });
        $('#I_chart').sparkline(amperedata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' A'
        });
        $("#rating").sparkline(powerdata_c, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' W'
        });
    });
    socket.on('factory_update', function (data) {
        powerdata.push(data['KWH'].toFixed(3));
        voltagedata.push(data['V'].toFixed(3));
        amperedata.push(data['I']).toFixed(3);
        powerdata_c.push(data['KW'].toFixed(3) * 1000);
        setText("widget_countup1", parseInt(data['KWH']));
        setText("widget_countup2", parseInt(data['V']));
        setText("widget_countup3", data['I'].toFixed(3) * 1000);
        setText("widget_countup4", data['KW'].toFixed(3) * 1000);
        setText("widget_countup12", data['KWH'].toFixed(3));
        setText("widget_countup22", data['V'].toFixed(3));
        setText("widget_countup32", data['I'].toFixed(3) * 1000);
        setText("widget_countup42", data['KW'].toFixed(3) * 1000);



        if(powerdata.length > 10) powerdata.shift();
        if(powerdata_c.length > 10) powerdata_c.shift();
        if(voltagedata.length > 10) voltagedata.shift();
        if(amperedata.length > 10) amperedata.shift();


        $("#visitsspark-chart").sparkline(powerdata, {
            type: 'line',
            width: '100%',
            height: '48',
            lineColor: '#4fb7fe',
            fillColor: '#e7f5ff',
            tooltipSuffix: ' kWh'
        });
        $('#V_chart').sparkline(voltagedata,{
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#f0ad4e',
            lineColor: '#EF6F6C',
            tooltipSuffix: ' V'
        });
        $('#I_chart').sparkline(amperedata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' A'
        });
        $("#rating").sparkline(powerdata_c, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' W'
        });
    });
    //Power Socket
    socket.on('factory_Temp', function (data) {
        RHdata.push(data['HR'].toFixed(3));
        TEMPdata.push(data['TEMP'].toFixed(3));

        new CountUp("widget_countup7", 0,parseInt(data['HR'].toFixed(3)) , 0, 5.0, options).start();
        new CountUp("widget_countup8", 0,parseInt(data['TEMP'].toFixed(3)) , 0, 5.0, options).start();

        setText("widget_countup72", data['HR'].toFixed(3));
        setText("widget_countup82", data['TEMP'].toFixed(3));

        $('#RH_chart').sparkline(RHdata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' %'
        });
        $("#TEMP_chart").sparkline(TEMPdata, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' ℃'
        });
    });
    socket.on('factory_Tempu', function (data) {
        RHdata.push(data['HR'].toFixed(3));
        TEMPdata.push(data['TEMP'].toFixed(3));

        setText("widget_countup7", parseInt(data['HR']));
        setText("widget_countup8", parseInt(data['TEMP']));

        setText("widget_countup72", data['HR'].toFixed(3));
        setText("widget_countup82", data['TEMP'].toFixed(3));

        if(RHdata.length > 10) RHdata.shift();
        if(TEMPdata.length > 10) TEMPdata.shift();

        $('#RH_chart').sparkline(RHdata, {
            type: 'line',
            height: "48",
            width: "100%",
            lineColor: '#0cd32d',
            fillColor: '#27c5f0',
            tooltipSuffix: ' %'
        });
        $("#TEMP_chart").sparkline(TEMPdata, {
            type: 'line',
            width: "100%",
            height: '48',
            spotColor: '#FF00FF',
            lineColor: '#DF0F7C',
            tooltipSuffix: ' ℃'
        });
    });


    socket.on('factory_chart_rt', function (data) {
        console.log(data);
        for(var i=0;i < data.length;i++) {
            chartdata.push({
                data1: data[i]['KW'],
                data2: data[i]['V'],
                data3: data[i]['I'],
                data4: data[i]['HR'],
                data5: data[i]['TEMP'],
                data6: data[i]['SETTEMP'],
                data7: data[i]['FAIL'] * 1000,
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });
    socket.on('factory_chart_data', function (data) {
        for(var i=0;i < data.length;i++) {
            chartdata.push({
                data1: data[i]['KW'],
                data2: data[i]['V'],
                data3: data[i]['I'],
                data4: data[i]['HR'],
                data5: data[i]['TEMP'],
                data6: data[i]['SETTEMP'],
                data7: data[i]['FAIL'] * 1000,
                date: data[i]['TIME']
            });
        }
        updatechartrt();
    });

    socket.on('factory_chart_trend', function (data) {
        var chart = AmCharts.makeChart( "chart_trend2", {
            "type": "serial",
            "addClassNames": true,
            "theme": "light",
            "autoMargins": false,
            "marginLeft": 30,
            "marginRight": 8,
            "marginTop": 10,
            "marginBottom": 26,
            "balloon": {
                "adjustBorderColor": false,
                "horizontalPadding": 10,
                "verticalPadding": 8,
                "color": "#ffffff"
            },

            "dataProvider": data
            ,
            "valueAxes": [ {
                "axisAlpha": 0,
                "position": "left"
            } ],
            "startDuration": 1,
            "graphs": [ {
                "alphaField": "alpha",
                "balloonText": "<span style='font-size:12px;'>[[title]] 在 [[category]]:<br><span style='font-size:20px;'>[[value]]</span> [[additional]]</span>",
                "fillAlphas": 1,
                "title": "耗電量",
                "type": "column",
                "valueField": "kWh",
                "dashLengthField": "dashLengthColumn"
            }],
            "categoryField": "TIME",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "tickLength": 0
            },
            "export": {
                "enabled": true
            }
        } );
    });




//   flip js

    $("#top_widget1, #top_widget2, #top_widget3, #top_widget4, #top_widget5, #top_widget6, #top_widget7, #top_widget8").flip({
        axis: 'x',
        trigger: 'hover'
    });

    var options = {
        useEasing: true,
        useGrouping: true,
        decimal: '.',
        prefix: '',
        suffix: ''
    };

    socket.on('factory_chart_status', function (data) {
        var date = [];
        var dataW = [], datakWh = [];
        for(var i = data.length - 1;i >= 0;i--){
            date.push(data[i]['TIME']);
            dataW.push(data[i]['W']);
            datakWh.push(data[i]['kWh']);
        }
        Highcharts.chart('container', {
            chart: {
                zoomType: 'xy'
            },
            title: {
                text: ''
            },
            subtitle: {
                text: ''
            },
            xAxis: [{
                categories: date,
                crosshair: true
            }],
            yAxis: [{ // Primary yAxis
                labels: {
                    format: '{value} W',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                title: {
                    text: 'Power',
                    style: {
                        color: Highcharts.getOptions().colors[0]
                    }
                },
                opposite: true

            }, { // Secondary yAxis
                gridLineWidth: 0,
                title: {
                    text: 'Kilowatt-Hours',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                },
                labels: {
                    format: '{value} kWh',
                    style: {
                        color: Highcharts.getOptions().colors[1]
                    }
                }
            }],
            tooltip: {
                shared: true
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                x: 70,
                verticalAlign: 'top',
                y: 0,
                floating: true,
                backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
            },
            series: [
                {
                    name: 'Power',
                    type: 'column',
                    data: dataW,
                    tooltip: {
                        valueSuffix: ' W'
                    }
                },
                {
                    name: 'Kilowatt-Hour',
                    type: 'spline',
                    yAxis: 1,
                    data: datakWh,
                    tooltip: {
                        valueSuffix: ' kWh'
                    }

                }]
        });
    });

    function updatechartrt() {
        AmCharts.makeChart("rt_chart",
            {
                "type": "serial",
                "categoryField": "date",
                "dataDateFormat": "YYYY-MM-DD HH:NN:SS",
                "categoryAxis": {
                    "minPeriod": "ss",
                    "parseDates": true
                },
                "chartCursor": {
                    "enabled": true,
                    "categoryBalloonDateFormat": "JJ:NN:SS"
                },
                "chartScrollbar": {
                    "enabled": true
                },
                "trendLines": [],
                "graphs": [
                    {
                        "bullet": "none",
                        "id": "AmGraph-1",
                        "title": "Power",
                        "valueField": "data1",
                        "lineThickness" : 4,
                        "lineColor": "#000088"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-2",
                        "title": "Voltage",
                        "valueField": "data2",
                        "lineThickness" : 4,
                        "lineColor": "#00BBFF"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-3",
                        "title": "Current",
                        "valueField": "data3",
                        "lineThickness" : 4,
                        "lineColor": "#77DDFF"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-4",
                        "title": "Humidity",
                        "valueField": "data4",
                        "lineThickness" : 4,
                        "lineColor": "#00DD00"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-5",
                        "title": "Temp",
                        "valueField": "data5",
                        "lineThickness" : 4,
                        "lineColor": "#CCFF33"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-6",
                        "title": "Alarm Temp",
                        "valueField": "data6",
                        "lineThickness" : 4,
                        "lineColor": "#668800"
                    },
                    {
                        "bullet": "none",
                        "id": "AmGraph-7",
                        "title": "ProductStatus",
                        "valueField": "data7",
                        "lineThickness" : 4,
                        "lineColor": "#FFCC22"
                    }
                ],
                "guides": [],
                "valueAxes": [
                    {
                        "id": "ValueAxis-1",
                        "title": ""
                    }
                ],
                "allLabels": [],
                "balloon": {},
                "legend": {
                    "enabled": true,
                    "useGraphSettings": true
                },
                "titles": [
                    {
                        "id": "Factory",
                        "size": 15,
                        "text": ""
                    }
                ],
                "dataProvider": chartdata
            }
        );
    }
});
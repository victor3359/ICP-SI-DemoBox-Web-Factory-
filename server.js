var express = require('express');
var app = express();
var port = 8080;
var cors = require('cors');
var date = require('date-and-time');

var mongodb = require('mongodb').MongoClient;

var url = "mongodb://192.168.101.20:27017/factory";
var error_count = 0;
var oldInterval = null;
var oldchartInterval = null;
var updateroom = null;

app.use(cors());
var route = express.Router();

function Init(){
    mongodb.connect(url, function(err, db){
        //todo: Init Power Data
        db.collection('MeterInformation').find({Type:'Power'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                V: objects[0]['V_a'],
                I: objects[0]['I_a'],
                KWH: objects[0]['kWh_a'],
                KW: objects[0]['kW_a'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Power', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Init TempRH Data
        db.collection('MeterInformation').find({Type:'TempRH'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                HR: objects[0]['RH'],
                TEMP: objects[0]['Temp'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Temp', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Init TPD Data
        db.collection('MeterInformation').find({Type:'TPDData'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                SETPV: objects[0]['SetProductionVolume'],
                NOWPV: objects[0]['NowProductionVolume'],
                PSTAT: objects[0]['ProductionVolumeStatus'],
                EA: objects[0]['ExcutingAnOrder'],
                ERROR: objects[0]['ErrorCode'],
                SETTEMP: objects[0]['SetWarningTemp'],
                NOF: objects[0]['NumberOfFailures'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_TPD', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Init Motor Data
        db.collection('MeterInformation').find({Type:'Motor'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                MotorA: objects[0]['D1_Motor'],
                MotorB: objects[0]['D2_Motor'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Motor', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Init Motor Data
        db.collection('MeterInformation').find({Type:'Motor'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                MotorA: objects[0]['D1_Motor'],
                MotorB: objects[0]['D2_Motor'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Motor', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Init WarningLight Data
        db.collection('MeterInformation').find({Type:'WarningLight'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                MotorA_R: objects[0]['D1_LED_RED'],
                MotorA_Y: objects[0]['D1_LED_Yellow'],
                MotorA_G: objects[0]['D1_LED_Green'],
                MotorB_R: objects[0]['D2_LED_RED'],
                MotorB_Y: objects[0]['D2_LED_Yellow'],
                MotorB_G: objects[0]['D2_LED_Green'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Light', data);
            db.close();
        });
    });
    /*mongodb.connect(url, function (err, db) {
        //todo: Factory - RealTime Chart
        db.collection('MeterInformation').aggregate([{$match: {Type: 'Power'}},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$sysdatetime"},
                        "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                        "hour": {"$hour": "$sysdatetime"},
                        "interval": {
                            "$subtract": [
                                {"$minute": "$sysdatetime"},
                                {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                            ]
                        }
                    },
                    datetime: {"$first": "$sysdatetime"},
                    data: {$first: "$$ROOT"}
                }
            },
            {$sort: {_id: -1}}, {$limit: 1000}
        ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var realtimedata = [];
            for (var i = 0; i < objects.length; i++) {
                realtimedata.push({
                    KW: objects[i]['data']['kW_a'],
                    TIME: date.format(objects[i]['data']['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                });
            }
            socket.emit('factory_chart_rt', realtimedata);
            db.close();
        });
    });*/
    mongodb.connect(url, function(err, db){
        //todo: Factory - Status Chart
        db.collection('MeterInformation').aggregate([{$match: {Type: 'Power'}},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$sysdatetime"},
                        "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                        "hour": {"$hour": "$sysdatetime"},
                        "interval": {
                            "$subtract": [
                                {"$minute": "$sysdatetime"},
                                {"$mod": [{"$minute": "$sysdatetime"}, 1]}
                            ]
                        }
                    },
                    datetime: {"$first": "$sysdatetime"},
                    data: {$first: "$$ROOT"}
                }
            },
            {$sort: {_id: -1}}
        ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = [];
            for (var i = 0; i < objects.length; i++) {
                    data.push({
                        kWh: parseInt(objects[i]['data']['kWh_a']),
                        W: objects[i]['data']['kW_a'].toFixed(3) * 1000,
                        TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                    });
            }
            data.sort(function (a, b) {
                return b.kWh - a.kWh;
            });
            socket.emit('factory_chart_status', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Factory - Trend Chart
        var data = [];
        var tmp = [];
        db.collection('MeterInformation').aggregate([{$match: {Type:'Power'}},
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$sysdatetime"},
                        "dayOfYear": {"$dayOfYear": "$sysdatetime"},
                        "interval": {
                            "$subtract": [
                                {"$hour": "$sysdatetime"},
                                {"$mod": [{"$hour": "$sysdatetime"}, 1]}
                            ]
                        }
                    },
                    datetime: {"$first": "$sysdatetime"},
                    data: {$first: "$$ROOT"}
                }
            },
            {$sort: {_id: -1}}, {$limit: 20}
        ], {allowDiskUse: true}).toArray(function (mongoError, objects) {
            for (var i = 0; i < objects.length; i++) {
                data.push({
                    kWh: objects[i]['data']['kWh_a'],
                    TIME: date.format(objects[i]['data']['sysdatetime'], 'MM-DD HH:mm')
                });
            }
            data.sort(function (a, b) {
                return a.kWh - b.kWh;
            });
            for (var i = 1; i < data.length; i++) {
                tmp.push({
                    kWh: data[i]['kWh'] - data[i - 1]['kWh'],
                    TIME: data[i]['TIME']
                });
            }
            socket.emit('factory_chart_trend', tmp);
            db.close();
        });
    });

     mongodb.connect(url, function (err, db) {
        if(err)throw err;
        //todo: Init ErrorEvent Data
        db.collection('Record').find().toArray(function (mongoError, objects) {
            if(mongoError)throw mongoError;
            error_count = objects.length;
            var data = [];
            for(var i=0;i<objects.length;i++){
                data.push({
                    ID:i+1,
                    SETPV: objects[i]['SetProductionVolume'],
                    NOWPV: objects[i]['NowProductionVolume'] + 1,
                    FAIL: objects[i]['Fail'],
                    V: objects[i]['V_a'].toFixed(2),
                    I: objects[i]['I_a'].toFixed(2),
                    KW: objects[i]['kW_a'].toFixed(3) * 1000,
                    kWh: objects[i]['kWh_a'].toFixed(2),
                    RH: objects[i]['RH'].toFixed(2),
                    TEMP: objects[i]['Temp'].toFixed(2),
                    SETTEMP: objects[i]['SetTemp'],
                    TIME: date.format(objects[i]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                });
            }
            socket.emit('RecordInit', data);
            socket.emit('factory_chart_rt', data);
            db.close();
        });
    });


}

function Update(){
    mongodb.connect(url, function(err, db){
        //todo: Update Data
        db.collection('MeterInformation').find({Type:'Power'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                V: objects[0]['V_a'],
                I: objects[0]['I_a'],
                KWH: objects[0]['kWh_a'],
                KW: objects[0]['kW_a'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_update', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Update TempRH Data
        db.collection('MeterInformation').find({Type:'TempRH'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                HR: objects[0]['RH'],
                TEMP: objects[0]['Temp'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Tempu', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Update TPD Data
        db.collection('MeterInformation').find({Type:'TPDData'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                SETPV: objects[0]['SetProductionVolume'],
                NOWPV: objects[0]['NowProductionVolume'],
                PSTAT: objects[0]['ProductionVolumeStatus'],
                EA: objects[0]['ExcutingAnOrder'],
                ERROR: objects[0]['ErrorCode'],
                SETTEMP: objects[0]['SetWarningTemp'],
                NOF: objects[0]['NumberOfFailures'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_TPD', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Update Shock Data
        db.collection('MeterInformation').find({Type:'Shock'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            if(objects[0]['Shock']){
                var data={
                    ID: objects[0]['Shock'],
                    TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                };
                socket.emit('shock', data);
            }
            console.log(objects[0]['Shock']);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Update Motor Data
        db.collection('MeterInformation').find({Type:'Motor'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                MotorA: objects[0]['D1_Motor'],
                MotorB: objects[0]['D2_Motor'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Motor', data);
            db.close();
        });
    });
    mongodb.connect(url, function(err, db){
        //todo: Init WarningLight Data
        db.collection('MeterInformation').find({Type:'WarningLight'}).sort({_id: -1}).limit(1).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            var data = {
                A_R: objects[0]['D1_LED_RED'],
                A_Y: objects[0]['D1_LED_Yellow'],
                A_G: objects[0]['D1_LED_Green'],
                B_R: objects[0]['D2_LED_RED'],
                B_Y: objects[0]['D2_LED_Yellow'],
                B_G: objects[0]['D2_LED_Green'],
                TIME: date.format(objects[0]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
            };
            socket.emit('factory_Light', data);
            db.close();
        });
    });

    mongodb.connect(url, function (err, db) {
        if(err)console.log(err);
        //todo: Update ErrorEvent Data
        db.collection('Record').find().sort({_id:-1}).toArray(function (mongoError, objects) {
            if (mongoError) throw mongoError;
            if (objects.length > error_count) {
                var data = [];
                for(var i=objects.length - error_count - 1;i>=0;i--){
                    data.push({
                        ID: error_count + i + 1,
                        SETPV: objects[i]['SetProductionVolume'],
                        NOWPV: objects[i]['NowProductionVolume'] + 1,
                        FAIL: objects[i]['Fail'],
                        V: objects[i]['V_a'].toFixed(2),
                        I: objects[i]['I_a'].toFixed(2),
                        KW: objects[i]['kW_a'].toFixed(3) * 1000,
                        kWh: objects[i]['kWh_a'].toFixed(3),
                        RH: objects[i]['RH'].toFixed(2),
                        TEMP: objects[i]['Temp'].toFixed(2),
                        SETTEMP: objects[i]['SetTemp'],
                        TIME: date.format(objects[i]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                    });
                    if(objects[i]['Fail']){
                        var Failed = {
                            ID: error_count + i + 1,
                            TIME: date.format(objects[i]['sysdatetime'], 'YYYY-MM-DD HH:mm:ss')
                        };
                        socket.emit('FailedPD', Failed);
                    }
                }
                socket.emit('RecordUpdate', data);
                socket.emit('factory_chart_data', data);
                error_count = objects.length;
            }
            db.close();
        });
    });
}

app.use('/', route);
//Start the server
app.listen(port);
//console.log('Big5-API is listening on port ' + port + "<-- Unused");

var io = require('socket.io');

var mqtt = require('mqtt');
var opt = {
    port: 1883,
    clientId: 'nodejs',
    username: 'icpsi',
    password: '59209167'
};

var client = mqtt.connect('tcp://192.168.101.30', opt);

client.on('connect', function () {
    console.log('Connected to MQTT Server.');
});
var socket = io.listen(10000);
socket.sockets.on('connection', function (socket) {
    console.log('Socket Client Connected.');
    socket.on('TESTMode', function(data){
        console.log('TEST Mode ' + data);
        if(data == 'OFF'){
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'OFF');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'OFF');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/MOTOR1', 'OFF');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/MOTOR2', 'OFF');
            setTimeout(function(){
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST', 'OFF');
            }, 1000);
        }else{
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST', 'ON');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'R_ON');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'Y_OFF');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'G_OFF');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'R_ON');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'Y_OFF');
            client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'G_OFF');
        }
    });

    socket.on('MotorA',function (data) {
        client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/MOTOR1', data);
        console.log('A 機台 -> ' + data);
    });

    socket.on('MotorB',function (data) {
        client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/MOTOR2', data);
        console.log('B 機台 -> ' + data);
    });

    socket.on('LightChangeA', function (data) {
        switch(data){
            case 1:
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'R_ON');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'Y_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'G_OFF');
                console.log('A 機台 -> 紅');
                break;
            case 2:
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'R_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'Y_ON');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'G_OFF');
                console.log('A 機台 -> 黃');
                break;
            case 3:
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'R_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'Y_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight1', 'G_ON');
                console.log('A 機台 -> 綠');
                break;
        }
    });

    socket.on('LightChangeB', function (data) {
        switch(data){
            case 1:
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'R_ON');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'Y_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'G_OFF');
                console.log('B 機台 -> 紅');
                break;
            case 2:
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'R_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'Y_ON');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'G_OFF');
                console.log('B 機台 -> 黃');
                break;
            case 3:
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'R_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'Y_OFF');
                client.publish('ICPSI/DemoBOX/FactoryV3/Mode/TEST/WarningLight2', 'G_ON');
                console.log('B 機台 -> 綠');
                break;
        }
    });

    socket.on('done', function (room) {
        Init(room);
        if(!oldInterval){
            oldInterval = setInterval(function(){Update(room);}, 1000);
            updateroom = room;
            console.log('Done.');
        }
    });
});
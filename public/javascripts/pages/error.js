//<![CDATA[

'use strict';
var table=$('#example_demo').DataTable({"dom":"<'row'<'col-md-5 col-sm-12'l><'col-md-7 col-sm-12'f>r><'table-responsive't><'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>"});
var $example_demo=$('#example_demo tbody');
$example_demo.on('mouseenter','td',function(){
    var colIdx=table.cell(this).index().column;
    $(table.cells().nodes()).removeClass('highlight');
    $(table.column(colIdx).nodes()).addClass('highlight');
    return false;
});
$example_demo.on('mouseleave','td',function(){
    $(table.cells().nodes()).removeClass('highlight');
    return false;
});
$example_demo.on('click','tr',function(){
    $(this).toggleClass('selected');$('#del_button').on('click',function(){
        table.row('#example_demo tbody .selected').remove().draw(false);
        return false;
    });
    return false;
});
$(".dataTables_wrapper").removeClass("form-inline");$(".dataTables_paginate .pagination").addClass("float-right");

$(document).ready(function () {
    var tabledata = [];
    var done = false;
    socket.emit('done', 0);


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

    socket.on('RecordInit', function (data) {
        if(!done) {
            for (var i = 0; i < data.length; i++) {
                var status = '良品';
                if (data[i]['FAIL']) {
                    status = '不良品';
                }
                tabledata.push([data[i]['ID'], data[i]['SETPV'], data[i]['NOWPV'], status,
                    data[i]['V'], data[i]['I'], data[i]['KW'], data[i]['RH'], data[i]['TEMP'],
                    data[i]['SETTEMP'], data[i]['TIME']]);
            }
            for (var i = 0; i < data.length; i++) {
                table.row.add(tabledata[i]).draw(false);
            }
            done = true;
        }
    });

    socket.on('RecordUpdate', function (data) {
        var update = [];
        for (var i = 0; i < data.length; i++) {
            var status = '良品';
            if (data[i]['FAIL']) {
                status = '不良品';
            }
            update.push([data[i]['ID'], data[i]['SETPV'], data[i]['NOWPV'], status,
                data[i]['V'], data[i]['I'], data[i]['KW'], data[i]['RH'], data[i]['TEMP'],
                data[i]['SETTEMP'], data[i]['TIME']]);
        }
        for(var i=0;i<data.length;i++){
            table.row.add(update[i]).draw(false);
        }
    });
});

//]]>
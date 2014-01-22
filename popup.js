/*The MIT License (MIT)

Copyright (c) 2014 Marvin Oßwald

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/
// pyLCEX Popup JS
// by Marvin Oßwald
    var db = new Object();
    chrome.runtime.sendMessage({greeting: 'db'},function(response){
      db = response.db;

      if (db){
        activeserver = db["general"].activeserver;
        initserverlist();
        currentDownloads();
        updateserverstatus();


      }else{
        console.log("Edit Settings");
        changeView("serverSettings");
      }
    });



// Global Variables -----------
  var activediv = "currentDownloads";
  var queueexe = true;
  var collectorexe = true;
  var activeserver = 0;
//-----------------------------
  $("#serverSettings").hide();
  $("#settings").hide();
  $("#info").hide();


  $(".menu").click(function(event){
      var target = $(event.target);
      var show = target.attr('target');
      changeView(show);
  });
  function changeView(show){
    $('#' + activediv).hide();
    $('#' + show).show();
    activediv = show;

    switch (show){
      case 'serverSettings':
        serverSettingsView();
        break;
      case 'settings':
        settingsView();
        break;
      case 'queue':
        if (queueexe){
        queueView();
        }
        break;
      case 'currentDownloads':
        updatecurrentdownloads();
        break;
      case 'collector':
        if (collectorexe){
          collectorView();
        }
        break;
    }
  }


  function currentDownloads (){

    $.get(db[activeserver].server + '/api/statusDownloads',function(data){
      console.log("statusDownloads",data);
      console.log("db[]",db);
      for (var i = 0; i < data.length; i++){

        if (data[i].percent < 33){
            var barcolor = 'danger';
        }else if (data[i].percent < 66){
            var barcolor = 'warning';
        }else{
            var barcolor = 'success';
        }
        var name = data[i].name
        if (!db['general'].fullFilenames && name.indexOf("part") > 0){
          var start = name.indexOf("part");
          var end = name.indexOf(".", start);
          var bettername = name.slice(start,end);
        }else{
          var bettername = name;
        }
        var packageName = data[i].packageName
        if (packageName.length > 30){
          var bettepackageName = packageName.slice(0,30);

          var betterpackageName = bettepackageName + '...';
        }else{
          var betterpackageName = packageName;
        }
        $("#currentDownloads").append('<div id="'+data[i].fid*1000+'" class="activeFile"><span class="label label-info">'+betterpackageName+'</span><p class="muted pull-right">'+bettername+'<p><div class="progress progress-'+barcolor+' progress-striped active "><div id="'+data[i].fid+'" class="bar" data-percentage="'+data[i].percent+'"></div></div><div class="hiddendel"><button class="cancel btn btn-mini btn-danger" type="button">Cancel</button></div></div>');
      }
      if (data.length == 0){
        $("#currentDownloads").append('<p class="warning"> There are no active Downloads..</p>');
      }
      $('.progress .bar').progressbar({
        display_text: 2
      });
    });
    updatecurrentdownloads();
  }

  function serverSettingsView(){
    if (db[1]){
      var serveramount = 0;
      for(var key in db){
        serveramount++;
      }
      for(var i = 1; i < serveramount; i++){
        $("#servernav").prepend('<li class=""><a data-target="#'+i+'" data-toggle="tab" id="btn_server'+i+'">'+db[i].servername+'</a>');
        $("#settingstabs").append('<div class="tab-pane" id="'+i+'"><select class="span12" id="'+i+'inputProtocol"><option value="http" selected="selected">HTTP</option><option value="https">HTTPS</option></select><input class="span12" type="text" id="'+i+'inputServer" placeholder="Server (IP / name)"><input class="span12" type="text" id="'+i+'inputPort" placeholder="port (8000)"><input class="span12" type="text" id="'+i+'inputName" placeholder="name"><input class="span12" type="password" id="'+i+'inputPassword" placeholder="Password"><input class="span12" type="text" id="'+i+'inputServername" placeholder="4 letters as Servername"><br><button id="saveSettings" serverid="'+i+'" class="btn btn-large btn-block btn-primary" type="button">Save</button><button id="deleteServer" serverid="'+i+'" class="btn btn-large btn-block btn-danger" type="button">Delete</button></div>');
        $("#"+i+"inputProtocol").filter(function(){
        return $(this).val() == db[i].protocol;
        }).prop('selected', true);
        $("#"+i+"inputServer").prop('value',db[i].host);
        $("#"+i+"inputPort").prop('value',db[i].port);
        $("#"+i+"inputName").prop('value',db[i].user);
        $("#"+i+"inputPassword").prop('value',db[i].password);
        $("#"+i+"inputServername").prop('value',db[i].servername);
      }
    }else{
      console.log("no server entries found");
    }

  }

  function settingsView(){
    $("#inputFullFilenames").prop('checked',db["general"].fullFilenames);
    $("#inputCaptchaService").prop('checked',db["general"].captchaService);
  }

  function queueView(){
    queueexe = false;
    $.get(db[activeserver].server + '/api/getQueue', function(data){
      console.log(data);
      for (var i = 0; i < data.length; i++){

        var name = data[i].name
        if (name.length > 20){
          var betteName = name.slice(0,18);
          var betterName = betteName + '...';
        }else{
          var betterName = name;
        }

        $("#queue").append('<div id="'+data[i].pid+'" class="packages"><span class="label label-info pname">'+betterName+'</span><p class="muted pull-right">'+bytesToSize(data[i].sizedone,2)+' | '+bytesToSize(data[i].sizetotal,2)+'<i class="icon-remove-sign deletePackage"></i><p><div class="progress progress-info progress-striped "><div class="bar" data-amount-part="'+data[i].linksdone+'" data-amount-total="'+data[i].linkstotal+'"></div></div><div class="hiddenmove"><button class="move to collector btn btn-mini btn-warning" type="button">Move Package</button></div></div>');
      }
      if (data.length == 0){
        $("#queue").append('<p class="warning"> There are no packages in queue..</p>');
      }
      $('.progress .bar').progressbar({
        display_text: 2,
        use_percentage: false,
      });
    });
  }

  function collectorView(){
    collectorexe = false;
    $.get(db[activeserver].server + '/api/getCollector', function(data){
      console.log(data);
      for (var i = 0; i < data.length; i++){

        var name = data[i].name
        if (name.length > 20){
          var betteName = name.slice(0,18);
          var betterName = betteName + '...';
        }else{
          var betterName = name;
        }

        $("#collector").append('<div id="'+data[i].pid+'" class="packages"><span class="label label-info pname">'+betterName+'</span><p class="muted pull-right">'+bytesToSize(data[i].sizetotal,2)+'<i class="icon-remove-sign deletePackage"></i><p><div class="progress progress-info progress-striped "><div class="bar" data-amount-part="'+data[i].linksdone+'" data-amount-total="'+data[i].linkstotal+'"></div></div><div class="hiddenmove"><button class="move to queue btn btn-mini btn-warning" type="button">Move Package</button></div></div>');
      }
      if (data.length == 0){
        $("#collector").append('<p class="warning"> There are no packages in Collector..</p>');
      }
      $('.progress .bar').progressbar({
        display_text: 2,
        use_percentage: false,
      });
    });
  }

  function bytesToSize(bytes, precision){
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;

    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' B';

    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KB';

    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MB';

    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GB';

    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB';

    } else {
        return bytes + ' B';
    }
  }

  var chpackagename ='';
  $("body").on("dblclick",".pname",function(event){
    var target = $(event.target);
    var val = $(event.target).text();
    var pid = $(event.target).parent().attr('id');
    chpackagename = $(target).replaceWith('<input id="'+pid+'" type="text" class="newname" value="'+val+'"></input>');
    $("#"+pid+" input")[0].focus();
  });

  $("body").on('keydown','.newname',function(event){
    if (event.which == 13){
      //console.log("Enter");

      var pid = $('.newname').attr('id');
      var name = $('.newname').val();
      var namen = "'"+name+"'";

      $.post(db[activeserver].server + '/api/setPackageName',{
        pid: pid,
        name: namen
      },function(data){
          if (data){
            $('.newname').replaceWith('<span class="label label-info pname">'+name+'</span>');
          }else{
            $('.newname').replaceWith(chpackagename);
          }
          chpackagename = '';
      });


    }else if(event.which == 27){
      //console.log("ESC");
      event.preventDefault();
      $('.newname').replaceWith(chpackagename);
      chpackagename = '';

    }
  });


  $("body").on('click','#saveSettings',function(event){
    var id = $(event.target).attr('serverid');
    console.group("Server Eingaben");
    console.log("Server ID = ", id);
    console.log('$("#inputProtocol").val()', $("#"+id+"inputProtocol").val());
    console.log('$("#inputServer").val()', $("#"+id+"inputServer").val());
    console.log('$("#inputPort").val()', $("#"+id+"inputPort").val());
    console.log('$("#inputName").val()', $("#"+id+"inputName").val());
    console.log('$("#inputPassword").val()', $("#"+id+"inputPassword").val());
    console.log('$("#inputServername").val()', $("#"+id+"inputServername").val());
    console.groupEnd();
    updatedb(id,$("#"+id+"inputProtocol").val(),$("#"+id+"inputServer").val(),$("#"+id+"inputPort").val(),$("#"+id+"inputName").val(),$("#"+id+"inputPassword").val(),$("#"+id+"inputServername").val());
  });

  $("body").on('click','.deletePackage',function(event){
    var id = $(event.target).parent().parent().attr('id');
    var target = $(event.target).parent().parent().fadeOut('slow');
    console.log("Package ID",id);
    var pid = "'"+id+"',";
    $.post(db[activeserver].server + '/api/deletePackages',{
      pids: pid
    },function(data){
      console.log("Package "+id+" deleted.")
      console.log(data);
    });

  });

  function updatedb(id,protocol,host,port,user,password,servername){
        db[id] = new Object;
        db[id]["id"] = id;
        db[id]["server"] = protocol + "://" + host +":"+ port;
        db[id]["host"] = host;
        db[id]["port"] = port;
        db[id]["protocol"] = protocol;
        db[id]["user"] = user;
        db[id]["password"] = password;
        db[id]["servername"] = servername;
    savedb();
    console.log("DB",db);
  }
  function savedb(){
    chrome.storage.local.set({'db': db},function(data){
      chrome.runtime.sendMessage({greeting: 'refreshdb'},function(response){
        //Refresh DB
      });
    });
    window.close();
  }

  $("body").on('click','#deleteServer',function(event){
    console.group("Delete Server");
    var id = parseInt($(event.target).attr('serverid'));
    var serveramount = 0;
    for(var key in db){
      serveramount++;
    }
    console.log("Serveramount: ", serveramount);
    console.log("Server to delete", id);
    if (id == serveramount - 1){
      delete db[id];
      console.log("Delete Server (Without): ", id);
    }
    else{
      delete db[id];
      console.log("Delete Server (With): ", id);
      for (var i = id; i < serveramount - 1; i++){
        var from = i + 1;
        db[i] = db[from];
        console.log("Transfer Server: ",from);
        console.log("To --> : ", i);
        db[i]["id"] = i;
        delete db[from];
        console.log("Delete empty Server: ", from);
      }
    }
    db["general"].activeserver = 1;
    savedb();
    console.groupEnd();
  });
/*    chrome.storage.local.get(wtg,function(r){
      console.log('User', r.user_0);
      console.log('Passwort', r.password_0);
    });
  });*/

// Add a New Server
  $("#btn_addserver").click(function(event){
    if (db){
      var serveramount = 0;
      for(var key in db){
        serveramount++;
      }
      var serverid = serveramount;
    }else{
      var serverid = 0;
    }
    $("#settingstabs").append('<div class="tab-pane" id="'+serverid+'"><select class="span12" id="'+serverid+'inputProtocol"><option value="http" selected="selected">HTTP</option><option value="https">HTTPS</option></select><input class="span12" type="text" id="'+serverid+'inputServer" placeholder="Server (IP / name)"><input class="span12" type="text" id="'+serverid+'inputPort" placeholder="port (8000)"><input class="span12" type="text" id="'+serverid+'inputName" placeholder="name"><input class="span12" type="password" id="'+serverid+'inputPassword" placeholder="Password"><input class="span12" type="text" id="'+serverid+'inputServername" placeholder="4 letters as Servername"><br><button id="saveSettings" serverid="'+serverid+'" class="btn btn-large btn-block btn-primary" type="button">Save</button></div>');
    $("#servernav").prepend('<li class=""><a data-target="#'+serverid+'" data-toggle="tab" id="btn_server'+serverid+'">Serv '+serverid+'</a>');
    $("#btn_server"+serverid).tab('show');
    console.log("Created new Server, ID = ",serverid);
  });

  $("body").on('click','.cancel',function(event){
    var target = $(event.target).parent().parent();
    target.hide();
    var fid= '['+target.attr('id') / 1000+',]';
    console.log("fid",fid);

    $.post(db[activeserver].server + '/api/stopDownloads',{
      fids: fid
    },function(data){
      console.log(data);
    });
  });

  $("body").on('click','.move',function(event){
    var toqueue = $(event.target).hasClass('queue');

    console.log("toqueue",toqueue);
    if (toqueue){
      var des = 1;
    }else{
      var des = 0;
    }
    var target = $(event.target).parent().parent();
    target.hide();
    var pid= target.attr('id');
    console.log("PID", pid);
    $.post(db[activeserver].server + '/api/movePackage',{
      destination: des,
      pid: pid
    },function(data){
      console.log(data);
    });
  });

function updategeneralsettings(fullFilenames,captchaService){
      db["general"]["fullFilenames"] = fullFilenames;
      db["general"]["captchaService"] = captchaService;
  savedb();
  console.log("DB",db);
}

  $("#saveGeneralSettings").click(function(event){
    console.log("inputFullFilenames", $("#inputFullFilenames").prop("checked"));
    console.log("inputCaptchaService", $("#inputCaptchaService").prop("checked"));

    updategeneralsettings($("#inputFullFilenames").prop("checked"),$("#inputCaptchaService").prop("checked"));

  });


 var chspeed = '';
  $("#speed").dblclick(function(event){
    var target = $(event.target);
    var val = $(event.target).text();
    chspeed = $(target).replaceWith('<input style="width: 50px; margin-left: 0px;" type="text" class="newspeed" value="'+val+'"></input>');
    $(".newspeed").focus();
  });

  $("#pause").click(function(event){
    $.get(db[activeserver].server + '/api/pauseServer', function(data){
      console.log('Server paused');
    });
  });
  $("#start").click(function(event){
    $.get(db[activeserver].server + '/api/unpauseServer', function(data){
      console.log('Server continued');
    });
  });
  $("#stop").click(function(event){
    $.get(db[activeserver].server + '/api/stopAllDownloads', function(data){
      console.log('All running Downloads stopped');
    });
  });

  $('.tool').tooltip({
    trigger: 'hover',
  });
  $('.tooli').tooltip({
    trigger: 'hover',
    placement: 'right',
  });




  function updatecurrentdownloads(){

    var repeat = self.setInterval(function(){
      if (activediv == 'currentDownloads'){
        $.get(db[activeserver].server + '/api/statusDownloads',function(data){
          for (var i = 0; i < data.length; i++){
            $("#currentDownloads").find('#'+data[i].fid).attr('data-percentage',data[i].percent);
            console.log(data[i].fid + ':' + data[i].percent);
          }
          $('.progress .bar').progressbar({
            display_text: 2
          });
        });
      }else{
        repeat = window.clearInterval(repeat);
      }
    },3000);
  }

  function updateserverstatus(){
    update();
    var repeat2 = self.setInterval(function(){
          update();
    },5000);
    function update(){
            $.get(db[activeserver].server + '/api/statusServer',function(data){
        $("#speed").html('<i class="icon-arrow-down icon-white"></i>'+(data.speed / 1000).toFixed(2) +" kb/s");
        if(data.download){
          $("#download").addClass('badge-success');
        }else{
          $("#download").addClass('badge-important');
        }
        if(data.reconnect){
          $("#reconnect").addClass('badge-success');
        }else{
          $("#reconnect").addClass('badge-important');
        }
        if(data.pause){
          chrome.browserAction.setIcon({path:"img/icons/icon_pause.png"});
          $("#pause").addClass("active");
          $("#start").removeClass("active");
        }else{
          chrome.browserAction.setIcon({path:"img/icons/icon_run.png"});
          $("#start").addClass("active");
          $("#pause").removeClass("active");
        }
        if (!data.collector){
          var datacol = '0';
        }else{
          var datacol = data.collector;
        }
        $("#overview").text(data.active+' | '+datacol+' | '+data.total);
      });
    }
  }

  function initserverlist(){
    var serveramount = 0;
    for(var key in db){
      serveramount++;
    }
    console.log("Serveramount", serveramount);
    if(serveramount == 2){
      $("#btn_serverlist").addClass("disabled");
    }else{
      for(var i = 1; i < serveramount; i++){
            $("#serverlist").append('<li><a class="selectserver" tabindex="-1" target="'+db[i].id+'">'+db[i].servername+'</a></li>');
      }
    }
  }

  $("body").on('click','.selectserver',function(event){
    var target = $(event.target);
    var servertoactivate = target.attr('target');
    db["general"]["activeserver"] = servertoactivate;
    savedb();
  });


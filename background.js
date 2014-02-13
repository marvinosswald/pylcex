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
// pyLCEX Background JS
// by Marvin Oßwald
// --------DB--------DB--------DB--------DB-------DB----
  var db = {};
    getdb();
  var serveronline = false;

  var serverofflinemsg = {
    type: "basic",
    title: "Server offline !",
    message: 'Please check you configuration and make sure your pyload Server is online.',
    iconUrl: "img/icons/icon_64.png"
  }

  function getdb(){
    chrome.storage.local.get('db',function(r){
      console.log("THE R",r);
      if (r["db"]){
        db = r["db"];
      }else{
        console.log("Created clear DB!");
        db.general = new Object();
        db.general["activeserver"] = 1;
        db.general["fullFilenames"] = 1;
        db.general["captchaService"] = 1;
        savedb();

          chrome.windows.create({
            url: 'http://www.pylcex.de',
            type: 'normal',
            focused: true
          },function(window){
            console.log(window.id);

          });
      }

      console.log("DB",db);

      if(db){
        var details = {};
        details.text = db[db.general.activeserver].servername;
        chrome.browserAction.setBadgeText(details);
        getsession();
        assingcontextMenu();
      }else{
        console.error("Edit Settings");
      }
    });
  }

  function savedb(){
    chrome.storage.local.set({'db': db},function(data){
      chrome.runtime.sendMessage({greeting: 'refreshdb'},function(response){
        //Refresh DB
      });
    });
  }
//------------------------------------------------------
function getsession(){
  try{
    $.post(db[db.general.activeserver].server + '/api/login',{
            username: db[db.general.activeserver].user,
            password: db[db.general.activeserver].password
        }, function(data){

            if (data){
              console.log("Got Session ! :)");
              serveronline = true;

              if (db.general.captchaService){
              checkfornewcaptchas();
              }

              console.log("Captcha Service started !");
            }else{
              console.error('Wrong Login Data');

            }
    });
  }catch(e){
    console.error("Wrong Server Data");
    console.error(e);

  }
}

var addfile = function(e){
  if(e.menuItemId == "addtoqueue" || e.menuItemId == "addtocollector"){
  console.log("Target: ", e.menuItemId);
    var destination = e.menuItemId;
    var destinationServer = 1;
  }else{
    console.log("Target Server: ", e.menuItemId);
    console.log("Target: ",e.parentMenuItemId);
    var destination = e.parentMenuItemId;
    if (e.menuItemId > 1000) {
      var destinationServer = e.menuItemId / 2000;
    } else{
      var destinationServer = e.menuItemId;
    };
  };
  var opt = {
    type: "basic",
    title: "Add File",
    message: destination + " of " + db[destinationServer].servername,
    iconUrl: "img/icons/icon_64.png"
  };

  if (e.linkUrl && !e.selectionText){
    console.group("Single Link");
    console.log("e.linkUrl", e.linkUrl);
    urls = [];
    urls.push(encodeURIComponent(e.linkUrl));

    console.log("url", urls);
    console.groupEnd();
  }else{
    console.group("Multiple Links");
    console.log("Selection", e.selectionText);

    urls = e.selectionText.split(" ");
    for (var i = 0; i < urls.length;i++){
      if(urls[i].indexOf("http") < 0){
        console.log("Something not link like found");
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          chrome.tabs.sendMessage(tabs[0].id, {greeting: "openmodal", urls: urls}, function(response) {
            console.log(response.farewell);
          });
        });
        break;
      }
    }
    console.log("URLS", urls);
    console.groupEnd();
  }

  chrome.notifications.create('',opt,function(id){
    if (destination == "addtocollector"){
      var dest = 0;
    }else{
      var dest = 1;
    }
    addtoserver(destinationServer,dest,JSON.stringify(urls));
  });

};

function assingcontextMenu(){
  console.log("Assing Context Menus");
  chrome.contextMenus.create({
    "id": "addtoqueue",
    "title": "add to Queue",
    "contexts": ["link","selection"],
    "onclick" : addfile
  });
  chrome.contextMenus.create({
    "id": "addtocollector",
    "title": "add to Collector",
    "contexts": ["link","selection"],
    "onclick" : addfile
  });
  if(db){
    var serveramount = 0;
    for(var key in db){
      serveramount++;
    }
    if(serveramount != 2){
      for(var i = 1; i < serveramount;i++){
        chrome.contextMenus.create({
          "id": i,
          "title": db[i].servername,
          "contexts": ["link","selection"],
          "onclick" : addfile,
          "parentId": "addtoqueue"
        });
        chrome.contextMenus.create({
          "id": i* 2000,
          "title": db[i].servername,
          "contexts": ["link","selection"],
          "onclick" : addfile,
          "parentId": "addtocollector"
        });
      }
    }
  }
}


chrome.omnibox.onInputEntered.addListener(function(text) {
   var opt = {
    type: "basic",
    title: "Add File",
    message: db[db.general.activeserver].servername,
    iconUrl: "img/icons/icon_64.png",
    buttons: [{title: "Add to Collector"},
              {title: "Add to Queue"}]
  }
  if (serveronline){
      chrome.notifications.create('',opt,function(id){});

      chrome.notifications.onButtonClicked.addListener(function(id,btnIndex){
        var url = '"' + encodeURIComponent(text) + '",';
        console.log("btnIndex",btnIndex);
          addtoserver(db[db.general.activeserver].id,btnIndex,url);
      });
  }else{
      chrome.notifications.create('',serverofflinemsg,function(id){});
  }

});

function addtoserver(destinationServer,destination,url){
    $.post(db[destinationServer].server + '/api/generateAndAddPackages',{
      links: url,
      dest: destination
    },function(data){
    });

}

//Captcha Service ##############################################################
var width = 311;
var height = 140;

function checkfornewcaptchas(){
	hasCaptchasWaiting( performCaptchaTask, checkfornewcaptchas );
}

function hasCaptchasWaiting( cbIfTrue, cbIfFalse ) {
	$.get(db[db.general.activeserver].server + '/api/isCaptchaWaiting',function(data){
    console.log(data);
		if( data === true ) {
      console.log('A Captcha is waiting...');
			cbIfTrue();
		} else {
			// wait 2000 ms to the next query
			setTimeout(cbIfFalse, 2000);
		}
	});
}

var openWindowId = chrome.windows.WINDOW_ID_NONE;
// before opening any windows, make sure we keep track of them
chrome.windows.onRemoved.addListener(function(windowId) {
  if(windowId === openWindowId) {
    openWindowId = null;
    // restart the loop
    checkfornewcaptchas();
  }
});

function performCaptchaTask() {
	// get the captcha task id, then open the captcha window
	$.get(db[db.general.activeserver].server + '/api/getCaptchaTask', function(data){

		if( !data || !data.tid ) {
			// okay, something went wrong, we dont have a task id. restart the loop, maybe?
			checkfornewcaptchas();
		}

		var url = "captcha.html#" + data.tid;
		//   var notification = webkitNotifications.createHTMLNotification(url);
		//  notification.show();
		chrome.windows.create({
			url: url,
			width: width,
			height: height,
			type: 'popup',
			focused: true
		},function(window){
			openWindowId = window.id;
		});
	});
}


var url = '';
// Extension Communication---------------------------------------------------
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.greeting) {
      case "db":
        sendResponse({db: db});
        break;
      case "refreshdb":
        getdb();
        break;
      case "updatedb":
        updatedb(request.greeting);
        break;
      default:
        console.log('Transmitted Container', request.container);
        var opt = {
          type: "basic",
          title: "Add DLC Container",
          message: db[db.general.activeserver].servername,
          iconUrl: "img/icons/icon_64.png",
          buttons: [{title: "Add to Collector"},
            {title: "Add to Queue"}]
        };
        chrome.notifications.create('',opt,function(id){});
        url = '"' + encodeURIComponent(request.container) + '",';
        break;
    }
});

chrome.notifications.onButtonClicked.addListener(function(id,btnIndex){
  console.log("ID",id);
  console.log("btnIndex",btnIndex);
  console.log("url", url);

  addtoserver(db[db.general.activeserver].id,btnIndex,url);

});

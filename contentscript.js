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
// Contentscript linkcrypt.ws | Linksave.in | share-links.biz | Youtube.de
//by Marvin Oßwald
console.log("Contentscript injected !");
$("body").append("<div id='modal'><div id='list'>"+
    "<input class='search' />"+
    "<span class='sort btn' data-sort='feature'>Sort type</span>"+
    "<ul class='list'>"+
    "   <li id ='loadingli'>"+
    "       <span class='feature'>Loading</span>"+
    "   </li>"+
    "</ul>"+
	"</div></div>");
$('#modal').easyModal({
	overlay : 0.4,
	overlayClose: false
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if (request.greeting == "openmodal"){



    	$("#loadingli").hide();

		var values = [];
		console.log("Values: ",values);

		$('#loadingli').hide();
		for(key in request.urls){
			var type = "Link ";
			if(request.urls[key].indexOf("http") >= 0){
				values.push({ link: request.urls[key], type: type });
			}

		}
		var options = {
			item: '<li><strong class="type"></strong><small class="link"></small></li>',
			valueNames: [ 'type', 'link' ]
		};

		var hackerList = new List('list', options, values);




    	$('#modal').trigger('openModal');
    	sendResponse({farewell: "Modal opened"});
    }

});
console.log("Modal Listener active!");
var url = location.href;
// linkcrypt.ws ----------------------------------------------------------
if(url.indexOf("linkcrypt.ws") > 0){
		console.log("Con", $("#ad_cont").children()[1].attributes[0].nodeValue);
		chrome.runtime.sendMessage({greeting: 'con', container: $("#ad_cont").children()[1].attributes[0].nodeValue});


// linksave.in -----------------------------------------------------------
}else if(url.indexOf("linksave.in") > 0){
	var repeat2 = self.setInterval(function(){
         if ($("#dlc_link")[0].attributes[0].ownerElement.href != ''){
			chrome.runtime.sendMessage({greeting: 'con', container: $("#dlc_link")[0].attributes[0].ownerElement.href});
         	repeat2 = window.clearInterval(repeat2);
         }
    },1000);
/* ncrypt.in -------------------------------------------------------------
}else if(url.indexOf("ncrypt.in") > 0){
	var indexwithhighspeed = $(".choice_hoster").children().length;
	var index = indexwithhighspeed - 1;
	var target = $(".choice_hoster").children();
	var container = {};

	for (var i = 0; i < index; i++){
		var hoster = target[i].text;
		//console.log('hoster', hoster);
		var tarcon = $("#mirror_"+i+"_container").children();
		//console.log('Tarcon', tarcon);
		var imod = i + '_'
		if(tarcon[3]){
			var dlc = tarcon[3].href;
		}else{
			var dlc = tarcon[1].href;
		}
		container[imod] = hoster;
		container[hoster] = dlc ;
	}
	container.multi = "true";

	if(tarcon[1].href != ''){
		chrome.runtime.sendMessage({greeting: 'con', container: JSON.stringify(container)});
	}*/
// share-links.biz -------------------------------------------------------
}else if(url.indexOf("share-links.biz") > 0){
	var getcf = $("#cf").children().children();
	var getimg = getcf[2].attributes[4].nodeValue;
	var doppelpunkt = getimg.indexOf(":") + 1;
	var varget = getimg.slice(doppelpunkt);
	var bwcvar = $("#download").children();
	var bwc = bwcvar[7].innerHTML;
	var first = bwc.indexOf('"') + 1;
	var last = bwc.indexOf('"',first);
	var basewebclean = bwc.slice(first,last);
	var container = eval(varget);

	console.log("Container", container);
 	chrome.runtime.sendMessage({greeting: 'con', container: container});

// youtube ---------------------------------------------------------------
}else if(url.indexOf("youtube") > 0 && url.indexOf("watch") > 0){
	console.log("haaalllooo ? ");
	var mask = $(".yt-subscription-button-disabled-mask").remove();
	var overlay = $(".yt-uix-overlay").remove();
	$(".yt-uix-button-subscription-container").append('<button class=" yt-uix-button yt-uix-button-default yt-uix-button-size-default" style="background-color: #fcfce4;">send to pyLoad</button>', mask, overlay);
}

function _get(lnk,no,type){
	var con = "http://"+basewebclean+"/get/"+type+"/"+lnk;
	return con
}
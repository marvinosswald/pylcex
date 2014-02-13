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
//captcha.js
//by Marvin Oßwald
var db = {};
chrome.runtime.sendMessage({greeting: 'db'}, function (response) {
	db = response.db;
	if (db) {
		getTask();
	} else {
		$('#wrap').append('<div id="info">Edit Settings</div>');
		console.error('edit settings');
	}
});

var tid = "";


function getTask() {
	$.get(db[db.general.activeserver].server + '/api/getCaptchaTask', function (data) {
    var type = data.type;
    var resultType = data.textual;

		tid = data.tid;

    if (type != 'gif') {
			$("#inputResult").show();
		}

		if (type === 'gif') {
      var img = $('#capimg');
      // set the image source
      img[0].src = "data:image/gif;base64," + data.data;
			img.attr('style', 'cursor:pointer');
			img.load(function () {
				var w = img.width();
				var h = img.height();
        chrome.windows.update(chrome.window.WINDOW_ID_CURRENT, {
          width: w * 2,
          height: h * 2
        });
			});
		} else {
			document.getElementById("capimg").src = "data:image/jpg;base64," + data.data;
		}
	});
}

$("#capimg").click(function (e) {
	console.log("X", e.pageX);
	console.log("Y", e.pageY);
	var respos = "'" + e.pageX + "," + e.pageY + "'";
	if (respos != '') {
		$.post(db[db.general.activeserver].server + '/api/setCaptchaResult', {
			tid: tid,
			result: respos
		}, function (data) {
			if (data) {
				window.close();
			}
		})
	}
});


$("body").keydown(function (event) {
	if (event.which == 13) {
		// ENTER
		if ($("#inputResult").val() != '') {
			$.post(db[db.general.activeserver].server + '/api/setCaptchaResult', {
				tid: tid,
				result: "'" + $("#inputResult").val() + "'"
			}, function (data) {
				console.log("Captcha Transmitted", data);
				if (data) {
					window.close();
				}
			})
		}
	} else if (event.which == 27) {
		// ESC
		event.preventDefault();
		window.close();
	}
});
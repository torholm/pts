// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function customMailtoUrl() {
  if (window.localStorage == null)
    return "";
  if (window.localStorage.customMailtoUrl == null)
    return "";
  return window.localStorage.customMailtoUrl;
}


var lol = chrome.tabs.query({'active': true, 'currentWindow': true }, function (tabs) {
   var foo = tab.url;
   console.log(foo);
});



function executeMailto(tab_id, subject, body, selection) {
  var default_handler = customMailtoUrl().length == 0;
  var ptsMailAdress = 'pts@pts.se';
  var url = lol;
  var cookies = 'test';
  // var url = uri.match(/^[\w-]+:\/*\[?([\w\.:-]+)\]?(?::\d+)?/)[1];
  var ptsSubject = 'Önskar tillsyn angående ' + url + '(LEK kap6 §18)';
  var ptsBody = 'Hej PTS!%0D%0A' +
                'Jag besväras av att ' + url + ' inte tycks följa LEK kap 6 §18. ' +
                'Här följer de kakor som ' + url + ' valt att utan samtycke lagra på ' +
                'min terminalutrustning: ' +
                '%0D%0A%0D%0A' +
                cookies + '%0D%0A%0D%0A' +
                'Så som jag har förstått är PTS tillsynsmyndighet för den här lagen. ' +
                'Jag önskar därför veta om det är så och i så fall hur ni följer upp ' +
                'sådana här ärenden.%0D%0A%0D%0A' +
                'Tacksam för svar%0D%0A';
  var action_url = "mailto:" + ptsMailAdress + "?subject="+ ptsSubject + "&body=" + ptsBody;
  console.log('Action url: ' + action_url);
   chrome.tabs.update(tab_id, { url: action_url }); 
 
	   /*
  //var action_url = "mailto:?"
  if (subject.length > 0)
        action_url += "subject=" + encodeURIComponent(subject) + "&";

  if (body.length > 0) {
    action_url += "body=" + encodeURIComponent(body);

  if (selection.length > 0) {
      action_url += encodeURIComponent("\n\n") +
         encodeURIComponent(selection);
    }
  } 

  if (!default_handler) {
    // Custom URL's (such as opening mailto in Gmail tab) should have a
    // separate tab to avoid clobbering the page you are on.
    var custom_url = customMailtoUrl();
    action_url = custom_url.replace("%s", encodeURIComponent(action_url));
    console.log('Custom url: ' + action_url);
    chrome.tabs.create({ url: action_url });
  } else {
    // Plain vanilla mailto links open up in the same tab to prevent
    // blank tabs being left behind.
    console.log('Action url: ' + action_url);
    chrome.tabs.update(tab_id, { url: action_url });
  }  */
}

chrome.runtime.onConnect.addListener(function(port) {
  var tab = port.sender.tab;

  // This will get called by the content script we execute in
  // the tab as a result of the user pressing the browser action.
  port.onMessage.addListener(function(info) {
    var max_length = 2048;
    if (info.selection.length > max_length)
      info.selection = info.selection.substring(0, max_length);
    executeMailto(tab.id, info.title, tab.url, info.selection);
  });
});

// Called when the user clicks on the browser action icon.
chrome.browserAction.onClicked.addListener(function(tab) {
  // We can only inject scripts to find the title on pages loaded with http
  // and https so for all other pages, we don't ask for the title.
  /*if (tab.url.indexOf("http:") != 0 &&
      tab.url.indexOf("https:") != 0) {
    executeMailto(tab.id, "", tab.url, "");
  } else {
    chrome.tabs.executeScript(null, {file: "content_script.js"});
  }*/
  executeMailto(tab.id, "", tab.url, "");
});

// FIXME: proper comment here :)
// 
// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

function executeMailto(url, cookies) {
  var 
    ptsMailAdress = 'pts@pts.se',
    ptsSubject = 'Önskar tillsyn angående ' + url + '(LEK kap6 §18)',
    ptsBody = 'Hej PTS!\r\n' +
              'Jag besväras av att ' + url + ' inte tycks följa LEK kap 6 §18. ' +
              'Här följer de kakor som ' + url + ' valt att utan samtycke lagra på ' +
              'min terminalutrustning: ' +
              '\r\n\r\n' +
              cookies + '\r\n\r\n' +
              'Så som jag har förstått är PTS tillsynsmyndighet för den här lagen. ' +
              'Jag önskar därför veta om det är så och i så fall hur ni följer upp ' +
              'sådana här ärenden.\r\n\r\n' +
              'Tacksam för svar\r\n',
    action_url = "mailto:" + ptsMailAdress + "?subject="+ encodeURIComponent(ptsSubject) + "&body=" + encodeURIComponent(ptsBody);

  console.info("Cookies:\n", cookies);
  console.log('Action url: ' + action_url);
  chrome.tabs.create({ url: action_url }); 
}

setInterval(function() {
  /* Get current window */
  chrome.windows.getCurrent(function(window) {
    /* Find active and highlighted tabs in current window */
    chrome.tabs.query({
      windowId: window.id,
      active: true,
      highlighted: true
    }, function(tabs) {
      if (tabs.length === 0) {
        chrome.browserAction.setIcon({ path: "favicon-nocookie.ico" });
      }
      var tab = tabs[0];
      chrome.cookies.getAll({
        url: tab.url
      }, function(cookies) {
        if (cookies.length > 0) {
          chrome.browserAction.setIcon({ path: "favicon.ico" });
        } else {
          chrome.browserAction.setIcon({ path: "favicon-nocookie.ico" });
        }
      });
    });
  });
}, 500);

chrome.browserAction.onClicked.addListener(function(tab) {
  /* 
   * If active tab is not a website, ignore click
   */
  if (!/https?:\/\//.test(tab.url)) {
    return;
  }

  /* 
   * Get cookies of current tab 
   * */
  chrome.cookies.getAll({
    url: tab.url
  }, function(cookies) {
    /* 
     * If page has no cookies, ignore click 
     */
    if (cookies.length === 0) {
      return;
    }

    /* 
     * Send mail with cookies where cookies is a newline concatenated string containing cookie name + value, 
     * where every character in each cookie's name is changed to a star (*).
     */
    executeMailto(tab.url, cookies.map(function(cookie) {
      return cookie.name.replace(/./g, "*") + "=" + cookie.value;
    }).join("\r\n"));
  });
});

// FIXME: proper comment here :)
// 
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

function executeMailto(domain, cookies) {
  var 
    customMailTo = customMailtoUrl(),
    defaultHandler = customMailTo.length == 0,
    ptsMailAdress = 'pts@pts.se',
    ptsSubject = 'Önskar tillsyn angående ' + domain + '(LEK kap6 §18)',
    ptsBody = 'Hej PTS!\r\n' +
              'Jag besväras av att ' + domain + ' inte tycks följa LEK kap 6 §18. ' +
              'Här följer de kakor som ' + domain + ' valt att utan samtycke lagra på ' +
              'min terminalutrustning: ' +
              '\r\n\r\n' +
              cookies + '\r\n\r\n' +
              'Så som jag har förstått är PTS tillsynsmyndighet för den här lagen. ' +
              'Jag önskar därför veta om det är så och i så fall hur ni följer upp ' +
              'sådana här ärenden.\r\n\r\n' +
              'Tacksam för svar\r\n',
    actionUrl = "mailto:" + ptsMailAdress + "?subject="+ encodeURIComponent(ptsSubject) + "&body=" + encodeURIComponent(ptsBody);

  console.info("Cookies:\n", cookies);
  console.log('Action url: ' + actionUrl);

  if (!defaultHandler) {
    chrome.tabs.create({ url: customMailTo.replace("%s", encodeURIComponent(actionUrl)) });
  } else {
    chrome.tabs.create({ url: actionUrl }); 
  }
}

function activateIcon(numCookies) {
  chrome.browserAction.getTitle({}, function(title) {
    if (title === "Rapportera cookies (" + numCookies + ") till pts") return;
    chrome.browserAction.setTitle({ title: "Rapportera cookies (" + numCookies + ") till pts" });
    chrome.browserAction.setIcon({ path: "favicon.ico" });
  });
}

function deactivateIcon() {
  chrome.browserAction.getTitle({}, function(title) {
    if (title === "Inga cookies att rapportera") return;
    chrome.browserAction.setTitle({ title: "Inga cookies att rapportera" });
    chrome.browserAction.setIcon({ path: "favicon-nocookie.ico" });
  });
}

function getDomain(url) {
  var match = /^https?:\/\/([^\/]+)/.exec(url);
  return match[1];
}

setInterval(function() {
  /* Find active and highlighted tabs in current window */
  chrome.tabs.query({
    windowId: chrome.windows.WINDOW_ID_CURRENT,
    active: true,
    highlighted: true
  }, function(tabs) {
    if (tabs.length === 0) {
      deactivateIcon();
    }
    var tab = tabs[0];
    chrome.cookies.getAll({
      url: tab.url
    }, function(cookies) {
      if (cookies.length > 0) {
        activateIcon(cookies.length);
      } else {
        deactivateIcon();
      }
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
     * where every character in each cookie's value is changed to a star (*).
     */
    executeMailto(getDomain(tab.url), cookies.map(function(cookie) {
      return cookie.name + "=" + cookie.value.replace(/./g, "*");
    }).join("\r\n"));
  });
});

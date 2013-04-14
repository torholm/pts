const {Cc,Ci} = require("chrome");
const windowUtils = require("window-utils");
var widgets = require("sdk/widget");
var tabs = require("sdk/tabs");
var self = require("sdk/self");
var seCookieLawEpoch = '1309471200000';
var euCookieLawEpoch = '1261177200000';
//var seCookielaw = '2011-07-01';
//var euCookieLaw = '2009-12-19';
//
//Todo:
//
//Fix context menu on right click
// - About plugin
// - About cookies / pts
// - Copy stuff into clipboard


var widget = widgets.Widget({
 id: "mozilla-link",
 label: "Report Cookie violation",
 contentURL: self.data.url("favicon.ico"),
 contentScriptFile: self.data.url("click-listener.js"),
 onMouseover: function() {
  	var cookies = getCookies();
	if ( cookies == null ) {
		widget.tooltip = "No cookies are set.";
	} else {
		widget.tooltip = "Report Cookie violation";
	}
},
});

widget.port.on("left-click", function(){
		var url = getCurrentURL();
		//console.log('Url: ' + url);
		var cookies = getCookies();
		//no cookies set from domain
		//
		if ( cookies == null ) {
			console.log('No cookies on page.');
		} else {
		console.log('Cookies: ' + cookies);
		var date = new Date();
		var localTime = date.getTime();
		var diff =  Math.floor((localTime - seCookieLawEpoch) / 86400000);
		var eudiff = Math.floor((localTime - euCookieLawEpoch) / 86400000);
		console.log('Days since law took effect SE: ' + diff);
		console.log('Days since law took effect EU: ' + eudiff);
		var ptsMailAdress = 'pts@pts.se';
		var ptsSubject = 'Önskar tillsyn angående ' + url;
		var ptsBody = 'Hej PTS!%0D%0A\
Jag är mycket oroad över att ' + url + ' inte tycks följa LEK kap 6 §18. \
Vänligen kontrollera detta ärende snarast. Här följer information om de \
cookies som ' + url + ' valt att lagra på min terminalutrustning \
utan mitt uttryckliga samtycke.%0D%0A%0D%0A\
' + cookies + '%0D%0A%0D%0A\
Så som jag har förstått är PTS tillsynsmyndighet för den här lagen. Kan ni förklara hur ni tänker agera för att den här situationen inte ska fortgå?%0D%0A%0D%0A\
Vänliga hälsningar,%0D%0A';
	        tabs.open("mailto:" + ptsMailAdress + "?subject="+ ptsSubject + "&body=" + ptsBody );
		}
});
 
widget.port.on("right-click", function(){
	panel.show;
	//console.log("right-click");
});

function getCurrentURL(){
var windowsService = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
var currentWindow = windowsService.getMostRecentWindow('navigator:browser');
var browser = currentWindow.getBrowser();
var uri = browser.currentURI;
var url = uri.spec;
return url;
}

function getCookies(){
    var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);  
    var uri = ios.newURI(getCurrentURL(), null, null);  
    var cookieSvc = Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);  
    var cookie = cookieSvc.getCookieString(uri, null);  
    return cookie;
}

// create a panel due to jetpack not really supporting context menus for widgets
// without addition of millions of addons

var panel = require("sdk/panel").Panel({
  width: 180,
  height: 180,
  contentURL: "https://en.wikipedia.org/w/index.php?title=Jetpack&useformat=mobile"
});

/*
 * PTS rapport - Using some example code from Evegueni Naverniouk and User213 for FF toolbar buttons.
 * Thanks for making code public!
 *
 * This code is under a BSD License!
 *
 * This code is mostly written by trams, 
 * Almost all less than trivial bugfixes where done by Tor Holm (github.com/torholm).
 *
 * 
 */

const {Cc,Ci} = require("chrome");
const timers = require("timers");

var 
  menu,
  button,
  toolbarbutton = require("toolbarbutton"),
  data = require("self").data,
  widgets = require("sdk/widget"),
  tabs = require("sdk/tabs"),
  seCookieLawEpoch = '1309471200000',
  euCookieLawEpoch = '1261177200000';

function createButton(options) {
  var 
    menu = {
      id: 'ptsbutton-menu',
      position: 'after_start',
      items: [{
        id: 'ptsbutton-menu-1',
        label: 'Om DFRI',
        type: null,
        checked: false,
        onCommand: function() {     
          tabs.open("https://www.dfri.se/om-dfri/");
        }
      }, {
        id: "ptsbutton-menu-2",
        label: "Om PTS Rapport",
        type: null,
        checked: false,
        onCommand: function() {
          tabs.open("https://www.dfri.se/cookies/pts-rapport/");
        }
      }]
    },

    tb = toolbarbutton.ToolbarButton({
      id: "ptsbutton",
      label: "Rapportera till PTS",
      tooltiptext: "Rapportera till PTS",
      image: data.url("favicon.ico"),
      menu: menu,
      onCommand: function(ev) { 
          url = getCurrentURL(),
          cookies = getCookies();
 
        if (ev.target.id != "ptsbutton" || !cookies ) 
          return;

        var 
          date = new Date(),
          localTime = date.getTime(),
          diff =  Math.floor((localTime - seCookieLawEpoch) / 86400000),
          eudiff = Math.floor((localTime - euCookieLawEpoch) / 86400000),
          ptsMailAdress = 'pts@pts.se',
          ptsSubject = 'Önskar tillsyn angående ' + url + ' (LEK kap6 §18)',
          ptsBody = 'Hej PTS!%0D%0A' + 
                    'Jag besväras av att ' + url + ' inte tycks följa LEK kap 6 §18. ' + 
                    'Här följer de kakor som ' + url + ' valt att utan samtycke lagra på ' +
                    'min terminalutrustning: ' +
                    '%0D%0A%0D%0A' +
                    cookies + '%0D%0A%0D%0A' + 
                    'Så som jag har förstått är PTS tillsynsmyndighet för den här lagen. ' + 
		    'Jag önskar därför veta om det är så och i så fall hur ni följer upp ' +
		    'sådana här ärenden.%0D%0A%0D%0A' + 
                    'Tacksam för svar%0D%0A';

        console.log('Days since law took effect SE: ' + diff);
        console.log('Days since law took effect EU: ' + eudiff);

        tabs.open("mailto:" + ptsMailAdress + "?subject="+ ptsSubject + "&body=" + ptsBody );
      }
    });

  timers.setInterval(function() {
    var 
      cookies = getCookies(),
      button = tb.button();
    if (button) {
      button.setAttribute('tooltiptext', (!cookies) ? "Inga cookies att rapportera" : "Rapportera cookies till pts");
      button.setAttribute('image', (!cookies) ? data.url("favicon-nocookie.ico") : data.url("favicon.ico"));
    }
  }, 500);

  return tb;
}


exports.main = function(options) {
  button = createButton(options);

  // On install moves button into the toolbar
  if (options.loadReason == "install") {
    button.moveTo({
      toolbarID: "nav-bar",
      forceMove: false
    });
    var navbar = document.getElementById("nav-bar");
    var newset = navbar.currentSet + ",ptsbutton";
    navbar.currentSet = newset;
    navbar.setAttribute("currentset", newset );
    document.persist("nav-bar", "currentset");
  }
};


function getCurrentURL(){
  try {
    return Cc['@mozilla.org/appshell/window-mediator;1']
                    .getService(Ci.nsIWindowMediator)
                    .getMostRecentWindow('navigator:browser')
                    .getBrowser()
                    .contentDocument
                    .location
                    .host;
  } catch (err) {
    return "";
  }
}

function getCookies(){
  try {
    var cookie = Cc['@mozilla.org/appshell/window-mediator;1']
                    .getService(Ci.nsIWindowMediator)
                    .getMostRecentWindow('navigator:browser')
                    .getBrowser()
                    .contentDocument
                    .cookie;
    return cookie.replace(/(^|; )([^=]+)=([^;]*)/g, function(_, prefix, name, value) {
      return prefix + name + "=" + value.replace(/./g, "*");
    });
  } catch (err) {
    return "";
  }
}

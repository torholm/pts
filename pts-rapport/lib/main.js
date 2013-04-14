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
                    'Så som jag har förstått är PTS tillsynsmyndighet för den här lagen, ' + 
                    'har ni möjlighet att hantera det här ärendet?%0D%0A%0D%0A' + 
                    'Vänliga hälsningar,%0D%0A';

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
    }
  }, 500);

  return tb;
}


exports.main = function(options) {
  button = createButton(options);

  console.log( options );
  // On install moves button into the toolbar
  if (options.loadReason == "install") {
    button.moveTo({
      toolbarID: "addon-bar",
      forceMove: false
    });
  }
};


function getCurrentURL(){
  return Cc['@mozilla.org/appshell/window-mediator;1']
                    .getService(Ci.nsIWindowMediator)
                    .getMostRecentWindow('navigator:browser')
                    .getBrowser()
                    .contentDocument
                    .location
                    .host;
}

function getCookies(){
  return Cc['@mozilla.org/appshell/window-mediator;1']
                    .getService(Ci.nsIWindowMediator)
                    .getMostRecentWindow('navigator:browser')
                    .getBrowser()
                    .contentDocument
                    .cookie;
}

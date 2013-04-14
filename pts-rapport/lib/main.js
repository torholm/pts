/*
 * Example Code for Toolbar Button Complete by user213 (Geek in Training)
 *    modified version of Toolbar Button (with popup menu) by globex-designs
 *
 * Authors : Evgueni Naverniouk (evgueni@globexdesigns.com), user213 (GoMobileFirefox@gmail.com)
 *
 */

// just testing a modified copy (azrafe7)

const {Cc,Ci} = require("chrome");
const windowUtils = require("window-utils");
const { EventTarget } = require("sdk/event/target");
let target = EventTarget();

var 
  menu,
  t,
  button,
  toolbarbutton = require("toolbarbutton"),
  data = require("self").data,
  widgets = require("sdk/widget"),
  tabs = require("sdk/tabs"),
  self = require("sdk/self"),
  seCookieLawEpoch = '1309471200000',
  euCookieLawEpoch = '1261177200000';

function createButton(options) {
  /* Start Menu */
  var menu = {
    id: 'MyAddon-menupopup',
    position: 'after_start',
    items: [{
      id: 'MyAddon-menupopup-1',
      label: 'Om DFRI',
      type: null,
      checked: false,
      onCommand: function() {     
        tabs.open("https://www.dfri.se/om-dfri/");
      }
    }, {
      id: "MyAddon-menupopup-2",
      label: "Om PTS Rapport",
      type: null,
      checked: false,
      onCommand: function() {
        tabs.open("https://www.dfri.se/cookies/pts-rapport/");
      }
    }]
  }
  /* End Menu */

  var 
    tb = toolbarbutton.ToolbarButton({
      id: "MyAddon",
      label: "Rapportera till PTS",
      tooltiptext: "Rapportera till PTS",
      image: data.url("favicon.ico"),
      menu: menu,
      onMouseover: function() {
        var cookies = getCookies();
        if (cookies == null) {
          button.button().setAttribute('tooltiptext', "Inga cookies att rapportera");
        } else {
          button.button().setAttribute('tooltiptext', "Rapportera cookies till pts");
        }
      },
      onCommand: function(ev) {
        if (ev.target.id != "MyAddon") 
          return;

        var 
          url = getCurrentURL(),
          cookies = getCookies();
        if (cookies == null ) {
          console.log('No cookies on page.');
          return;
        }

        console.log('Url: ' + url);
        console.log('Cookies: ' + cookies);
        var 
          date = new Date(),
          localTime = date.getTime(),
          diff =  Math.floor((localTime - seCookieLawEpoch) / 86400000),
          eudiff = Math.floor((localTime - euCookieLawEpoch) / 86400000),
          ptsMailAdress = 'pts@pts.se',
          ptsSubject = 'Önskar tillsyn angående ' + url,
          ptsBody = 'Hej PTS!%0D%0A,\
Jag är mycket oroad över att ' + url + ' inte tycks följa LEK kap 6 §18. \
Vänligen kontrollera detta ärende snarast. Här följer information om de \
cookies som ' + url + ' valt att lagra på min terminalutrustning \
utan mitt uttryckliga samtycke.%0D%0A%0D%0A\
' + cookies + '%0D%0A%0D%0A\
Så som jag har förstått är PTS tillsynsmyndighet för den här lagen. Kan ni förklara hur ni tänker agera för att den här situationen inte ska fortgå?%0D%0A%0D%0A\
Vänliga hälsningar,%0D%0A';

        console.log('Days since law took effect SE: ' + diff);
        console.log('Days since law took effect EU: ' + eudiff);


        tabs.open("mailto:" + ptsMailAdress + "?subject="+ ptsSubject + "&body=" + ptsBody );
      }
    });

  var widget = widgets.Widget({
    id: "mozilla-link",
    label: "Mozilla website",
    contentURL: "http://www.mozilla.org/favicon.ico",
    onClick: function() {
      tabs.open("http://www.mozilla.org/");
    }
  });

  return tb;
}


exports.main = function(options) {
  button = createButton(options);

  // On install moves button into the toolbar
  if (options.loadReason == "install") {
    button.moveTo({
      toolbarID: "addon-bar",
      forceMove: false
    });
  }

  // Change the button's icon
  //button.button().setAttribute('image', data.url("favicon.png"));
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

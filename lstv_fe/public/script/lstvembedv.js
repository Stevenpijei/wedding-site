window.onmessage = function (e) {
    e.data.hasOwnProperty('frameHeight') &&
        (document.getElementById(e.data.frameId).style.height =
            e.data.frameHeight + 'px');
};

var randomKey = function(len) {
    var maxlen = 8,
        min = Math.pow(16,Math.min(len,maxlen)-1)
    max = Math.pow(16,Math.min(len,maxlen)) - 1,
        n   = Math.floor( Math.random() * (max-min+1) ) + min,
        r   = n.toString(16);
    while ( r.length < len ) {
        r = r + randomKey( len - maxlen );
    }
    return r;
};


var url = window.location.href;
var parent = document.currentScript.parentElement;

var iframe = document.createElement('iframe');

var withInfoBar = document.currentScript.getAttribute('infobar')
    ? document.currentScript.getAttribute('infobar')
    : "0";

var withBusinesses = document.currentScript.getAttribute('businesses')
    ? document.currentScript.getAttribute('businesses')
    : "0";

var autoPlay = document.currentScript.getAttribute('autoPlay')
    ? document.currentScript.getAttribute('autoPlay')
    : "1";

var muteOnStart = document.currentScript.getAttribute('muteonstart')
    ? document.currentScript.getAttribute('muteonstart')
    : "0";

var withLoveStory = document.currentScript.getAttribute('lovestory')
    ? document.currentScript.getAttribute('lovestory')
    : "0";

var videoId = document.currentScript.getAttribute('videoid')
    ? document.currentScript.getAttribute('videoid')
    : null;

var frameId = "lstvembed-" + randomKey(10);

var width = document.currentScript.getAttribute('width')
    ? document.currentScript.getAttribute('width')
    : "100%";


var businessLimit = document.currentScript.getAttribute('businesslimit')
    ? document.currentScript.getAttribute('businesslimit')
    : 999;


var scriptSource = document.currentScript.src;
var arr = scriptSource.split("/");
var domain = arr[0] + "//" + arr[2]


iframe.style.display = 'inline-block';
iframe.setAttribute('frameborder', '0');
iframe.src = domain +
    '/embed/video/' + videoId +
    '?businesses=' +
    withBusinesses +
    '&businesslimit=' +
    businessLimit +
    '&infobar=' +
    withInfoBar +
    '&lovestory=' +
    withLoveStory +
    '&autoplay=' +
    autoPlay +
    '&muteonstart=' +
    muteOnStart +
    '&frameid=' +
    frameId;
iframe.allow = "autoplay"
iframe.width = width;
iframe.scrolling = 'no';
iframe.style = 'border:none;width=100%';
iframe.id = frameId;
parent.appendChild(iframe);



/**
 * Created by dongwookyoon on 6/10/15.
 */

function loadRichReview(r2_ctx, env, cdn_endpoint) {
    (function(r2){
        r2.platform = 'Azure';
        r2.scroll_wrapper = document.getElementById('r2_app_page');
        r2.ctx = JSON.parse(decodeURIComponent(r2_ctx));
        r2.env = env;
        r2.cdn_endpoint = cdn_endpoint;
        warnIE();
        loadJsScript("/static_viewer/load.js", "js").then(
            function() {
                r2.loadApp(null);
            }
        );
    }(window.r2 = window.r2 || {}));
}

function warnIE(){
    var old_ie = -1; // Return value assumes failure.
    if (navigator.appName === 'Microsoft Internet Explorer')
    {
        var ua = navigator.userAgent;
        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            old_ie = parseFloat( RegExp.$1 );
    }
    var ie11 = /rv:11.0/i.test(navigator.userAgent);
    if(old_ie !== -1 || ie11 ){ // detect ie
        alert('Internet Explore is not supported. If you encounter any issue while using this tool, please consider using other browsers, such as Google Chrome, Mozilla Firefox, or Microsoft Edge.');
    }
}

var loadJsScript = function(url, type) {
    return new Promise(function(resolve, reject){
        var elem = null;
        if(type === 'js'){
            elem = document.createElement('script');
            elem.type = 'text/javascript';
            elem.src = url;
        }
        else if(type === 'css'){
            elem = document.createElement('link');
            elem.rel = 'stylesheet';
            elem.type = 'text/CSS';
            elem.href = url;
        }
        if(elem){
            elem.onreadystatechange = resolve;
            elem.onload = resolve;
            elem.onerror = function(){
                reject(new Error("Cannot load a resource file:" + url));
            };
            document.getElementsByTagName('head')[0].appendChild(elem);
        }
        else{
            reject(new Error("Cannot load a resource file:" + url));
        }
    });
};

var resizePageBody = function(){
    var win_rect = {
        width: $(this).width(),
        height: $(this).height()
    };
    var navbar_rect = $("#r2_navbar")[0].getBoundingClientRect();
    var $app_page = $("#r2_app_page");
    var $app_container = $('#r2_app_container');

    var w = win_rect.width;
    var h = win_rect.height-navbar_rect.height;

    $app_page.width(w);
    $app_page.height(h);
    $app_container.height(h);
};


$(document).ready(function () {
    resizePageBody();
});

$(window).on('resize', function(){
    resizePageBody();
});
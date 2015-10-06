/**
 * Created by dongwook on 9/22/15.
 */

var js_error = require("../lib/js_error");
var R2D = require("../lib/r2d.js");
var azure = require("../lib/azure");
var js_utils = require("../lib/js_utils");
var Promise = require("promise");

exports.get = function(req, res){
    req.session.latestUrl = req.originalUrl;
    if(req.user){
        res.render('doc', {
            cur_page: 'Doc',
            BLOB_HOST: azure.BLOB_HOST,
            HOST: js_utils.getHostname() + "/",
            user: encodeURIComponent(JSON.stringify(req.user))});
    }
    else{
        res.redirect('/login');
    }
};

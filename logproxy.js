/**
 * set up a proxy to log http archives
 * run:
 *      node logproxy [listen port] [only log host,..]
 * eg.
 * 1.start logproxy with default setting
 * node logproxy 
 * 2.listen on port 8088 and only log hosts -- 'c.163.com' and every host matchs '126.com'
 * node logproxy 8088 c.163.com,*126.com
 */
;(function(){
    var http = require('http'),
        https = require('https');
        fs = require('fs'),
        StringDecoder = require('string_decoder').StringDecoder,
        Buffer = require('buffer').Buffer,
        Iconv  = require('iconv-lite'),//https://github.com/bnoordhuis/node-iconv,https://github.com/ashtuchkin/iconv-lite
        chardet = require('chardet'),//https://github.com/unbug/node-chardet
        colors = require('colors'),
        util = require('util');
        
    //prevent node.js from crashing
    process.on('uncaughtException', function (err) {
        console.log("process uncaughtException error");
        console.error(err);
    });    
    
    var excuteArgvs = (function(){
        var p = process.argv[2] || 1630,
            f = process.argv[3]?process.argv[3].split(','):[];
        return {
            port: p,
            filterHosts: f
        }
    })();
    
    function printLog(logs){
        logs = logs || 'NULL';
        if(typeof logs == 'string'){
            console.log(logs);
        }else{
            // console.log(util.inspect(logs, { showHidden: false, depth: null,colors: true}));
            console.dir(logs);
        }
    }
    function getIPAddress() {
      var interfaces = require('os').networkInterfaces();
      for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
          var alias = iface[i];
          if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
            return alias.address;
        }
      }
      return '0.0.0.0';
    }    
    function decodeResponseBody(headers,body){
        var cs
        cs = headers['content-type'].match(/.*charset=(.*)[;]?/i);
        cs = cs && cs[1];
        if(cs){
            console.log(('Body charset is '+cs ).magenta.bold);
            if(Iconv.encodingExists(cs)){
                return Iconv.decode(new Buffer(body),cs);
            }
        }
        return autoDecodeCharset(body);
    }
    function autoDecodeCharset(data){
        if(data){
            var buffer = new Buffer(data),
                charset = chardet.detect(buffer);
            console.log(('Data charset is '+charset ).magenta.bold);
            try {
                data = buffer.toString(charset);
              } catch (e) {
                if(Iconv.encodingExists(charset)){
                    data = Iconv.decode(buffer,charset);
                }
              }
            return data;
        }
    }
    /**
     * 
     * @param {Object} log {reqMethod,reqUrl,reqHeaders,reqData,resCode,resHeaders,resBody}
     */
    var printClientLog = (function(){
        var requestCount = 0;
        return function(logs){
            if(!isFilterHost(logs.reqHeaders['host'])){return;}
            
            util.log(('--'+requestCount+'--------------------------- LOG REQUEST STARTED ---------------------------'+requestCount+'--').yellow);
            
            console.log(('METHOD '+logs.reqMethod+': ').magenta.bold+logs.reqUrl.red);
            if( (/image|audio|video|upload/ig).test(logs.resHeaders['content-type']) ){
                printLog('CONTENT TYPE: '.magenta.bold+logs.resHeaders['content-type'].red); 
            }else{
                printLog('REQUEST HEADERS: '.magenta.bold);
                printLog(logs.reqHeaders);
                printLog('REQUEST DATA: '.magenta.bold); 
                printLog(autoDecodeCharset(logs.reqData));
                printLog('RESPONSE STATUS CODE: '.magenta.bold+(logs.resCode+'').red);
                printLog('RESPONSE HEADERS: '.magenta.bold);
                printLog(logs.resHeaders);
                printLog('RESPONSE BODY: '.magenta.bold); 
                printLog( autoDecodeCharset(logs.resBody) );
            }

            util.log(('--'+requestCount+'----------------------------- LOG REQUEST END ---------------------------'+requestCount+'--').yellow);
            
            requestCount++;
        }
    })();
    /**
      * @param {Object} host
     */
    function isFilterHost(host){
        if(excuteArgvs.filterHosts.length<1 || host.length<1){
            return true;
        }
        for(var i=0;i<excuteArgvs.filterHosts.length;i++){
            if(excuteArgvs.filterHosts[i].length<1){continue;}
            if(excuteArgvs.filterHosts[i].indexOf('*')!=-1){//start with *
                var reg = new RegExp(excuteArgvs.filterHosts[i].replace('*',''),'ig');
                if(reg.test(host)){
                    return true;
                }
            }else{
                if( host == excuteArgvs.filterHosts[i] ){
                    return true;
                }                
            }
        }
        return false;
    }
    /**
     * 
     * @param {Object} request
     * @param {Object} response
     */
    function onWebServerCreate(request, response){
        util.log(('-----------------------------REQUEST STARTING HOST '+request.headers['host']+' -----------------------------').yellow);
        
        var clientOption,clientRequest,clientLog = {},sHeaders = {};
        for(var key in request.headers){
            sHeaders[key] = request.headers[key];
        }        
        sHeaders['accept-encoding'] = '';
        clientOption = {
            host: request.headers['host'],
            post: 80,
            method: request.method,
            path: request.url,
            headers: sHeaders
        }
        clientRequest = new http.ClientRequest(clientOption);
        
        clientRequest.addListener('response', function (clientResponse) {
            var body = [];
            clientResponse.addListener('data', function(chunk) {
                
                body.push(chunk);
                response.write(chunk,'binary');
            });
            clientResponse.addListener('end', function() {
                clientLog.reqMethod = request.method;
                clientLog.reqUrl = request.url;
                clientLog.reqHeaders = request.headers;        
                clientLog.resCode = clientResponse.statusCode;
                clientLog.resHeaders = clientResponse.headers;
                clientLog.resBody = body.join('');
                
                response.end();
                
                printClientLog(clientLog);
            });
            response.writeHead(clientResponse.statusCode, clientResponse.headers);
         });
        request.addListener('data', function(chunk) {
            clientLog.reqData = chunk;
            clientRequest.write(chunk,'binary');
        });
        request.addListener('end', function() {
            clientRequest.end();
        });    
        request.on('error', function (err) {
            printLog('request error');
            printLog(err);
        });        
    }
    var webServer;
    webServer = http.createServer(onWebServerCreate)
    webServer.listen(excuteArgvs.port);
    
    util.log('==================================================================='.red.bold);
    util.log('==================================================================='.red.bold);
    util.log('             PROXY IS READY ON ' +(getIPAddress()).red.bold+' PORT '+(excuteArgvs.port+'              ').red.bold);
    util.log('==================================================================='.red.bold);
    util.log('==================================================================='.red.bold);
})();

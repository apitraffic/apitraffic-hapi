
const utilities = require('@apitraffic/utilities');
const package = require('./package.json');

exports.getContext = function(){
  return utilities.context.getStore();
}

exports.getRequestManager = function(){
  return utilities.context.getStore().RequestManager;
}

exports.tag = function(key, value){
  utilities.context.getStore().RequestManager.tag(key, value);
}

exports.trace = function(content){
  utilities.context.getStore().RequestManager.trace(content);
}

exports.plugin = {
    name: 'apiTrafficPlugin',
    register: function (server, options = {
      interceptOutbound : true,
      host : "",
      token : "",
      bucket : "",
      debug: false
    }) {

      // Set things up...
      utilities.setup(options, utilities.context);

      server.ext('onRequest', (request, h) => {
        // make sure the request context is setup with the RequestManager so it can be uses anywhere in the request...
        utilities.context.enterWith({ 
          RequestManager: new utilities.RequestManager({package : {name: package.name, version : package.version}})
         });
        return h.continue;
      });     
  
      // Run before the response is sent back
      server.ext('onPostResponse', (request, h) => {

        const protocol = request.server.info.protocol;
        const host = request.info.host; // Includes hostname and port
        const path = request.url.pathname;
        const query = request.url.search; // Includes the leading '?'
        const fullUrl = `${protocol}://${host}${path}${query}`;
        
        try{
          const apiTrafficOptions = {
            version: utilities.context.getStore().RequestManager.package.version,
            sdk: utilities.context.getStore().RequestManager.package.name                    
          };
          // TODO: Account for other body types other than JSON...
          const apiTrafficPayload = {
              contextSid : utilities.context.getStore().RequestManager.contextSid,
              direction : "in",
              request: {
                  received: utilities.context.getStore().RequestManager.requestReceivedAt,
                  ip : request.info.remoteAddress,
                  url : fullUrl,
                  method: request.method.toUpperCase(),
                  headers : request.headers,
                  body : request.payload || null
              },
              response : {
                  headers : request.response.headers, 
                  status : request.response.statusCode,
                  responseTime : utilities.getDuration(utilities.context.getStore().RequestManager.requestStartTime),
                  body : request.response?.source || null
              },
              tags : utilities.context.getStore().RequestManager.getTagArray(),
              traces : utilities.context.getStore().RequestManager.getTraces()
          };
          // call the function to log all now...
          // we will not await the response b/c we want to fire and forget...
          utilities.sendToApiTraffic(apiTrafficOptions, apiTrafficPayload);
        }catch(error){
          console.error('onPostResponse Error:', error.response ? error.response.data : error.message);
        }
       
        return h.continue;
      });
    }
  };
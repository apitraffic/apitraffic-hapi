
const utilities = require('@apitraffic/utilities');
const package = require('./package.json');


exports.plugin = {
    name: 'apiTrafficPlugin',
    register: function (server, options = {
      interceptOutbound : true,
      host : "ingest.apitraffic.io",
      token : "",
      bucket : "",
      debug: false
    }) {
      


      // Set things up...
      utilities.setup(options);

      server.ext('onRequest', (request, h) => {
        request.ApiTraffic = new utilities.RequestManager();
        return h.continue;
      });     
  
      // Run before the response is sent back
      server.ext('onPostResponse', (request, h) => {

        const protocol = request.server.info.protocol;
        const host = request.info.host; // Includes hostname and port
        const path = request.url.pathname;
        const query = request.url.search; // Includes the leading '?'
        const fullUrl = `${protocol}://${host}${path}${query}`;

        const apiTrafficOptions = {
            version: package.version,
            sdk: package.name                    
        };
        // TODO: Account for other body types other than JSON...
        const apiTrafficPayload = {
            request: {
                received: request.ApiTraffic.requestReceivedAt,
                ip : request.info.remoteAddress,
                url : fullUrl,
                method: request.method.toUpperCase(),
                headers : request.headers,
                body : request.payload || null
            },
            response : {
                headers : request.response.headers, 
                status : request.response.statusCode,
                responseTime : utilities.getDuration(request.ApiTraffic.requestStartTime),
                body : request.response?.source || null
            },
            tags : request.ApiTraffic.getTagArray(),
            traces : request.ApiTraffic.getTraces()
        };
        // call the function to log all now...
        // we will not await the response b/c we want to fire and forget...
        utilities.sendToApiTraffic(apiTrafficOptions, apiTrafficPayload);
        
        return h.continue;
      });
    }
  };
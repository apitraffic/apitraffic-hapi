
const utilities = require('@apitraffic/utilities');
const package = require('./package.json');

exports.plugin = {
    name: 'apiTrafficPlugin',
    register: function (server, options = {}) {
      
      // Set things up...
      utilities.setup(options);

      server.ext('onRequest', (request, h) => {
        request.plugins.requestReceivedAt = new Date().toISOString();
        request.plugins.requestStartTime = process.hrtime();
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
            apiToken: process.env.API_TRAFFIC_TOKEN,
            bucketSid: process.env.API_TRAFFIC_BUCKET_SID,
            version: package.version,
            sdk: package.name                    
        };
        // TODO: Account for other body types other than JSON...
        const apiTrafficPayload = {
            request: {
                received: request.plugins.requestReceivedAt,
                ip : request.info.remoteAddress,
                url : fullUrl,
                method: request.method.toUpperCase(),
                headers : request.headers,
                body : JSON.stringify(request.payload) || null
            },
            response : {
                headers : request.response.headers, 
                status : request.response.statusCode,
                responseTime : utilities.getDuration(request.plugins.requestStartTime),
                size: request.response.headers['content-length'],
                body : JSON.stringify(request.response.source)
            }
        };
        // call the function to log all now...
        // we will not await the response b/c we want to fire and forget...
        utilities.sendToApiTraffic(apiTrafficOptions, apiTrafficPayload);
        
        return h.continue;
      });
    }
  };
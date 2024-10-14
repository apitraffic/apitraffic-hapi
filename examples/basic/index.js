const apiTraffic = require('@apitraffic/hapi');
const axios = require('axios');
const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 3000,
        host: 'localhost'
    });

    // register the ApiTraffic plugin...
    await server.register({
        plugin: apiTraffic,
        options: {
          token : "",
          bucket : ""
        }
      });

    // Define your routes and additional server setup here

    // Define a route for demonstration
    server.route({
      method: 'GET',
      path: '/',
      handler: async (request, h) => {

        try{
          
          // Await the response of an outbound call...
          const response = await axios.get('https://thetestrequest.com/authors');
                    
          // tag the request. You can add as many tags to a request as required.
          apiTraffic.getRequestManager().tag("accountSid", "12345");

          // add some tracing information to the request. You can add as many traces as required, think of it like console log.
          apiTraffic.getRequestManager().trace("This is a sample trace from the sample ApiTraffic app.");

          // once the call is complete, build the response...
          return { message: 'Hello, world!' };
    
        } catch (error) {
            // Handle any errors that occur during the fetch
            console.error('Error fetching data:', error);
            throw error; // Rethrow the error for further handling if necessary
        }  
          
      }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);

};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();




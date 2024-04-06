const apiTraffic = require('..');
const axios = require('axios');

const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost'
    });

    // register the ApiTraffic plugin...
    await server.register({
        plugin: apiTraffic,
        options: {
          interceptOutbound: false
        }
      });

    // Define your routes and additional server setup here

    // Define a route for demonstration
    server.route({
      method: 'GET',
      path: '/',
      handler: async (request, h) => {

        try{
            // Await the response of the fetch call
          const response = await axios.get('https://www.boredapi.com/api/activity/')
          
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


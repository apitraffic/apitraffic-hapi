# apitraffic-hapi

```
npm install @apitraffic/hapi
```

```
const apiTraffic = require('@apitraffic/hapi');

// register plugin...
await server.register({
    plugin: apiTraffic,
    options: {
          interceptOutbound: false,
          host : "",
          token : "",
          bucket : ""
        }
});
```
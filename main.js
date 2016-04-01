var pm2 = require('pm2');
var MACHINE_NAME = 'oauthapi';

var PRIVATE_KEY = process.env.KEYMETRICS_PRIVATE_KEY;
var PUBLIC_KEY = process.env.KEYMETRICS_PUBLIC_KEY;

var instances = process.env.WEB_CONCURRENCY || -1;
var maxMemory = process.env.WEB_MEMORY || 512;

pm2.connect(function () {
    pm2.start({
        script: 'index.js',
        name: 'oauthapi',
        exec_mode: 'cluster',
        instances: instances,
        max_memory_restart: maxMemory + 'M',
        post_update: ["npm install"]
    }, function() {
        pm2.interact(PRIVATE_KEY, PUBLIC_KEY, MACHINE_NAME, function() {
            pm2.launchBus(function(err, bus) {
                bus.on('log:out', function(packet) {
                    console.log('[App:%s] %s', packet.process.name, packet.data);
                });
                bus.on('log:err', function(packet) {
                    console.error('[App:%s][Err] %s', packet.process.name, packet.data);
                });
            });
        });
    });
});
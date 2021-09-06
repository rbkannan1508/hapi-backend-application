'use strict';

const Hapi = require('hapi');
let ejs = require('ejs');
const db = require('./config/database');
const config = require('config');
const routes = require('./routes/indexRoute');
const jwtAuthStrategy = require('./strategies/jwtAuth');
const plugin = require('./plugins/plugin');
const server = new Hapi.Server();

const init = async () => {
    await server.connection({
        port: config.get('server.port'), 
        host: config.get('server.host')
    });

    await server.start(function (err) {
        if(err) {
            console.log('Error in server start', err);
        }
        console.log('Server started at: ', server.info.uri);
        db.authenticate().then(() => console.log('Connected to postgres through sequilize')).catch(err => console.log('Error in connection'+err));
    });

    await server.register(plugin);
    console.log('Plugins registered');
    
    server.views({
        engines: { html: ejs },
        path: __dirname
    });

    server.auth.strategy(jwtAuthStrategy.name, jwtAuthStrategy.schema, jwtAuthStrategy.options);
    server.auth.default(jwtAuthStrategy.name);

    routes.forEach((route) => {
        route.forEach((index) => {
            server.route(index);
        });
    });
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
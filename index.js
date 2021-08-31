'use strict';

const Hapi = require('hapi');
let ejs = require('ejs');
const inert = require('inert');
const vision = require('vision');
const db = require('./config/database');
const config = require('config');

const routes = require('./routes/indexRoute');

const server = new Hapi.Server();

db.authenticate().then(() => console.log('Database connected in postgres')).catch(err => console.log('Error in connection'+err));

server.connection({
    port: config.get('server.port'), 
    host: config.get('server.host')
});

server.start(function (err) {
    if(err) {
        console.log('Error in server start', err);
    }
    console.log('Server started at: ', server.info.uri);
});

server.register(vision, (err) => {
    if (err) {
        throw err;
    }

    server.views({
        engines: { html: ejs },
        path: __dirname
    });

    server.route({ 
        method: 'GET',
        path: '/',
        handler: (request, reply) => {
            return reply.view('./public/html/index.html', { title: 'Home page' });
        } 
    });

    server.register(inert, (err) => {   
        if(err) {
            console.log('Error in inert');
        }  
    
        server.route(routes.login.login);
    
        // routes.forEach((route) => {
        //     server.route(route);
        // });

        server.route(routes.loginSubmit.loginSubmit);
    
        server.route(routes.signupSubmit.signupSubmit);
        
        server.route(routes.signup.signup);
    
    });
});
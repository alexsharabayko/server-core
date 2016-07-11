var config = {
    port: 4000,

    dbUrl: 'localhost:27017/',
    dbName: 'hellyeahdish',

    customHeaders: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type'
    },

    routes: {
        '/': 'user-route.js'
    }
};

module.exports = config;
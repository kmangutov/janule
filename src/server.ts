//import { Server } from "http";
var path = require('path');
const express = require( "express" );
const app = express();
const port = 8080; // default port to listen

//app.arguments();
app.use(express.static(path.join(__dirname, 'web')));
app.listen(port);


console.log('start')

// define a route handler for the default home page
/*app.get( "/", ( req, res ) => {
    res.send( "Hello world!" );
*///} );
/*
// start the Express server
app.listen( port, () => {
    console.log( `server started at http://localhost:${ port }` );
} );*/
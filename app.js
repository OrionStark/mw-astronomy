const express = require('express');
const app = express();  
const server = require('http').createServer(app);
const socketIO = require('socket.io')(server);


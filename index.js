const PORT = 8080;
const express = require('express');
const server = express();
const { client } = require('./db');
const morgan = require('morgan');
require('dotenv').config();





client.connect();
server.use(morgan('dev'));

server.use(express.json())


server.listen(PORT, () => {
    console.log('The server is up on port', PORT)
});
server.use((req, res, next) => {
    console.log("<____Body Logger START____>");
    console.log(req.body);
    console.log("<_____Body Logger END_____>");

    next();
});
server.get('/background/:color', (req, res, next) => {
    res.send(`
    <body style="background: ${req.params.color};">
      <h1>Hello World</h1>
    </body>
  `);
});
server.get('/add/:first/to/:second', (req, res, next) => {
    res.send(`<h1>${req.params.first} + ${req.params.second} = ${Number(req.params.first) + Number(req.params.second)
        }</h1>`);
});

const apiRouter = require('./api');

server.use('/api', apiRouter);



// copy paste
//  login  
// curl http://localhost:3000/api/users/login -H "Content-Type: application/json" -X POST -d '{"username": "albert", "password": "bertie99"}' 
// token
// curl http://localhost:3000/api -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.MQ.G3qugJaXFzWSs1dmk1vrCRjvVfRz7T9g7btgvjaGAXM'

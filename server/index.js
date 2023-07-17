const keys = require('./keys');

// EXPRESS APP SETUP
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// this creates an express app to respond to all incoming http requests
const app = express();

// cross origin resource sharing : to map react application domain to express api domain 
app.use(cors());

// parse request body to json
app.use(bodyParser.json());


// POSTGRES CLIENT SETUP
const { Pool } = require('pg');

const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});

pgClient.on("connect", (client) => {
    client
      .query("CREATE TABLE IF NOT EXISTS values (number INT)")
      .catch((err) => console.error(err));
  });


// REDIS CLIENT SETUP
const redis = require('redis')
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

const redisPublisher = redisClient.duplicate();

// EXPRESS ROUTE HANDLERS

app.get('/', (req,res) => {
    res.send('Hi from the express app');
});

app.get('/values/all', async( req,res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

app.get('/values/current', async(req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if ( parseInt(index) > 40 ) {
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet');
    // this publisher publishes the insert event and wakes up the worker process
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true});
});

app.listen(5000, err => {
    console.log('Listening on port 5000');
});
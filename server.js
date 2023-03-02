const express = require('express');
const path = require('path');
const pulls = require('./db/db.json');
// const api = require('./public/assets/js/index.js');
const fs = require('fs');
const util = require('util');

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/api', api);

const middleware = (req, res, next) => {
  // ANSI escape code that instructs the terminal to print in yellow
  const yellow = '\x1b[33m%s\x1b[0m';

  // Log out the request type and resource
  console.log(yellow, `${req.method} request to ${req.path}`);

  // Built-in express method to call the next middleware in the stack.
  next();
};

app.use(middleware);

app.use(express.static(path.join(__dirname, 'public')));

const readFromFile = util.promisify(fs.readFile);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });

// app.get('/api', (req, res) => res.json(pulls));

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
  });

app.use('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

// app.use();

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
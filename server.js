const express = require('express');
const path = require('path');
const pulls = require('./db/db.json');
const fs = require('fs');
const util = require('util');
const uuid = require('./helpers/uuid');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const middleware = (req, res, next) => {
  const yellow = '\x1b[33m%s\x1b[0m';

  console.log(yellow, `${req.method} request to ${req.path}`);

  next();
};

app.use(middleware);

app.use(express.static(path.join(__dirname, 'public')));

const readFromFile = util.promisify(fs.readFile);

/**
 *  Function to write data to the JSON file given a destination and some content
 *  @param {string} destination The file you want to write to.
 *  @param {object} content The content you want to write to the file.
 *  @returns {void} Nothing
 */
const writeToFile = (destination, content) =>
  fs.writeFile(destination, JSON.stringify(content, null, 4), (err) =>
    err ? console.error(err) : console.info(`\nData written to ${destination}`)
  );

/**
 *  Function to read data from a given a file and append some content
 *  @param {object} content The content you want to append to the file.
 *  @param {string} file The path to the file you want to save to.
 *  @returns {void} Nothing
 */
const readAndAppend = (content, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      parsedData.push(content);
      writeToFile(file, parsedData);
    }
  });
};

const readAndDelete = (id, file) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      const parsedData = JSON.parse(data);
      const index = parsedData.findIndex(obj => obj.id === id);
      if (index !== -1) {
        parsedData.splice(index, 1);
        writeToFile(file, parsedData);
      } else {
        console.error(`Object with id ${id} not found in ${file}`);
      }
    }
  });
};

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
  });

app.get('/api/notes', (req, res) => {
    console.info(`${req.method} request received for notes`);
    readFromFile('./db/db.json').then((data) => res.json(JSON.parse(data)));
  });

app.use('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/notes.html'));
});

app.post('/api/notes', (req, res) => {
  console.info(`${req.method} request received to add a note`);

  const { title, text } = req.body;

  if (req.body) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    readAndAppend(newNote, './db/db.json');
    res.json(`Note added successfully 🚀`);
  } else {
    res.error('Error in adding Note');
  }
});

app.delete('/api/notes/:id', (req, res) => {
  console.log("INSIDE DELETE REQUEST");
  console.log(req.path);
  const responseURL = req.path;
  const id = responseURL.split('/')[3];
  readAndDelete(id, './db/db.json');
  res.json(`Note deleted 🚀`);
});

app.listen(PORT, () => {
    console.log(`Example app listening at http://localhost:${PORT}`);
});
const { DaprClient, HttpMethod, CommunicationProtocolEnum } = require('@dapr/dapr');
require("dotenv").config();

const express = require('express');

const Book = require('./Book');

const app = express();
const port = 3000;
app.use(express.json())

const daprHost = '127.0.0.1';
const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const stateStoreName = `statestore`;

const client = new DaprClient(daprHost, daprPort, CommunicationProtocolEnum.HTTP);


app.post('/book', async(req, res) => {
  // const newBook = new Book({...req.body});

  await client.state.save(stateStoreName, req.body)
  .then(() => {
    res.send('New Book created successfully!')
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  })
})

app.get('/books', async(req, res) => {
  await client.state.get(stateStoreName).then((books) => {
    if (books.length !== 0) {
      res.json(books)
    } else {
      res.status(404).send('Books not found');
    }
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  });
})

app.get('/book/:id', async(req, res) => {
  console.log("Inside");
  await client.state.get(stateStoreName,req.params.id).then((book) => {
    console.log("Book"+book);
    if (book) {
      res.json(book)
    } else {
      res.status(404).send('Books not found');
    }
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  });
})

app.delete('/book/:id', async(req, res) => {
  await client.state.delete(stateStoreName,req.params.id).then((book) => {
    if (book) {
      res.json('Book deleted Successfully!')
    } else {
      res.status(404).send('Book Not found!'); 
    }
  }).catch((err) => {
    res.status(500).send('Internal Server Error!');
  });
});

app.listen(port, () => {
  console.log(`Up and Running on port ${port} - This is Book service`);
})
const express = require('express')
const indeed = require('indeed-scraper')
const bodyParser = require('body-parser')
const multer = require('multer')
const queryOptions = require('./query-options')
const snakecaseKeys = require('snakecase-keys')
const knex = require('knex')({
  dialect: 'pg',
  connection: 'postgres://localhost:5432/hire-me'
})

const upload = multer({ dest: 'public/uploads/' })
const app = express()

app.use(express.static('public'))
app.use(bodyParser.json())

app.post('/', (req, res) => {
  const newQueryOptions = req.query
  Object.assign(queryOptions, newQueryOptions)
  res.sendStatus(201)
})

app.post('/users', upload.single('picture'), (req, res) => {
  const user = snakecaseKeys(req.body)
  if (req.file) {
    user.picture = req.file.filename
  }

  knex
    .insert(user)
    .into('users')
    .then(() => res.sendStatus(201))
})

app.get('/listings', (req, res) => {
  indeed.query(queryOptions).then(listings => {
    res.json(listings)
  })
})

app.get('/profile', (req, res) => {
  knex('users')
    .where('id', 9)
    .then(user => res.json(user))
})

app.put('/users/:id', upload.single('picture'), (req, res) => {
  const user = snakecaseKeys(req.body)
  if (req.file) {
    user.picture = req.file.filename
  }
  knex('users')
    .where('id', Number(req.params.id))
    .update(user)
    .then(() => res.sendStatus(200))
    .catch(err => {
      console.log(err)
      res.sendStatus(404)
    })
})

app.listen(3000, console.log('Listening on 3000!'))

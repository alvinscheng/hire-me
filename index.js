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

const upload = multer({ dest: 'uploads/' })
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
  console.log(user)

  knex
    .insert(snakecaseKeys(user))
    .into('users')
    .then(() => res.sendStatus(201))
})

app.get('/listings', (req, res) => {
  indeed.query(queryOptions).then(listings => {
    res.json(listings)
  })
})

app.listen(3000, console.log('Listening on 3000!'))

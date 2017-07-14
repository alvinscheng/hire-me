const express = require('express')
const indeed = require('indeed-scraper')
const path = require('path')
const bodyParser = require('body-parser')
const multer = require('multer')
const queryOptions = require('./query-options')
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
  const user = req.body
  const dbUser = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone,
    picture: req.file.filename
  }

  knex
    .insert(dbUser)
    .into('users')
    .then(() => res.sendStatus(201))
})

app.get('/listings', (req, res) => {
  indeed.query(queryOptions).then(listings => {
    res.json(listings)
  })
})

app.listen(3000, console.log('Listening on 3000!'))

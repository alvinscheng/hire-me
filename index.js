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
const usersGateway = require('./users-gateway')

const users = usersGateway(knex)
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
  users
    .create(user)
    .then(() => res.sendStatus(201))
})

app.post('/applications/:id', (req, res) => {
  knex
    .insert(snakecaseKeys(req.body))
    .into('applications')
    .returning('*')
    .then(() => res.sendStatus(201))
})

app.get('/listings', (req, res) => {
  indeed.query(queryOptions).then(listings => {
    res.json(listings)
  })
})

app.get('/profile/:id', (req, res) => {
  users
    .findById(req.params.id)
    .then(user => res.json(user))
})

app.get('/users', (req, res) => {
  users
    .find()
    .then(users => res.json(users))
})

app.put('/users/:id', upload.single('picture'), (req, res) => {
  const user = {}
  for (const key in req.body) {
    if (req.body[key]) {
      user[key] = req.body[key]
    }
  }
  if (req.file) {
    user.picture = req.file.filename
  }
  users
    .updateById(req.params.id, snakecaseKeys(user))
    .then(() => res.sendStatus(200))
})

app.listen(3000, console.log('Listening on 3000!'))

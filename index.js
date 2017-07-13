const express = require('express')
const indeed = require('indeed-scraper')
const path = require('path')
const queryOptions = require('./query-options')
const knex = require('knex')({
  dialect: 'pg',
  connection: 'postgres://localhost:5432/hire-me'
})

const app = express()

app.use(express.static('public'))

app.post('/', (req, res) => {
  const newQueryOptions = req.query
  Object.assign(queryOptions, newQueryOptions)
  res.sendStatus(201)
})

app.post('/users', (req, res) => {
  const user = req.query
  const dbUser = {
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    phone: user.phone
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

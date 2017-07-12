const express = require('express')
const indeed = require('indeed-scraper')
const path = require('path')
const queryOptions = require('./query-options')

const app = express()

app.use(express.static('public'))

app.post('/', (req, res) => {
  const newQueryOptions = req.query
  Object.assign(queryOptions, newQueryOptions)
})

app.get('/listings', (req, res) => {
  indeed.query(queryOptions).then(listings => {
    res.json(listings)
  })
})

app.listen(3000, console.log('Listening on 3000!'))

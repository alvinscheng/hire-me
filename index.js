const express = require('express')
const indeed = require('indeed-scraper')
const path = require('path')
const app = express()

const queryOptions = {
  query: 'JavaScript',
  city: 'Irvine, CA',
  radius: '25',
  level: 'entry_level',
  jobType: 'fulltime',
  sort: 'date',
  limit: '25'
}

app.use(express.static('public'))

app.get('/listings', (req, res) => {
  indeed.query(queryOptions).then(listings => {
    res.json(listings)
  })
})

app.listen(3000, console.log('Listening on 3000!'))

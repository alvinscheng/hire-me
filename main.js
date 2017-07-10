const express = require('express')
const indeed = require('indeed-scraper')
const app = express()
let listings = []

const queryOptions = {
  query: 'JavaScript',
  city: 'Irvine, CA',
  radius: '25',
  level: 'entry_level',
  jobType: 'fulltime',
  sort: 'date',
  limit: '25'
}

indeed.query(queryOptions).then(res => {
  listings = res
})


app.get('/listings', (req, res) => res.json(listings))

app.listen(3000, console.log('Listening on 3000!'))

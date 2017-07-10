fetch('http://localhost:3000/listings', { method: 'GET' })
  .then(response => {
    return response.json()
  })
  .then(listings => {
    console.log(listings)
  })

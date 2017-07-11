const $listings = document.querySelector('#listings')
const $jobSearch = document.querySelector('#job-search')

$jobSearch.addEventListener('submit', () => {
  event.preventDefault()
  fetch('http://localhost:3000/listings', { method: 'GET' })
    .then(response => {
      return response.json()
    })
    .then(listings => {
      listings
        .map(listing => (renderListing(listing)))
        .forEach($listing => $listings.appendChild($listing))
    })
})

function renderListing(listing) {
  const $listing = document.createElement('li')
  const $job = document.createElement('h3')
  const $company = document.createElement('strong')
  const $location = document.createElement('em')
  const $date = document.createElement('p')
  const $summary = document.createElement('p')
  const $link = document.createElement('a')
  const { title, company, location, summary, url, postDate } = listing
  $job.textContent = title
  $company.textContent = company + '- '
  $location.textContent = location
  $date.textContent = 'Posted: ' + postDate
  $summary.textContent = summary
  $link.textContent = 'Apply Here'
  $link.setAttribute('href', url)
  $listing.appendChild($job)
  $listing.appendChild($company)
  $listing.appendChild($location)
  $listing.appendChild($date)
  $listing.appendChild($summary)
  $listing.appendChild($link)
  return $listing
}

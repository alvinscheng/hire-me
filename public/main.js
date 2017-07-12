const $listings = document.querySelector('#listings')
const $jobSearch = document.querySelector('#job-search')
const $jobSearchContainer = document.querySelector('#job-search-container')
const $backgroundImage = document.querySelector('#background-image')
const $pageNumbers = document.querySelector('#page-numbers')
let jobList = []

$jobSearch.addEventListener('submit', () => {
  event.preventDefault()
  const $jobInput = document.querySelector('#job-input')
  const $cityInput = document.querySelector('#city-input')
  const options = {
    query: $jobInput.value,
    city: $cityInput.value
  }
  search(options)

  fetch('http://localhost:3000/listings', { method: 'GET' })
    .then(response => {
      return response.json()
    })
    .then(listings => {
      $jobSearchContainer.classList.remove('home')
      $backgroundImage.classList.add('hidden')
      jobList = listings.map(listing => (renderListing(listing)))
      changePage(1)
    })
})

function search(queries) {
  fetch('http://localhost:3000/' + queryString(queries), { method: 'POST' })
}

function queryString(obj) {
  let string = '?'
  for (const key in obj) {
    if (string === '?') {
      string += key + '=' + obj[key]
    }
    else {
      string += '&' + key + '=' + obj[key]
    }
  }
  return string
}

function changePage(page) {
  $listings.innerHTML = ''
  scroll(0, 0)
  for (let i = page * 20 - 20; i < page * 20; i++) {
    if (jobList[i]) {
      $listings.appendChild(jobList[i])
    }
    else return
  }
  window.location.hash = page
  renderPageNums(page)
}

function renderPageNums(current) {
  $pageNumbers.innerHTML = ''
  let pageNums
  if (jobList.length / 20 === Math.floor(jobList.length / 20)) {
    pageNums = jobList.length / 20
  }
  else {
    pageNums = Math.floor(jobList.length / 20) + 1
  }

  if (current > 1) {
    const $prev = document.createElement('a')
    $prev.textContent = 'Prev'
    $prev.href = '#' + (current - 1)
    $pageNumbers.appendChild($prev)
  }
  for (let i = 1; i <= pageNums; i++) {
    const $pageNum = document.createElement('a')
    $pageNum.textContent = i
    $pageNum.href = '#' + i
    $pageNum.classList.add('page')
    $pageNumbers.appendChild($pageNum)
  }
  if (pageNums > current) {
    const $next = document.createElement('a')
    $next.textContent = 'Next'
    $next.href = '#' + (current + 1)
    $pageNumbers.appendChild($next)
  }
}

class HashRouter {
  constructor($views) {
    this.$views = $views
    this.isListening = false
  }

  match(hash) {
    const pageNum = Number(hash.replace('#', ''))
    changePage(pageNum)
  }

  listen() {
    if (this.isListening) return
    window.addEventListener('hashchange', () => {
      this.match(window.location.hash)
    })
    this.isListening = true
    window.dispatchEvent(new Event('hashchange'))
  }
}

const $pages = document.querySelectorAll('.page')
const router = new HashRouter($pages)
router.listen()

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

const $listings = document.querySelector('#listings')
const $jobSearch = document.querySelector('#job-search')
const $createUser = document.querySelector('#create-user')
const $jobSearchContainer = document.querySelector('#job-search-container')
const $backgroundImage = document.querySelector('#background-image')
const $pageNumbers = document.querySelector('#page-numbers')
const $sideBar = document.querySelector('#sidebar')
const $picUpload = document.querySelector('#pic-upload')
const $profilePage = document.querySelector('#profile-page')
const $searchPage = document.querySelector('#search-page')
let jobList = []
let pageNums = 1

$jobSearch.addEventListener('submit', () => {
  event.preventDefault()
  const $jobInput = document.querySelector('#job-input')
  const $cityInput = document.querySelector('#city-input')
  const options = {
    query: $jobInput.value,
    city: $cityInput.value
  }
  search('/', options)

  get('/listings')
    .then(response => {
      return response.json()
    })
    .then(listings => {
      $jobSearchContainer.classList.remove('home')
      $sideBar.classList.remove('hidden')
      $backgroundImage.classList.add('hidden')
      jobList = listings.map(listing => (renderListing(listing)))
      changePage(1)
    })
})

$createUser.addEventListener('submit', () => {
  event.preventDefault()
  const formData = new FormData($createUser)
  post('/users', formData)
})

$picUpload.addEventListener('change', previewPhoto)

function search(path, queries) {
  return fetch(path + queryString(queries), { method: 'POST' })
}

function get(path) {
  return fetch(path, { method: 'GET' })
}

function post(path, data, header) {
  return fetch(path, {
    method: 'POST',
    headers: header,
    body: data
  })
}

function previewPhoto() {
  const $preview = document.querySelector('#profile-pic')
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    $preview.src = reader.result
  })

  if ($picUpload) {
    reader.readAsDataURL($picUpload.files[0])
  }
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
  }
  window.location.hash = page
  renderPageNums(page)
}

function renderPageNums(current) {
  $pageNumbers.innerHTML = ''
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
    if (i === current) {
      $pageNum.style.fontWeight = '900'
    }
    $pageNum.classList.add('page')
    $pageNumbers.appendChild($pageNum)
  }
  if (current < pageNums) {
    const $next = document.createElement('a')
    $next.textContent = 'Next'
    $next.href = '#' + (current + 1)
    $pageNumbers.appendChild($next)
  }

  addPageRoutes()
}

class HashRouter {
  constructor($views) {
    this.$views = Array.from($views)
    this.handlers = {}
    this.isListening = false
  }

  when(hash, handler) {
    this.handlers[hash] = handler
  }

  match(hash) {
    const viewId = hash.replace('#', '')
    const handler = this.handlers[viewId]
    if (!handler) return
    handler()
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

router.when('search', () => {
  $profilePage.classList.add('hidden')
  $searchPage.classList.remove('hidden')
})

router.when('profile', () => {
  $searchPage.classList.add('hidden')
  $profilePage.classList.remove('hidden')
})

function addPageRoutes() {
  for (let i = 1; i <= pageNums; i++) {
    router.when(i, () => {
      changePage(i)
    })
  }
}

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

const $listings = document.querySelector('#listings')
const $journalTableBody = document.querySelector('#journal-table-body')
const $jobSearch = document.querySelector('#job-search')
const $createUser = document.querySelector('#create-user')
const $jobSearchContainer = document.querySelector('#job-search-container')
const $backgroundImage = document.querySelector('#background-image')
const $pageNumbers = document.querySelector('#page-numbers')
const $sideBar = document.querySelector('#sidebar')
const $picUpload = document.querySelector('#pic-upload')
const $profilePage = document.querySelector('#profile-page')
const $createProfilePage = document.querySelector('#create-profile-page')
const $searchPage = document.querySelector('#search-page')
const $journalPage = document.querySelector('#journal-page')
const $navItems = document.querySelectorAll('.nav-item')
const $preview = document.querySelector('#profile-pic-preview')
const $selectUsers = document.querySelector('#users')

let userId = 10
let jobList = []
let pageNums = 1
const pageMap = {
  'search': $searchPage,
  'profile': $profilePage,
  'profile/create': $createProfilePage,
  'profile/edit': $createProfilePage,
  'journal': $journalPage
}

window.addEventListener('load', () => {
  renderSelectUsers()
  getCurrentUser()
    .then(user => renderUserInfo(user))
})

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
  save('/users', formData, formData.get('id'))
    .then(() => {
      $createUser.reset()
      renderSelectUsers()
      router.goTo('profile')
    })
})

$selectUsers.addEventListener('change', event => {
  userId = Number(event.target.value)
  getCurrentUser()
    .then(user => renderUserInfo(user))
})

$picUpload.addEventListener('change', previewPhoto)

$navItems.forEach($navItem => {
  $navItem.addEventListener('click', () => {
    $navItem.classList.add('active')
    $navItems.forEach($item => {
      if ($item !== $navItem) {
        $item.classList.remove('active')
      }
    })
  })
})

class HashRouter {
  constructor() {
    this.handlers = {}
    this.isListening = false
  }

  when(hash, handler) {
    this.handlers[hash] = handler
  }

  match(hash) {
    const viewId = hash.replace('#', '')
    const $view = pageMap[viewId]
    if (!$view) return
    const handler = this.handlers[viewId]
    if (!handler) return
    handler()
    $view.classList.remove('hidden')
    for (const page in pageMap) {
      if (pageMap[page] !== $view) {
        pageMap[page].classList.add('hidden')
      }
    }
  }

  goTo(hash) {
    window.location.href = '#' + hash
  }

  listen() {
    if (this.isListening) return
    window.addEventListener('hashchange', () => {
      if (window.location.hash.indexOf('?') === -1) {
        this.match(window.location.hash)
      }
      else {
        this.match(window.location.hash.substr(0, window.location.hash.indexOf('?')))
      }
    })
    this.isListening = true
    window.dispatchEvent(new Event('hashchange'))
  }
}

const router = new HashRouter()

router.when('search', () => {
  if (window.location.hash.indexOf('?') !== -1) {
    changePage(translateQueryString(window.location.hash.substr(window.location.hash.indexOf('?'))).page)
  }
  else {
    changePage(1)
  }
})

router.when('profile', () => {
  getCurrentUser()
    .then(user => renderUserInfo(user))
})

router.when('profile/create', () => {
  renderEditFormInfo({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    id: '',
    picture: 'profile-photo.png'
  })
})

router.when('profile/edit', () => {
  getCurrentUser()
    .then(users => renderEditFormInfo(users))
})

router.when('journal', () => {
  get('/applications/' + userId)
    .then(response => response.json())
    .then(apps => {
      $journalTableBody.innerHTML = ''
      apps.forEach(app => $journalTableBody.appendChild(renderApplication(app)))
    })
})

router.listen()

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

function put(path, data, header) {
  return fetch(path, {
    method: 'PUT',
    headers: header,
    body: data
  })
}

function previewPhoto() {
  const reader = new FileReader()
  reader.addEventListener('load', () => {
    $preview.src = reader.result
  })

  if ($picUpload) {
    reader.readAsDataURL($picUpload.files[0])
  }
}

function translateQueryString(string) {
  const querystring = string.substr(1)
  const queries = {}
  querystring
    .split('&')
    .forEach(query => {
      const [key, val] = query.split('=')
      queries[key] = val
    })
  return queries
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
  window.location.hash = 'search?page=' + page
  renderPageNums(page)
}

function renderSelectUsers() {
  get('/users')
    .then(response => response.json())
    .then(users => {
      $selectUsers.innerHTML = ''
      users.forEach(user => {
        const $selectUser = document.createElement('option')
        $selectUser.setAttribute('value', user.id)
        $selectUser.textContent = user.first_name + ' ' + user.last_name
        $selectUsers.appendChild($selectUser)
      })
    })
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
    $prev.href = '#search?page=' + (current - 1)
    $pageNumbers.appendChild($prev)
  }
  for (let i = 1; i <= pageNums; i++) {
    const $pageNum = document.createElement('a')
    $pageNum.textContent = i
    $pageNum.href = '#search?page=' + i
    if (i === current) {
      $pageNum.style.fontWeight = '900'
    }
    $pageNum.classList.add('page')
    $pageNumbers.appendChild($pageNum)
  }
  if (current < pageNums) {
    const $next = document.createElement('a')
    $next.textContent = 'Next'
    $next.href = '#search?page=' + (current + 1)
    $pageNumbers.appendChild($next)
  }
}

function renderApplication(application) {
  const $application = document.createElement('tr')
  const $jobTitle = document.createElement('td')
  const $jobCompany = document.createElement('td')
  const $jobLocation = document.createElement('td')
  $jobTitle.textContent = application.job_title
  $jobCompany.textContent = application.company
  $jobLocation.textContent = application.location
  $application.appendChild($jobTitle)
  $application.appendChild($jobCompany)
  $application.appendChild($jobLocation)
  $application.setAttribute('data-toggle', 'modal')
  $application.setAttribute('data-target', '#interview-modal')
  return $application
}

function renderListing(listing) {
  const $listing = document.createElement('li')
  const $job = document.createElement('h3')
  const $company = document.createElement('strong')
  const $location = document.createElement('em')
  const $date = document.createElement('p')
  const $summary = document.createElement('p')
  const $link = document.createElement('a')
  const $linkButton = document.createElement('button')
  const { title, company, location, summary, url, postDate } = listing

  $job.textContent = title
  $company.textContent = company + '- '
  $location.textContent = location
  $date.textContent = 'Posted: ' + postDate
  $summary.textContent = summary
  $linkButton.textContent = 'Apply Here'
  $linkButton.classList.add('btn', 'btn-default', 'btn-xs')
  $link.setAttribute('href', url)
  $link.setAttribute('target', '_blank')
  $link.appendChild($linkButton)

  $listing.appendChild($job)
  $listing.appendChild($company)
  $listing.appendChild($location)
  $listing.appendChild($date)
  $listing.appendChild($summary)
  $listing.appendChild($link)
  $listing.appendChild(createJournalButton(listing))
  return $listing
}

function createJournalButton(listing) {
  const app = {
    jobTitle: listing.title,
    company: listing.company,
    location: listing.location
  }
  const $journalButton = document.createElement('button')
  $journalButton.textContent = 'Add to Journal'
  $journalButton.classList.add('btn', 'btn-primary', 'btn-xs')

  $journalButton.addEventListener('click', () => {
    post('/applications/' + userId, JSON.stringify(app), { 'Content-Type': 'application/json' })
  })

  return $journalButton
}

function renderUserInfo(user) {
  const $profileName = document.querySelector('#profile-name')
  const $profileEmail = document.querySelector('#profile-email')
  const $profilePhone = document.querySelector('#profile-phone')
  $profileName.textContent = user.first_name + ' ' + user.last_name
  $profileEmail.textContent = user.email
  $profilePhone.textContent = user.phone
  if (user.picture) {
    const $profilePic = document.querySelector('#profile-pic')
    $profilePic.src = 'uploads/' + user.picture
  }
}

function renderEditFormInfo(user) {
  const $editFirstName = document.querySelector('#first-name')
  const $editLastName = document.querySelector('#last-name')
  const $editEmail = document.querySelector('#email')
  const $editPhone = document.querySelector('#phone')
  const $userId = document.querySelector('#user-id')
  $editFirstName.setAttribute('placeholder', user.first_name)
  $editLastName.setAttribute('placeholder', user.last_name)
  $editEmail.setAttribute('placeholder', user.email)
  $editPhone.setAttribute('placeholder', user.phone)
  $userId.value = user.id
  if (user.picture) {
    $preview.src = 'uploads/' + user.picture
  }
}

function getCurrentUser() {
  return get('/profile/' + userId).then(response => response.json())
}

function save(path, data, id) {
  if (id) {
    return put(path + '/' + id, data)
  }
  else {
    data.delete('id')
    return post(path, data)
  }
}

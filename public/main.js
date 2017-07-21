/* global flatpickr gapi */
flatpickr('#flatpickr', { enableTime: true })
const $listings = document.querySelector('#listings')
const $journalTableBody = document.querySelector('#journal-table-body')
const $jobSearch = document.querySelector('#job-search')
const $editUser = document.querySelector('#edit-user')
const $addInterview = document.querySelector('#add-interview')
const $jobSearchContainer = document.querySelector('#job-search-container')
const $backgroundImage = document.querySelector('#background-image')
const $pageNumbers = document.querySelector('#page-numbers')
const $sideBar = document.querySelector('#sidebar')
const $picUpload = document.querySelector('#pic-upload')
const $profilePage = document.querySelector('#profile-page')
const $editProfilePage = document.querySelector('#edit-profile-page')
const $searchPage = document.querySelector('#search-page')
const $journalPage = document.querySelector('#journal-page')
const $navItems = document.querySelectorAll('.nav-item')
const $preview = document.querySelector('#profile-pic-preview')
const $signIn = document.querySelector('#sign-in')
const $signOut = document.querySelector('#sign-out')

let signedIn = false
let userId = null
let googleId = null
let jobList = []
let pageNums = 1
const pageMap = {
  'search': { page: $searchPage, restricted: false },
  'profile': { page: $profilePage, restricted: true },
  'profile/edit': { page: $editProfilePage, restricted: true },
  'journal': { page: $journalPage, restricted: true }
}

$signIn.addEventListener('success', onSignIn)

$signOut.addEventListener('click', signOut)

function onSignIn(googleUser) {
  signedIn = true
  const profile = googleUser.getBasicProfile()
  googleId = profile.getId()
  show($sideBar)
  show($signOut)
  hide($signIn)
  const $journalButtons = document.querySelectorAll('.btn-journal')
  if ($journalButtons.length > 0) {
    $journalButtons.forEach($button => show($button))
  }
  getCurrentUser()
    .then(user => {
      if (!user[0]) {
        const newProfile = {
          fullName: profile.getName(),
          email: profile.getEmail(),
          googleId: profile.getId()
        }
        post('/users', JSON.stringify(newProfile), { 'Content-Type': 'application/json' })
          .then(response => response.json())
          .then(user => {
            userId = user.id
            console.log('User created!')
          })
      }
      else {
        userId = user[0].id
      }
    })
}

function signOut() {
  signedIn = false
  userId = null
  googleId = null
  hide($sideBar)
  hide($signOut)
  show($signIn)
  const auth2 = gapi.auth2.getAuthInstance()
  auth2.signOut().then(() => console.log('User signed out.'))
}

$jobSearch.addEventListener('submit', () => {
  event.preventDefault()
  const $jobInput = document.querySelector('#job-input')
  const $cityInput = document.querySelector('#city-input')
  const options = {
    query: $jobInput.value,
    city: $cityInput.value
  }

  get('/listings' + queryString(options))
    .then(response => {
      return response.json()
    })
    .then(listings => {
      $jobSearchContainer.classList.remove('home')
      if (signedIn === true) {
        show($sideBar)
      }
      hide($backgroundImage)
      jobList = listings.map(listing => (renderListing(listing)))
      changePage(1)
    })
})

$editUser.addEventListener('submit', () => {
  event.preventDefault()
  const formData = new FormData($editUser)
  put('/users/' + formData.get('id'), formData)
    .then(() => {
      $editUser.reset()
      router.goTo('profile')
    })
})

$addInterview.addEventListener('click', () => {
  const $intDate = document.querySelector('#flatpickr')
  const $intNumber = document.querySelector('#int-number')
  const $applicationId = document.querySelector('#application-id')
  const interviewData = {
    date: $intDate.value,
    interviewNumber: $intNumber.value
  }
  post('/interviews/' + $applicationId.value, JSON.stringify(interviewData), { 'Content-Type': 'application/json' })
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
    if (!$view || (!signedIn && $view.restricted)) return
    const handler = this.handlers[viewId]
    if (!handler) return
    handler()
    show($view.page)
    for (const page in pageMap) {
      if (pageMap[page].page !== $view.page) {
        hide(pageMap[page].page)
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
    .then(user => renderUserInfo(user[0]))
})

router.when('profile/edit', () => {
  getCurrentUser()
    .then(user => renderEditFormInfo(user[0]))
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

function hide(element) {
  element.classList.add('hidden')
}

function show(element) {
  element.classList.remove('hidden')
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

  $application.addEventListener('click', () => {
    const $applicationId = document.querySelector('#application-id')
    $applicationId.value = application.id
    const $modalTitle = document.querySelector('#modal-title')
    $modalTitle.textContent = application.job_title
    const $modalContent = document.querySelector('#modal-content')
    $modalContent.innerHTML = ''
    const $modalCompany = document.createElement('h5')
    $modalCompany.textContent = application.company
    const $modalLocation = document.createElement('h5')
    $modalLocation.textContent = application.location
    $modalContent.appendChild($modalCompany)
    $modalContent.appendChild($modalLocation)
  })

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
  $journalButton.classList.add('btn', 'btn-primary', 'btn-xs', 'btn-journal')
  if (signedIn) {
    show($journalButton)
  }
  else {
    hide($journalButton)
  }

  $journalButton.addEventListener('click', () => {
    post('/applications/' + userId, JSON.stringify(app), { 'Content-Type': 'application/json' })
  })

  return $journalButton
}

function renderUserInfo(user) {
  const $profileName = document.querySelector('#profile-name')
  const $profileEmail = document.querySelector('#profile-email')
  const $profilePhone = document.querySelector('#profile-phone')
  $profileName.textContent = user.full_name
  $profileEmail.textContent = user.email
  $profilePhone.textContent = user.phone
  if (user.picture) {
    const $profilePic = document.querySelector('#profile-pic')
    $profilePic.src = 'uploads/' + user.picture
  }
}

function renderEditFormInfo(user) {
  const $editFullName = document.querySelector('#full-name')
  const $editEmail = document.querySelector('#email')
  const $editPhone = document.querySelector('#phone')
  const $userId = document.querySelector('#user-id')
  $editFullName.setAttribute('placeholder', user.full_name)
  $editEmail.setAttribute('placeholder', user.email)
  $editPhone.setAttribute('placeholder', user.phone)
  $userId.value = user.id
  if (user.picture) {
    $preview.src = 'uploads/' + user.picture
  }
}

function getCurrentUser() {
  return get('/profile/' + googleId).then(response => response.json())
}

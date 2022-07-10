//---------------------- 變數設計 ------------------------
//基本user資料URL和會用到的DOM元素變數設定
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const userDataPanel = document.querySelector('#userdata-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
//設定user資料結構
const users = []
let filteredUsers = []
//設定分頁器每頁顯示的使用者數
const USERS_PER_PAGE = 12
//存取當前分頁的頁碼
let currentPage = 1

//---------------------- 函式設計 ------------------------
//1. 渲染User List, 用axios發送請求將資料使用template literal渲染出來
//函式：渲染User List
function renderUserList(data) {
  let rawHTML = ''
  data.forEach(item => {
    if (item.gender === 'male') {
      rawHTML += `
        <div class="card_box col-md-3 mb-3">
          <div class="card border-dark text-center m-3" data-id="${item.id}">
            <div class="img-box mt-3 btn" data-bs-toggle="modal" data-bs-target="#modal-user-profile">
              <img src="${item.avatar}" class="card-img-top" alt="..." data-id="${item.id}">
              <div id="gender-icon" class="blue">
                <i class="fa-solid fa-mars" data-id="${item.id}"></i>
              </div>
            </div>
            <div class="card-body" data-id="${item.id}">
              <h5 class="card-title" data-id="${item.id}">${item.name} ${item.surname}</h5>
              <p data-id="${item.id}"><i class="fa-solid fa-location-dot"></i> ${item.region}</p>
            </div>
            <div class="card-footer bg-transparent border-dark" data-id="${item.id}">
              <a href="#" class="btn btn-dark btn-follow-or-not btn-follow" role="button" data-id="${item.id}">Follow <i class="fa-solid fa-plus"></i></a>
            </div>
          </div>
        </div>
      `
    } else {
      rawHTML += `
        <div class="card_box col-md-3 mb-3">
          <div class="card border-dark text-center m-3" data-id="${item.id}">
            <div class="img-box mt-3 btn" data-bs-toggle="modal" data-bs-target="#modal-user-profile">
              <img src="${item.avatar}" class="card-img-top" alt="..." data-id="${item.id}">
              <div id="gender-icon" class="red">
                <i class="fa-solid fa-venus" data-id="${item.id}"></i>
              </div>
            </div>
            <div class="card-body" data-id="${item.id}">
              <h5 class="card-title" data-id="${item.id}">${item.name} ${item.surname}</h5>
              <p data-id="${item.id}"><i class="fa-solid fa-location-dot"></i> ${item.region}</p>
            </div>
            <div class="card-footer bg-transparent border-dark" data-id="${item.id}">
              <a href="#" class="btn btn-dark btn-follow-or-not btn-follow" role="button" data-id="${item.id}">Follow <i class="fa-solid fa-plus"></i></a>
            </div>
          </div>
        </div>
      `
    }
  })
  userDataPanel.innerHTML = rawHTML
}

//2. 點擊按鈕顯示個別使用者資料
//函式：取得Show API資料，抽換Modal內容
function showUserProfile(id) {
  const modalName = document.querySelector('#modal-user-name')
  const modalAvatar = document.querySelector('#modal-user-avatar')
  const modalGender = document.querySelector('#modal-user-gender')
  const modalBirthday = document.querySelector('#modal-user-birthday')
  const modalAge = document.querySelector('#modal-user-age')
  const modalRegion = document.querySelector('#modal-user-region')
  const modalEmail = document.querySelector('#modal-user-email')
  
  //先將 modal 內容清空，以免出現上一個 user 的資料殘影
  modalName.innerText = ''
  modalAvatar.src = ''
  modalGender.innerHTML = ''
  modalBirthday.innerHTML = ''
  modalAge.innerHTML = ''
  modalRegion.innerHTML = ''
  modalEmail.innerHTML = ''
  
  axios
    .get(INDEX_URL + id)
    .then(response => {
      const user = response.data
      modalName.innerText = user.name + ' ' + user.surname
      modalAvatar.src = user.avatar
      modalGender.innerHTML = `<i class="fa-solid fa-venus-mars"></i> ${user.gender}`
      modalBirthday.innerHTML = `<i class="fa-solid fa-cake-candles"></i> ${user.birthday}`
      modalAge.innerHTML = `<strong style="font-size: 10px; background-color: black; color: white">Age</strong> ${user.age}`
      modalRegion.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${user.region}`
      modalEmail.innerHTML = `<i class="fa-solid fa-envelope"></i> ${user.email}`
    })
    .catch(error => console.log(error))
}


//3. 加入追蹤名單：使用localStorage儲存資料
//函式：將使用者加入追蹤清單資料存在localStorage
const followedList = JSON.parse(localStorage.getItem('followedUsers')) || []

function addToFollowed(id) {
  const user = users.find(user => user.id === id)
  //錯誤處理：若使用者名單中找不到使用者直接return
  if (!user || !users.length) {return}
  //若已在追蹤名單中
  if (followedList.some(user => user.id === id)) {
    return alert('You have already followed the user!')
  }
  followedList.push(user)
  localStorage.setItem('followedUsers', JSON.stringify(followedList))
}

//函式：是否已追蹤的按鈕樣式切換
function checkFollowedOrNot() {
  const followedOrNotBtns = document.querySelectorAll('.btn-follow-or-not')
  //在追蹤名單中尋找是否有相同的使用者id，若有，改變按鈕成"已追蹤"樣式
  followedOrNotBtns.forEach(btn => {
    if (followedList.some(user => user.id === Number(btn.dataset.id))) {
      btn.classList = 'btn btn-success btn-follow-or-not btn-followed'
      btn.innerHTML = 'Followed <i class="fa-solid fa-check"></i>'
    }
      
  })
}
//4. 製作分頁器：依使用者數量決定分幾頁，根據頁碼和每頁顯示的使用者數抓取對應的使用者資料範圍
//函式：依資料數量決定分頁器內有幾頁
function renderPaginatorPages(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = `
    <li class="page-item">
      <a class="page-link text-dark previous" href="#" aria-label="Previous">
        <span class="previous" aria-hidden="true">&laquo;</span>
      </a>
    </li>
  `
  for (let p = 1; p <= numberOfPages; p++) {
    rawHTML += `<li class="page-item"><a class="page-link text-dark" href="#" data-page="${p}">${p}</a></li>`
  }
  rawHTML += `
    <li class="page-item">
      <a class="page-link text-dark next" href="#" aria-label="Next">
        <span class="next" aria-hidden="true">&raquo;</span>
      </a>
    </li>
  `
  paginator.innerHTML = rawHTML
}
//函式：依頁碼抓取使用者資料範圍
function getUsersByPage(page) {
  const data = filteredUsers.length ? filteredUsers : users
  //錯誤處理: 沒有大於所有分頁總數的頁碼
  if (page > Math.ceil(data.length / USERS_PER_PAGE)) return false
  const startIndex = (page - 1) * USERS_PER_PAGE
  const endIndex = startIndex + USERS_PER_PAGE
  return data.slice(startIndex, endIndex)
}
//函式：顯示當前頁的強調樣式
function toggleActiveStyle(currentPage) {
  const previousActivePage = document.querySelector('.active-1')
  const pages = document.querySelectorAll('.page-item')
  pages.forEach(page => {
    if (Number(page.children[0].dataset.page) === currentPage) {
      page.children[0].classList.remove('text-dark')
      page.children[0].classList.add('active-1')
    }
  })
  if (!previousActivePage || Number(previousActivePage.dataset.page) === currentPage) return
  previousActivePage.classList.remove('active-1')
  previousActivePage.classList.add('text-dark')
}


//---------------------- 主程式執行 ------------------------
//初始載入頁面...
//使用axios發送請求取得使用者資料，並渲染畫面
axios
  .get(INDEX_URL)
  .then(response => {
    users.push(...response.data.results)
    renderPaginatorPages(users.length)
    renderUserList(getUsersByPage(1))
    // console.log(users.length)
    toggleActiveStyle(currentPage)
    checkFollowedOrNot()
  })
  .catch(error => console.log(error))

// 監聽事件：點擊顯示個人資料的按鈕，展開Modal並根據資料id抽換內容；點擊追蹤按鈕加入追蹤名單頁面
userDataPanel.addEventListener('click', function onPanelClicked(event) {
  if (!event.target.dataset.id) {
    return
  }
  showUserProfile(event.target.dataset.id)
  if (event.target.matches('.btn-follow-or-not')) {
    addToFollowed(Number(event.target.dataset.id))
    checkFollowedOrNot()
  } 
})

// 監聽事件：提交搜尋表單，使用者清單會依輸入的關鍵字做篩選，重新渲染列表畫面
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //防止事件的瀏覽器預設
  event.preventDefault()
  const keyword = searchInput.value.toLowerCase().trim()
  //防止輸入空白
  if (!keyword.length) {
    alert('Please type in valid words!')
    searchInput.value = ''    
  }
  filteredUsers = users.filter(user => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
  //若該關鍵字找不到使用者
  if (!filteredUsers.length) {
    alert(`Cannot find users with keyword: ${keyword}`)
  }
  renderPaginatorPages(filteredUsers.length)
  renderUserList(getUsersByPage(1))
  toggleActiveStyle(currentPage)
  checkFollowedOrNot()
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A' && event.target.tagName !== 'SPAN') return false
  let pageNum = Number(event.target.innerHTML)
  console.log(pageNum)
  //製作上一頁和下一頁按鈕功能：如果點按的按紐內部元素無法轉成數字
  if (isNaN(pageNum)) {
    // 按下上一頁按紐？當前頁碼-1 : 當前頁碼+1
   pageNum = event.target.matches('.previous') ? currentPage - 1 : currentPage + 1
  }
  //錯誤處理: 沒有第零頁
  if (pageNum === 0) return false
  currentPage = pageNum
  renderUserList(getUsersByPage(currentPage))
  toggleActiveStyle(currentPage)
  checkFollowedOrNot()
})
//---------------------- 變數設計 ------------------------
//基本user資料URL和會用到的DOM元素變數設定
const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const userDataPanel = document.querySelector('#userdata-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

let filteredUsers = []

//---------------------- 函式設計 ------------------------
//1. 渲染User List, 取用localStorage資料
//函式：渲染User List
function renderUserList(data) {
  let rawHTML = ''
  data.forEach(item => {
    if (item.gender === 'male') {
      rawHTML += `
        <div class="card_box col-md-3 mb-3">
          <div class="card border-dark text-center m-3 btn" data-id="${item.id}">
            <div class="img-box mt-3" data-bs-toggle="modal" data-bs-target="#modal-user-profile">
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
              <a href="#" class="btn btn-danger btn-unfollow" role="button" data-id="${item.id}">Unfollow <i class="fa-solid fa-xmark"></i></a>
            </div>
          </div>
        </div>
      `
    } else {
      rawHTML += `
        <div class="card_box col-md-3 mb-3">
          <div class="card border-dark text-center m-3 btn" data-id="${item.id}">
            <div class="img-box mt-3" data-bs-toggle="modal" data-bs-target="#modal-user-profile">
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
              <a href="#" class="btn btn-danger btn-unfollow" role="button" data-id="${item.id}">Unfollow <i class="fa-solid fa-xmark"></i></a>
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

//3. 點擊取消追蹤按鈕將使用者移出追蹤清單頁面
function removeFromFollowed(id) {
  if (!users || !users.length) return false
  const removedUserIndex = users.findIndex(user => user.id === id)
  if (removedUserIndex === -1) return false
  users.splice(removedUserIndex, 1)
  localStorage.setItem('followedUsers', JSON.stringify(users))
  renderUserList(users)
}


//---------------------- 主程式執行 ------------------------
//設定user資料結構
const users = JSON.parse(localStorage.getItem('followedUsers')) || []
renderUserList(users)

//監聽事件：點擊顯示個人資料的按鈕，展開Modal並根據資料id抽換內容；點擊取消追蹤按鈕移出追蹤名單頁面
userDataPanel.addEventListener('click', function onPanelClicked(event) {
  if (!event.target.dataset.id) return false
  
  showUserProfile(event.target.dataset.id)
  if (event.target.matches('.btn-unfollow')) {
    removeFromFollowed(Number(event.target.dataset.id))
  } 
})

// 監聽事件：提交搜尋表單，使用者清單會依輸入的關鍵字做篩選，重新渲染列表畫面
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.toLowerCase().replace(/\s*/g, '')
  if (!keyword.length) {
    alert('Please type in valid words!')
    searchInput.value = ''
  }
  filteredUsers = users.filter(user => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))
  if (!filteredUsers.length) {
    alert(`Cannot find users with keyword: ${keyword}!`)
  }
  renderUserList(filteredUsers)
})
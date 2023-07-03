let login_but = document.getElementById("login-btn")
let password_login = document.querySelector("#password")
let username_login = document.querySelector("#username")

let login_switch = document.querySelector("#switch-btn-lgn")
let register_switch = document.querySelector('#switch-btn-rgstr')

let forms = document.querySelector("#forms")




login_but.addEventListener("click",login_user)
/*register_but.addEventListener("click",register_user)*/


register_switch.addEventListener('click', renderregister)
login_switch.addEventListener('click',renderlogin)

function renderregister(){
  forms.innerHTML = `  
          <input id="register-username" class = "${username_login.className}" type="" name="" placeholder="Username">
          <input id= "register-password" class = "${password_login.className}" type="password" name="" placeholder="Password">
          <input id= "register-password-repeat" class = "${password_login.className}" type="password" name="" placeholder="Repeat password">
          <button id="register-btn" class = "${login_but.className}" class="outline">Register</button>`

          let register_but = document.querySelector('#register-btn')
          let register_username = document.querySelector('#register-username')
          let register_password = document.querySelector('#register-password')
          let register_password_repeat = document.querySelector('#register-password-repeat')

          register_but.addEventListener('click',register_user)

          function register_user(){
                  if (register_password.value === register_password_repeat.value){
                            post(`/register/${register_username.value}`,data = {password : register_password.value}).then(renderlogin)
                  }else{
                        alert("Passwords do not match up!")
                        register_password.value = ''
                        register_password_repeat.value = ''
  }
}
}

function renderlogin(){
  forms.innerHTML = `
          <input id="username" class = "${document.querySelector("#register-username").className}" type="" name="" placeholder="Username">
          <input id= "password" class = "${document.querySelector("#register-password").className}" type="password" name="" placeholder="Password">
          <button id="login-btn" class="${document.querySelector("#register-btn").className}">Login</button>`

          let login_but = document.getElementById("login-btn")
          let password_login = document.querySelector("#password")
          let username_login = document.querySelector("#username")

          login_but.addEventListener('click', login_user )

          function login_user(){
            if(username_login.value != ''  && password_login.value != '' ){
              login("/login",data = {username: username_login.value , password : password_login.value}).then(value =>{ 
              if (value.detail != 'Incorrect username or password')  {
                window.location.href = "/home"
              }else{
                alert(value.detail)
              }     
            })
            }else{
              alert("You have to log in first to proceed!")
            }
            
          }
}


function login_user(){
  if(username_login.value != ''  && password_login.value != '' ){
    login("/login",data = {username: username_login.value , password : password_login.value}).then(value =>{ 
    if (value.detail != 'Incorrect username or password')  {
      window.location.href = "/home"
    }else{
      alert(value.detail)
    }     
  })
  }else{
    alert("You have to log in first to proceed!")
  }
  
}

async function login(url = '', data = {}) {
  
  const response = await fetch(url, {
    method: 'POST',
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    },    
    body: new URLSearchParams({
        'username': data.username ,
        'password': data.password,
        'grant_type': 'password'
    })
  });
  return response.json(); 
}


async function post(url = '', data = {}) {
  
  const response = await fetch(url, {
    method: 'POST', 
    mode: 'cors', 
    cache: 'no-cache', 
    credentials: 'same-origin', 
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow', 
    referrerPolicy: 'no-referrer', 
    body: JSON.stringify(data) 
  });
  return response.json(); 
}

async function get(url) {
  let response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-type': 'application/json'
            }
        });
  
  let data = await response.json();
  return data;
}
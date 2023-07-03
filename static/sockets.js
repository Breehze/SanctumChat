
let send_friend_req_in = document.querySelector("#add_friend_input")
let send_friend_req_form = document.querySelector('#add_friend_form')
let send_friend_req_but = document.querySelector("#add_friend_button")
let logout_but = document.querySelector("#logout-button")
let connected_chat_ws = []
let wsinfo = new WebSocket(`ws://127.0.0.1:8000/userinfo`)
let fl_change

logout_but.addEventListener('click',() => {
    get('/logout').then(window.location.replace("/"))
})



wsinfo.onmessage = function(event){
                user_data = JSON.parse(event.data)
                //console.log(user_data)
                document.querySelector("#ws-id").textContent = user_data.username;
                try{
                    if(fl_change === JSON.stringify(user_data.friends_list)){ 
                        
                    }else{
                        renderfriendslist(user_data.friends_list)
                    }
                     
                }catch{}
                try{   
                        renderfriendreqlist(user_data.pending_friends)
                }catch{}
                try{
                    renderPfp(user_data.pfp)
                }catch{}

                fl_change = JSON.stringify(user_data.friends_list)

            }

            send_friend_req_form.onsubmit = function() {send_friend_req()}
            /*send_friend_req_but.addEventListener('click', send_friend_req )*/


            function send_friend_req(){
                let user =  send_friend_req_in.value
                post(`/send_friendreq/${user}`,{})
                send_friend_req_in.value = ''
            }

            function sendMessage(event,ws) {
                console.log(ws)
                console.log(event)
                let input = document.getElementById("messageText")
                try{
                    ws.send(input.value)
                }catch (err){console.log(err)}
                
                input.value = ''
                event.preventDefault()
            }
        
            function renderfriendreqlist(friendslist){
                let b = document.querySelector("#friendrequests")
                b.innerHTML = ''
                console.log(friendslist)
                for (let i of friendslist ){
                    console.log(i)
                    let name = document.createElement("li")
                    name.innerHTML = i
                    let newItem = document.createElement("button");
                    newItem.innerHTML = "Accept"
                    newItem.value = i;
                    newItem.id = `accept-button-${i}`
                    newItem.className = "acceptbuttons"
                    newItem.addEventListener('click',accept_fr)
                    b.appendChild(name);
                    b.appendChild(newItem);
                    
                }
            }

            function renderPfp(pfp){
                let k = document.querySelector("#pfpimg")
                k.style.backgroundImage = `url(${pfp})`
            }


            function stop_reload(event){
                event.preventDefault()
            }

            function accept_fr(){
                //console.log(this.value)
                post(`/accept_friendreq/${this.value}`)
            }
            
            function open_chat(){
               let  send_msg_form = document.querySelector("#msg-form")
                let messages = document.querySelector("#messages")
                messages.innerHTML = ""
                try{
                    connected_chat_ws[0].close()
                }catch(err){console.log(err)} 
                let chat_id = user_data.friends_list[this.value]['chat_id']
                let ws = new WebSocket(`ws://127.0.0.1:8000/chat/${chat_id}`);
                send_msg_form.onsubmit = function() {sendMessage(event,ws)}
                
                ws.onopen = function() {
                                connected_chat_ws.push(ws);
                                
                            };
                
                ws.onclose = function() {
                    let index = connected_chat_ws.indexOf(ws);
                    if (index !== -1) {
                        connected_chat_ws.splice(index, 1);
                    }
                };



                ws.onmessage = function(event) {
                    console.log(JSON.parse(event.data))
                    let parsed = JSON.parse(event.data)
                    let parsed_list = Object.keys(parsed)
                    let messages = document.getElementById('messages')
                    let last_author = ''  
                    try{
                        last_author = messages.querySelectorAll('li')[messages.querySelectorAll('li').length - 1].dataset.author
                    }catch{}
                    if(parsed_list.length > 1) {
                        console.log("should do magic")
                        messages.innerHTML= `<ul style="list-style: none;" id='messages'>`
                        editingAndDeleteing(parsed_list,parsed,last_author,chat_id,messages,ws)

                    }else{  
                        editingAndDeleteing(parsed_list,parsed,last_author,chat_id,messages,ws) 
                    }
                let messages_container = document.querySelector("#messages_container")
                messages_container.scrollTop = messages_container.scrollHeight;
            };
            }



            function renderfriendslist(friendslist){
                let b = document.querySelector("#friends")
                b.innerHTML = ''
                for (let i of Object.keys(friendslist) ){
                
                    let newItem = document.createElement("button");
                    // newItem.innerHTML += i  
                    newItem.value = i
                    newItem.id = `friend-button-${i}`
                    newItem.className = "flex relative items-center mt-5 hover:bg-gray-700 w-full rounded-md"
                    
                     
                    console.log(`pfps/user/${i}`)
                    let divItem = document.createElement("div");
                        divItem.className = "w-16 h-16 border-2 bg-cover bg-center rounded-full bg-[url('https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg')]"
                        divItem.style.backgroundImage =  `url(pfps/user/${i})`
                        if (friendslist[i]['status'] == "Online") {
                            divItem.classList.add("border-green-600")
                        }else{
                            divItem.classList.add("border-gray-400")
                        }
                        
                        console.log(`url(pfps/user/${i})`)
                    let h = document.createElement("h6")
                        h.className = "ml-5 text-white font-bold text-lg"
                        h.innerHTML = i
                    
                    newItem.appendChild(divItem);
                    if (friendslist[i]['unseen_messages'] > 0 ){
                        let missed_messages = document.createElement('div')
                        missed_messages.className = "absolute top-0 w-5 h-5 bg-red-600 bg-cover bg-center rounded-full text-white text-xs text-center"
                        missed_messages.textContent = friendslist[i]['unseen_messages']
                        newItem.appendChild(missed_messages);
                    }else{}
                    newItem.appendChild(h)
                    newItem.addEventListener('click',open_chat)
                    b.appendChild(newItem);
                    
                }
            }

            function editingAndDeleteing(parsed_list,parsed,last_author,chat_id,messages,ws){ 
                for(let i of parsed_list){
                    let message_author = Object.keys(parsed[i])[0]
                    if(message_author != last_author){
                        let message = document.createElement('li')
                        message.dataset.author = message_author
                        message.id = `message_${i}`
                        message.value = i
                        message.className = 'flex relative flex-row mt-5'
                    
                        let pfp_in_chat = document.createElement('div')
                        pfp_in_chat.className = `w-12 h-12 bg-[url()] bg-cover bg-center rounded-full`
                        pfp_in_chat.style.backgroundImage = `url(pfps/user/${Object.keys(parsed[i])[0]}?${Date.now()})`

                        let name_heading = document.createElement('h5')
                        name_heading.className = "text-white font-semibold"
                        name_heading.textContent =message_author

                        let text_heading = document.createElement('h5')
                        text_heading.className = "text-gray-300"
                        text_heading.textContent = parsed[i][Object.keys(parsed[i])]                   

                        let message_content = document.createElement('div')
                        message_content.className = "ml-5"

                        message_content.appendChild(name_heading)
                        message_content.appendChild(text_heading)

                        message.appendChild(pfp_in_chat)
                        message.append(message_content)
                        messages.appendChild(message)

                        if(user_data.username == message_author){
                            message.classList.add('hover:bg-white/5')
                            let message_menu = document.createElement('div')
                            message_menu.id = `message_menu_${i}`
                            message_menu.className = "invisible absolute bottom-20 right-4 w-16 bg-gray-700 rounded-md"
                            let exact_message = document.getElementById(message.id)

                            let message_del_button = document.createElement('button')
                            message_del_button.className = 'hover:bg-white/20 rounded-l-md'
                            message_del_button.textContent = 'Del'

                            message_del_button.addEventListener('click' , () =>{
                                del(`/deletemessage/${chat_id}/${i}`).then(ws.send(":?:message_resend_recent:?:"))
                            })


                            let message_edit_button =  document.createElement('button')
                            message_edit_button.className = 'hover:bg-white/20'
                            message_edit_button.textContent = 'Edit'

                            message_edit_button.addEventListener('click' , () =>{
                                message.innerHTML = `<form><input class=" bg-slate-700 p-2 w-full rounded-lg" value="${text_heading.textContent}" type="text" autocomplete="off"/></form>`
                                message.onsubmit = function(event){
                                    stop_reload(event)
                                    let editIn = message.firstChild.firstChild.value
                                    patch(`/editmessage/${chat_id}/${i}` , {"message" : editIn}).then(
                                          ws.send(":?:message_resend_recent:?:")
                                    )
                                }})
                            message_menu.appendChild(message_del_button)
                            message_menu.appendChild(message_edit_button)
                            message.appendChild(message_menu)
                            
                            exact_message.addEventListener("mouseenter", ()=> {
                                console.log(exact_message.value)
                                let exact_message_menu = document.getElementById(`message_menu_${exact_message.value}`)
                                exact_message_menu.classList.remove('invisible')
                              })

                            exact_message.addEventListener("mouseleave", ()=> {
                                let exact_message_menu = document.getElementById(`message_menu_${exact_message.value}`)
                                exact_message_menu.classList.add('invisible')
                              })
                          
                        }else{}






                    }else{
                        let message = document.createElement('li')
                        message.dataset.author = Object.keys(parsed[i])[0]
                        message.value = i
                        message.id = `message_${i}`
                        message.className = 'flex flex-row relative'

                        let pfp_in_chat = document.createElement('div')
                        pfp_in_chat.className = "w-12"

                        let text_heading = document.createElement('h5')
                        text_heading.className = "text-gray-300"
                        text_heading.textContent = parsed[i][Object.keys(parsed[i])]

                        let message_content = document.createElement("div")
                        message_content.className = 'ml-5'

                        message_content.appendChild(text_heading)

                        message.appendChild(pfp_in_chat)
                        message.appendChild(message_content)
                        messages.append(message)

                        if(user_data.username == message_author){
                            message.classList.add('hover:bg-white/5')
                            let message_menu = document.createElement('div')
                            message_menu.id = `message_menu_${i}`
                            message_menu.className = "invisible absolute bottom-3 right-4 w-16 bg-gray-700 rounded-md"
                            let exact_message = document.getElementById(message.id)

                            let message_del_button = document.createElement('button')
                            message_del_button.className = 'hover:bg-white/20 rounded-l-md'
                            message_del_button.textContent = 'Del'

                            message_del_button.addEventListener('click' , () =>{
                                del(`/deletemessage/${chat_id}/${i}`).then(ws.send(":?:message_resend_recent:?:"))
                            })


                            let message_edit_button =  document.createElement('button')
                            message_edit_button.className = 'hover:bg-white/20'
                            message_edit_button.textContent = 'Edit'

                            message_edit_button.addEventListener('click' , () =>{
                                message.innerHTML = `<form><input class=" bg-slate-700 p-2 w-full rounded-lg" value="${text_heading.textContent}" type="text" autocomplete="off"/></form>`
                                message.onsubmit = function(event){
                                    stop_reload(event)
                                    let editIn = message.firstChild.firstChild.value
                                    patch(`/editmessage/${chat_id}/${i}` , {"message" : editIn}).then(
                                          ws.send(":?:message_resend_recent:?:")
                                    )
                                }})
                            message_menu.appendChild(message_del_button)
                            message_menu.appendChild(message_edit_button)
                            message.appendChild(message_menu)
                            
                            exact_message.addEventListener("mouseenter", ()=> {
                                console.log(exact_message.value)
                                let exact_message_menu = document.getElementById(`message_menu_${exact_message.value}`)
                                exact_message_menu.classList.remove('invisible')
                              })

                            exact_message.addEventListener("mouseleave", ()=> {
                                let exact_message_menu = document.getElementById(`message_menu_${exact_message.value}`)
                                exact_message_menu.classList.add('invisible')
                              })
                          
                        }else{}
                    
                          

                    }
                    last_author = Object.keys(parsed[i])[0]
                }

            }      
                    



            async function post(url = '', data = {}) {
  
                const response = await fetch(url, {
                        method: 'POST', 
                        mode: 'cors', 
                        cache: 'no-cache', 
                        credentials: 'same-origin', 
                        headers: {
                                    'Content-Type': 'application/json'
                                    },
                        redirect: 'follow', 
                        referrerPolicy: 'no-referrer', 
                        body: JSON.stringify(data) 
                        });
                    return response.json(); 
                }

async function patch(url = '', data = {}) {
  
                    const response = await fetch(url, {
                            method: 'PATCH', 
                            mode: 'cors', 
                            cache: 'no-cache', 
                            credentials: 'same-origin', 
                            headers: {
                                        'Content-Type': 'application/json'
                                        },
                            redirect: 'follow', 
                            referrerPolicy: 'no-referrer', 
                            body: JSON.stringify(data) 
                            });
                        return response.json(); 
                    }

async function get(url = '') {
  
                const response = await fetch(url, {
                        method: 'GET', 
                        mode: 'cors', 
                        cache: 'no-cache', 
                        credentials: 'same-origin', 
                        headers: {
                                    'Content-Type': 'application/json'
                                    },
                        redirect: 'follow', 
                        referrerPolicy: 'no-referrer'
                        });
                    return response.json(); 
                }

async function del(url = '') {
  
                    const response = await fetch(url, {
                            method: 'DELETE', 
                            mode: 'cors', 
                            cache: 'no-cache', 
                            credentials: 'same-origin', 
                            headers: {
                                        'Content-Type': 'application/json'
                                        },
                            redirect: 'follow', 
                            referrerPolicy: 'no-referrer'
                            });
                        return response.json(); 
                    }


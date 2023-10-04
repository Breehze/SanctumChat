<script setup>
    import { ref } from 'vue'
    import Friend from '../components/Friend.vue';
    import MessageInital from '../components/MessageInital.vue'; 
    import MessageFollowup from '../components/MessageFollowup.vue';
    import FriendRequestsModal from '../components/FriendRequestsModal.vue';
    import UserSettingsModal from '../components/UserSettingsModal.vue';
    import InputForChat from '../components/InputForChat.vue';
    
    const username = ref("")
    const pfp  = ref('')
    const friends = ref({})
    const pendingFriendRequest = ref({})
    const messages = ref({})
    const connectedChatId = ref('')
    const shReqModal = ref(false)
    const shUsSetModal = ref(false)
    const openedFriend = ref('')

    let lastAuthor = ''
    let lastTimestamp = null
    let connectedChat = []
    
    const auth = localStorage.getItem("testAuth") //uncomment for dev
    const userid = localStorage.getItem("userid") //uncomment for dev
    const userSocket = new WebSocket("ws://127.0.0.1:8000/userinfo")

    userSocket.onopen = () => {
        console.log("Connected")
        userSocket.send(userid) //uncomment for dev
    }
    
    
    userSocket.onmessage = (message) =>{
        let parsed = JSON.parse(message.data)
        username.value = parsed.username
        pfp.value = `http://127.0.0.1:8000/${parsed.pfp}`
        //only rerenders when change in friends 
        if ( JSON.stringify(ref(parsed.friends_list).value) != JSON.stringify(friends.value) ) {
            friends.value = parsed.friends_list
        }
    
        pendingFriendRequest.value = parsed.pending_friends

        
    }

    const openChat = (chatid) => {
         try{
            connectedChat[0].close()
            connectedChat.pop(0)
         }catch{}
        const chatSocket = new WebSocket(`ws://127.0.0.1:8000/chat/${chatid}`)
        connectedChat.push(chatSocket)
        
        
        chatSocket.onopen = () => {
            lastAuthor = ''
            messages.value = {}
            chatSocket.send(userid) //uncomment for dev
        }
        
        
        chatSocket.onmessage = (message) => {
            let parsed_message = JSON.parse(message.data)
            console.log(parsed_message)
            if (Object.keys(parsed_message).length > 1){
                console.log('why no reset')
                messages.value = {}
            }
            for(let i of Object.keys(parsed_message)){
                messages.value[i] = parsed_message[i]
            }
            
            
        }
        
    }

    const editMessage = async(chatId,messageId,editedMessage) => {
        const response = await fetch(`http://127.0.0.1:8000/editmessage/${chatId}/${messageId}`,{
            method : "PATCH",
            headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${auth}`
                },
            body : JSON.stringify({
                message : editedMessage
            })
        }).then(() => {connectedChat[0].send(":?:message_resend_recent:?:")})
    }
    
    
    const deleteMessage = async(chatId,messageId) => {
        const response = await fetch(`http://127.0.0.1:8000/deletemessage/${chatId}/${messageId}`,{
        method : 'DELETE',
        headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${auth}`
                },
        }).then(() => {connectedChat[0].send(":?:message_resend_recent:?:")})  
    }
    
    const addFriend = async(friendToAdd) => {
        const response = await fetch(`http://127.0.0.1:8000/send_friendreq/${friendToAdd}`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${auth}`
            }
        })
    }

    const acceptFriendRequest = async(friendId) => {
        const response = await fetch(`http://127.0.0.1:8000/accept_friendreq/${friendId}`,{
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json',
                'Authorization' : `Bearer ${auth}`
            }
        })
    }

    const uploadPfp = async(file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch(`http://127.0.0.1:8000/uploadfile`,{
            method : 'POST',
            headers : {
                'Authorization' : `Bearer ${auth}`
            },
            body : formData
        })
    }

    const logOut = async() => {
        const response = await fetch("http://127.0.0.1:8000/logout",{
            method : 'GET',
            headers : {
                    'Content-Type' : 'application/json',
                    'Authorization' : `Bearer ${auth}`
                }
        }).then(localStorage.clear()).then(window.location.href = "/")
        console.log(response)
        
    }

    
    function evaluateLastAuthor(currentAuthor) {
        if (currentAuthor == lastAuthor){
            lastAuthor === currentAuthor
            return false
        }else{
            lastAuthor = currentAuthor
            return true
        }
    }

    function timeDelta(messageTimestamp) {
        if (messageTimestamp - lastTimestamp > 300) {
            lastTimestamp = messageTimestamp
            return true
        }else{
            lastTimestamp = messageTimestamp
            return false
        }
    }
    
    console.log(openedFriend.value)

</script>

<template>
<div class="flex justify-center items-center h-screen bg-gray-700">      
        <div class="flex flex-row rounded-xl bg-gray-800 w-10/12 h-5/6">
            
            <div class="flex flex-col  w-1/3 h-full">
                <div  class="flex items-center mt-4 ml-4">
                    <button @click=" shUsSetModal = true" id="pfpimg" :style="{backgroundImage : `url(${pfp})`}" class=" hover:opacity-60 p-0 w-24 h-24 bg-inherit border-none bg-[url('https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg')] bg-cover bg-center rounded-lg ">
                    
                    </button>
                    <h4 class="mb-0 ml-5  font-bold text-white text-3xl"  >{{ username }}</h4>
                </div>
                <div class="flex">   
                    <button @click="shReqModal = true" class="border-2 mt-8 text-cyan-300 ml-5 mr-5 p-4 rounded-md hover:bg-gray-700 border-cyan-300 text-lg font-bold w-1/2 ">
                        Friend requests
                    </button>
                    <button @click="logOut" class="border-2 mt-8 text-red-500 ml-5 mr-5 p-4 rounded-md hover:bg-gray-700 border-red-500 text-lg font-bold w-1/2 ">
                        Log out
                    </button>
                </div>
                <h4 class="text-white text-3xl font-bold mt-5 ml-5">
                    Friends :
                </h4>
                <div class="overflow-y-scroll h-5/6 ml-5">
                    <ul>
                        <li v-for="(friendInfo,friend) in friends">
                            <Friend @click ="openChat(friendInfo.chat_id); connectedChatId = friendInfo.chat_id; openedFriend =friend "  :friend-name="friend" :unread-messages="friendInfo.unseen_messages" :friend-activity="friendInfo.status" :key="friendInfo"></Friend>
                        </li>
                        
                    </ul>
                </div>
            </div>
            
            <div class="flex flex-col w-2/3 h-full">
                <div v-if="connectedChat.length > 0" class=" flex flex-row items-center w-full h-14 bg-slate-900/60 rounded-bl-2xl rounded-tr-lg">
                    <div class="flex flex-row ml-5 items-center">
                        <div :style="{backgroundImage : `url(http://127.0.0.1:8000/pfps/user/${ openedFriend })`}" class="bg-cover bg-center bg-white w-8 h-8 rounded-lg">
                            
                        </div>
                        <h5 class="text-white font-bold text-lg ml-3"> {{ openedFriend }} </h5>
                    </div>    
                </div>
                <div :ref="(el) => { el.scrollTop = el.scrollHeight }" class="overflow-y-scroll h-full ml-5 mb-5">
                    <ul  style="list-style: none;" :id='messages'>
                        <li v-for="(messageInfo,id) in messages">
                            <component @delete-this-message = "deleteMessage(connectedChatId,id)" @edit-this-message = "(editedMessage) => editMessage(connectedChatId,id,editedMessage)"  v-if=" evaluateLastAuthor(Object.keys(messageInfo)[0]) || timeDelta(messageInfo.timestamp) " :is="MessageInital" :user-id = "username" :message-info = "messageInfo" :key="id"></component>
                            <component @delete-this-message = "deleteMessage(connectedChatId,id)" @edit-this-message = "(editedMessage) => editMessage(connectedChatId,id,editedMessage)" v-else :is="MessageFollowup" :user-id = "username" :message-info = "messageInfo" :key = "messageInfo"></component>
                        </li>
                    </ul>    
                </div>
                <div v-if="connectedChat.length > 0">
                    <InputForChat :connected-chat="connectedChat[0]"></InputForChat>
                </div>    
            </div>
            
            
            <div  @click ="shReqModal = false" v-if="shReqModal" class="  fixed inset-0 flex items-center justify-center z-50 bg-black/80">
                <FriendRequestsModal @click.stop=""  @accept-friend-req = "(id) => acceptFriendRequest(id)" @friend-req="(friendToAdd) => addFriend(friendToAdd)" :friend-req-list="pendingFriendRequest"></FriendRequestsModal>
            </div>

            <div @click ="shUsSetModal = false" v-if="shUsSetModal" class="fixed inset-0 flex items-center justify-center z-50 bg-black/80">
                <UserSettingsModal @upload-pfp="(file) => uploadPfp(file)" @click.stop="" ></UserSettingsModal>
            </div>
        </div>
</div>

</template>
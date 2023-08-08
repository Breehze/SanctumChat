<script setup>
    import { ref } from 'vue'
    import Friend from './Friend.vue';

    const props = defineProps(['friendReqList'])
    const emit = defineEmits(['friendReq','acceptFriendReq']) 
    
    
    const friendId = ref('')
    
</script>


<template>
<div class= " overflow-y-scroll bg-gray-800  rounded-lg shadow-lg p-6 w-5/12  h-1/2">
    <h1 class=" text-white font-bold text-3xl ">
        Manage requests
    </h1>
    <div class=" flex flex-row mt-3 "> 
        <div class=" w-1/2">
            <ul>
                <li  v-for="pending in props.friendReqList">
                    <Friend :friend-name="pending" :key="pending" ></Friend>
                    <div class="mt-2">
                        <button @click="emit('acceptFriendReq' , pending )" class=" w-1/3 border-green-400 border-2 text-green-400 p-1  rounded-md active:bg-gray-700 ">Accept</button>
                        <button class=" w-1/3 border-red-500 border-2 text-red-500 p-1 rounded-md ml-5 active:bg-gray-700">Reject</button>
                    </div>  
                </li>
            </ul>           
        </div>
        <div class=" w-1/2 mt-5 ml-3">
            <form @submit.prevent="emit('friendReq', friendId)">
                <input v-model="friendId" class="border-2 border-cyan-300 bg-slate-700 p-2 w-full rounded-lg mb-3" type="text" placeholder="Add friend!" autocomplete="off"/>
            </form>
        </div>    
    </div>
    
</div>
</template>
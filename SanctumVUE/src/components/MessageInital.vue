<script setup>
import {ref} from 'vue'

const props = defineProps(["userId","messageInfo"])
const emit = defineEmits(["deleteThisMessage","editThisMessage"])

const author = ref(Object.keys(props.messageInfo)[0])
const messageType = ref(props.messageInfo.message_type)
const timestamp =  new Date(props.messageInfo.timestamp*1000)
const date = ref(`${timestamp.getMonth()+1}/${timestamp.getDate()}/${timestamp.getFullYear()} ${timestamp.getHours()}:${timestamp.getMinutes()}`)
const content = ref(props.messageInfo[author.value])
const isHovered = ref(false)
const isInEditMode = ref(false)



</script>


<template>
    
    <div class="flex relative flex-row mt-5 hover:bg-white/5" @mouseover = "isHovered = true" @mouseleave="isHovered = false">
        <div :style="{backgroundImage : `url(http://127.0.0.1:8000/pfps/user/${ author })`}"  class="w-12 h-12 bg-[url('https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg')] bg-cover bg-center rounded-lg">

        </div>
        <div v-if="messageType === 'text'" class="ml-5">
            <div class="flex items-center">
                <h5 class="text-white font-semibold">{{ author }}</h5>
                <h5 class="text-gray-400/30 ml-5 text-xs">{{ date }}</h5>
            </div>    
            <h5 v-if = "!isInEditMode" class="text-gray-300"> {{ content  }}</h5>
            <form v-else @submit.prevent="emit('editThisMessage' , content) ; isInEditMode = false">
                <input v-model="content" class="border-2 border-cyan-300 bg-slate-700 p-2 w-full rounded-lg mb-3" type="text" id="messageText" autocomplete="off"/>
            </form>
        </div>

        <div v-else class="ml-5">
            <div class="flex items-center">    
                <h5 class="text-white font-semibold">{{ author }}</h5>
                <h5 class="text-gray-400/30 ml-5 text-xs">{{ date }}</h5>
            </div>
            <div class= " w-80 h-auto rounded-lg p-1" >
                <img class=" object-cover min-w-full rounded-lg" :src="`http://127.0.0.1:8000/${content}`">
            </div>
        </div>

        <div v-if = "isHovered && author === props.userId" class="absolute bottom-8 right-4 w-16 bg-gray-700 rounded-md">
            <button @click="emit('deleteThisMessage')" class="hover:bg-white/20 rounded-l-md">Del</button>
            <button @click="isInEditMode = true" class="hover:bg-white/20" >Edit</button>
        </div>
    </div>

</template>
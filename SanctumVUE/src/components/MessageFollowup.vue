<script setup>
import {ref} from 'vue'

const props = defineProps(["userId","messageInfo","messageId",])
const emit = defineEmits(["deleteThisMessage","editThisMessage"])

const author = ref(Object.keys(props.messageInfo)[0])
const messageType = ref(props.messageInfo.message_type)
const content = ref(props.messageInfo[author.value])
const timestamp =  new Date(props.messageInfo.timestamp*1000)
const date = ref(`${timestamp.getHours()}:${timestamp.getMinutes()}`)
const isHovered = ref(false)
const isInEditMode = ref(false)

</script>

<template>
    
    <div class="flex relative flex-row hover:bg-white/5" @mouseover = "isHovered = true" @mouseleave="isHovered = false">
        <div class="w-12">
            <h5 v-if="isHovered" class="text-gray-400/30 text-s">{{ date }}</h5>
        </div>
        <div v-if="messageType === 'text'" class="ml-5">
            <h5 v-if = "!isInEditMode" class="text-gray-300"> {{ content }}</h5>
            <form v-else @submit.prevent="emit('editThisMessage' , content) ; isInEditMode = false ;">
                <input v-model="content" class="border-2 border-cyan-300 bg-slate-700 p-2 w-full rounded-lg mb-3" type="text" id="messageText" autocomplete="off"/>
            </form>
        </div>
        
        <div v-else class="ml-5">
            <div class= " w-80 h-auto rounded-lg p-1" >
                <img class=" object-contain min-w-full rounded-lg" :src="`http://127.0.0.1:8000/${content}`">
            </div>
        </div>
        
        <div v-if = "isHovered && isInEditMode === false && author === props.userId " class="absolute bottom-3 right-4 w-16 bg-gray-700 rounded-md">
            <button @click="emit('deleteThisMessage')" class="hover:bg-white/20 rounded-l-md">Del</button>
            <button @click="isInEditMode = true" class="hover:bg-white/20" >Edit</button>
        </div>
    </div>  

</template>
<script setup>
    import { ref } from 'vue';
    const props = defineProps(['friendName','unreadMessages','friendActivity'])
    const showUnread = ref(false)

    const statuses = {
        "Online" : ['border-2', 'border-green-600'],
        "Offline" : ['border-2','border-gray-400']
    }

    const statusNow = ref(statuses[props.friendActivity])
    
    if (props.unreadMessages > 0) {
        showUnread.value = true
        console.log(showUnread.value)
    }

    
    

</script>


<template> 
        <button  class="flex relative items-center mt-5 hover:bg-gray-700 w-full rounded-md">
            <div :style="{backgroundImage : `url(http://127.0.0.1:8000/pfps/user/${ props.friendName })`}" :class="statusNow"  class="w-16 h-16 bg-cover bg-center rounded-lg bg-[url('https://i.pinimg.com/originals/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg')]"></div>
            <div v-if=" showUnread " class="absolute top-0 w-5 h-5 bg-red-600 bg-cover bg-center rounded-full text-white text-xs text-center">{{ props.unreadMessages }}</div>
            <h6 class="ml-5 text-white font-bold text-lg">{{ props.friendName }}</h6>
        </button>
</template>
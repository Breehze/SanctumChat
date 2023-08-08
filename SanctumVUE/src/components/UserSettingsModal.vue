<script setup>
import {ref} from 'vue'

const emit = defineEmits(['uploadPfp'])

const selectedFile = ref(null)

const getSelectedFile = (event) => {
    selectedFile.value = event.target.files[0]
} 


</script>


<template>
    
    <div class= " flex flex-row items-center justify-center bg-gray-800  rounded-lg shadow-lg p-6 w-5/12  h-1/2" >	
        <div class="">    
            <form class="border-2 p-1 rounded-md text-white" enctype="multipart/form-data">
                <input @change.prevent="getSelectedFile" type="file" name="file">
            </form>
        </div>

        <div>
            <button @click.prevent="emit('uploadPfp',selectedFile)" class="ml-5 text-cyan-400 border-cyan-400  border-2 rounded-md p-1 font-semibold "> Submit </button>
        </div>    
    </div>

</template>
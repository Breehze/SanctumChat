<script setup>

    import {ref} from 'vue'

    const props = defineProps(['connectedChat'])
    const messageField = ref('')
    const shAttachmentPreview = ref(false)
    const attachedFiles = ref([])

    function openFileSelect(){
            const sendImage = document.getElementById('send-image')
            sendImage.click()
        }

    const getFileSelected =  (event) =>{
            const selectedFile  = event.target.files[0]
            const reader = new FileReader()
            reader.readAsDataURL(selectedFile)
            
            reader.onload = () => {
                attachedFiles.value.push({ name : selectedFile.name, file: reader.result})
                shAttachmentPreview.value = true
                console.log(selectedFile.name)
                console.log(attachedFiles.value)
                
            }

            //console.log(selectedFile)
        }

    const sendSelectedFiles = () => {
        for (let i of attachedFiles.value) {
            const dataURLdestruct = i.file.split(',')
            const textEncoder = new TextEncoder()
            const mimeTypeEncoded = textEncoder.encode( JSON.stringify(dataURLdestruct[0].match(/:(.*?);/)[1]))
            const binStr = atob(dataURLdestruct[1])
            console.log(mimeTypeEncoded)
            const combinedLength = mimeTypeEncoded.length + binStr.length + 1

            const arrayBuffer = new ArrayBuffer(combinedLength)
            const viewArrayBuffer = new Uint8Array(arrayBuffer)
            
            viewArrayBuffer.set([mimeTypeEncoded.length])
            viewArrayBuffer.set(mimeTypeEncoded,1)

            for (let i = 0; i < binStr.length; i++) {
                viewArrayBuffer[mimeTypeEncoded.length + 1 + i] = binStr.charCodeAt(i);
            }
            
            console.log( arrayBuffer ) 
            props.connectedChat.send(arrayBuffer)
        }   
            
    }

    const sendMessage  = async(message) => {
        if (message.trim().length === 0){
            return "?" 
        }
        
        props.connectedChat.send(message)
    }

    const removeAttachedFile = (file) => {
        console.log(file)
        console.log(attachedFiles.value.indexOf(file))
        //delete attachedFiles.value[attachedFiles.value.indexOf(file)]
        attachedFiles.value.splice(attachedFiles.value.indexOf(file),1)
        if (attachedFiles.value.length === 0){
            shAttachmentPreview.value = false
        }
        
    }

</script>


<template>
    
    <div class=" flex flex-row   mx-5 "> 
        <form @change.prevent="getFileSelected" @submit.prevent="" class="hidden"  enctype="multipart/form-data">
            <input id="send-image" type="file">
        </form>
        <button @click=" openFileSelect" class=" text-white self-end flex-initial border-2 border-cyan-300 bg-slate-700 p-2 rounded-lg mb-3">
            Upload
        </button>
        <div class=" w-11/12" >
            <div v-if="shAttachmentPreview" class="">
                    <div class="flex flex-row border-2 border-b-0 border-cyan-300 flex-wrap bg-slate-700 p-2 w-full overflow-x-auto h-56  rounded-lg rounded-b-none ml-1">    
                            <div v-for="file in attachedFiles" :key="file" class=" flex relative text-white bg-gray-800/75 mb-3 mr-3 h-48 w-44 p-2 rounded-lg">
                                <div class="w-full h-40">
                                    <img class=" object-contain w-full h-full" id="image-preview"  :src="file.file" alt="Image Preview">
                                    <h1 class=" overflow-clip">{{file.name}}</h1>
                                </div>
                                <button @click="removeAttachedFile(file)" class=" text-red-500 text-xs font-extrabold absolute p-1 rounded-lg w-6 right-1 top-0.5 bg-white border-2 border-black hover:bg-gray-700">X</button>    
                            </div>         
                    </div>
                <form @submit.prevent=" sendSelectedFiles() ; sendMessage(messageField) ; messageField = '' ; shAttachmentPreview = false ; attachedFiles = []">
                    <input v-model="messageField" class=" text-white border-2 border-t-2 border-t-slate-500/25 border-cyan-300 bg-slate-700 p-2 w-full rounded-lg rounded-t-none mb-3 ml-1" placeholder="Aa" type="text" id="messageText" autocomplete="off"/>
                </form>    
            </div>
            <form v-else @submit.prevent=" sendMessage(messageField) ; messageField = '' ;" >
                <!--<textarea rows="1" v-model="messageField" class="text-white border-2  border-cyan-300 bg-slate-700 p-2 w-full rounded-lg mb-1 ml-1"></textarea>-->
                <input v-model="messageField" class=" text-white border-2  border-cyan-300 bg-slate-700 p-2 w-full rounded-lg mb-3 ml-1" placeholder="Aa" type="text" id="messageText" autocomplete="off"/>
            </form>
            
        </div>
    </div>

</template>
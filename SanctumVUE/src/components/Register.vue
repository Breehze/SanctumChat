<script setup>
    import { ref } from 'vue';
    
    const username = ref("")
    const password = ref("")
    const passwordRepeat = ref("")
   
    const submit = async() =>{
        await fetch(`http://127.0.0.1:8000/register/${username.value}`,{
            method: 'POST',
            headers : {'Content-Type' : 'application/json'},
            body: JSON.stringify({password : password.value})
        })
    }
</script>

<template>
    <input v-model="username" class = "h-16 rounded-xl bg-transparent border-2 border-gray-700 p-4 text-gray-300" type="" name="" placeholder="Username">
    <input v-model="password" class = "mt-3 h-16 rounded-xl bg-transparent border-2 border-gray-700 p-4 text-gray-300" type="password" name="" placeholder="Password">
    <input v-model ="passwordRepeat" class = "mt-3 h-16 rounded-xl bg-transparent border-2 border-gray-700 p-4 text-gray-300" type="password" name="" placeholder="Repeat password">
    <button @click="submit" class = "border-2 border-cyan-300 rounded-xl  mt-10 hover:bg-gray-700 text-cyan-300 h-16 text-xl">Register</button>
</template>
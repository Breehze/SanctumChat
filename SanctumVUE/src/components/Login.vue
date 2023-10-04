<script setup>
    import { ref } from 'vue';
    
    const username = ref("")
    const  password = ref("")
    
    
    
    const submit = async() =>{
        if(username.value.length == 0 && username.value.length == 0) {
            alert("You gotta login bitch !")
            return "a"

        }
        
        const response = await fetch("http://127.0.0.1:8000/login",{
            method: 'POST',
            headers : {'Content-Type' : 'application/x-www-form-urlencoded'},
            body: new URLSearchParams({
                'username': username.value ,
                'password': password.value,
                'grant_type': 'password'
             })
        })
        const responseJson = await response.json()
        localStorage.setItem("testAuth", responseJson.detail) //uncomment for dev
        localStorage.setItem("userid", username.value)    //uncomment for dev
        window.location.href = "/home"
    }
</script>

<template>
		<input v-model="username" type="" placeholder="Username" class="h-16 rounded-xl bg-transparent border-2 border-gray-700 p-4 text-gray-300">
        <input v-model="password" id= "password" type="password" placeholder="Password" class="mt-3 h-16 rounded-xl bg-transparent border-2 border-gray-700 p-4 text-gray-300">
        <button @click="submit"  class="border-2 border-cyan-300 rounded-xl  mt-10 hover:bg-gray-700 text-cyan-300 h-16 text-xl" >Login</button>
</template>
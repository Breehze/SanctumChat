<script setup>
    import Login from "../components/Login.vue"
    import Register from "../components/Register.vue"
	import { ref } from "vue";
	const toggleLogin = ref(true)
	
</script>

<template>
    <div class="flex justify-center items-center h-screen bg-gray-700" >
	    <div class="flex flex-row rounded-xl bg-gray-800 w-8/12 h-5/6">
	    	<div class="flex flex-col justify-center items-center w-1/2">
	    		<div class="flex flex-row space-x-8 w-8/12" >
	    			<div :class=" toggleLogin ? ' text-cyan-600 border-cyan-600' : ''"   class="text-center text-3xl w-44 text-cyan-300 border-b-4  border-cyan-300 hover:border-cyan-600 hover:text-cyan-600">
                        <button @click="toggleLogin = true" >Login</button>
                    </div>
              		<div :class=" toggleLogin ? '' : 'text-cyan-600 border-cyan-600'" class="text-center text-3xl w-44 text-cyan-300 border-b-4 border-cyan-300 hover:border-cyan-600 hover:text-cyan-600">
                        <button  @click="toggleLogin = false">Register</button>
                    </div>
	    		</div>
	    		<div class="flex flex-col w-8/12 my-14 ">
                    <component v-if="toggleLogin" :is="Login"></component>
					<component v-else :is="Register"></component>
	    		</div>	
	    	</div>
	    	<div style="background-image: url(http://127.0.0.1:8000/static/xdd.png);" class="w-1/2  bg-cover bg-center rounded-r-xl"></div>
	    </div>	
    </div>
</template>
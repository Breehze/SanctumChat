import { createRouter ,createWebHistory } from "vue-router";
import LoginRegister from "../pages/LoginRegister.vue"
import Home from "../pages/Home.vue"
const router = createRouter({
    history : createWebHistory(import.meta.env.BASE_URL),
    routes : [
        {
            path : "/",
            name : "Login",
            component : LoginRegister
        },
        {
            path : "/home",
            name : "Home",
            component : Home
        },

    ]
})

export default router
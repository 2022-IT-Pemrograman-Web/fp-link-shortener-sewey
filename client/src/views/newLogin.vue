<template>
    <div class="w-full flex flex-wrap">

        <!-- Login Section -->
        <div class="w-full md:w-2/5 flex flex-col">

            <div class="flex justify-center md:justify-start pt-12 md:pl-12 md:-mb-12">
                <a href="/" class="bg-black block mt-4 lg:inline-block lg:mt-0 text-white hover:text-white font-semibold text-2xl p-4">Sew.ey</a>
            </div>

            <div class="flex flex-col justify-center md:justify-start my-auto pt-8 md:pt-0 px-8 md:px-24 lg:px-32">
                <p class="text-center text-3xl">Welcome.</p>
                <form class="flex flex-col pt-3 md:pt-8" onsubmit="event.preventDefault();">
                    <div class="flex flex-col pt-4">
                        <label for="email" class="text-lg">Email</label>
                        <input v-model="email" type="email" id="email" placeholder="your@email.com" class="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
    
                    <div class="flex flex-col pt-4">
                        <label for="password" class="text-lg">Password</label>
                        <input v-model="password" type="password" id="password" placeholder="Password" class="shadow-md appearance-none border rounded w-full py-2 px-3 text-gray-700 mt-1 leading-tight focus:outline-none focus:shadow-outline">
                    </div>
                    <h3 id="validation" class="text-red-500 mt-2"></h3>
                    <input @click="userLogin" type="submit" value="Log In" class="bg-black text-white font-bold text-lg hover:bg-gray-700 p-2 mt-8 transition ease-in-out duration-[150ms]">
                </form>
                <div class="text-center pt-12 pb-12">
                    <p>Don't have an account? <a href="/register" class="underline font-semibold">Register here.</a></p>
                </div>
            </div>
        </div>

        <!-- Image Section -->
        <div class="w-3/5 shadow-2xl h-screen bg-[url('/assets/seweyhomepage.jpg')] bg-fixed bg-cover bg-no-repeat">
            <!-- <img class="object-cover w-full h-screen hidden md:block" src="../assets/seweyhomepage.jpg"> -->
        </div>
    </div>
</template>

<script>
    import { auth } from "../firebase.js"
    import axios from 'axios'

    export default{
        data() {
            return{
                name: '',
                email: '',
                password: ''
            }
        },
        beforeMount() {
            this.check()
        },
        mounted() {
            setTimeout(() => {document.getElementById('validation').innerHTML = ''}, 750)
        },
        methods:
        {
            async userLogin() {  

                const res = await axios.post("http://localhost:8000/api/login", {
                    email: this.email,
                    password: this.password
                })
                .then((response)=>{
                    console.log(response)
                    const userId = response.data.uid
                    const userEmail = response.data.email
                    if(response.data.code == "auth/wrong-password")
                    {
                        this.$router.push("/login")
                        document.getElementById('validation').innerHTML = "Wrong password"
                    }
                    else if (response.data.code == "auth/user-not-found")
                    {
                        this.$router.push("/login")
                        document.getElementById('validation').innerHTML = "No registered email found"
                    }
                    else if (response.data.code == "auth/network-request-failed")
                    {
                        this.$router.push("/login")
                        document.getElementById('validation').innerHTML = "No internet connection"
                    }
                    else if (response.data.code == "auth/invalid-email")
                    {
                        this.$router.push("/login")
                        document.getElementById('validation').innerHTML = "Invalid email"
                    }
                    else
                    {
                        localStorage.setItem('userToken', userId)
                        localStorage.setItem('userEmail', userEmail)
                        this.$router.push("/dashboard")
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
            },
            check() {
                if (localStorage.getItem('userToken') != null) {
                    this.$router.push('/dashboard')
                }
                else
                {
                    return;
                }
            }
        }
    }
</script>
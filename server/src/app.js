import { getFirestore, query, collection, doc, onSnapshot, addDoc, deleteDoc, updateDoc, where, connectFirestoreEmulator } from "firebase/firestore";
import { adminAuth } from "../config/database.js"
import { auth, db } from "./firebase.js"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import express from 'express'
// const express = require('express')
const app = express()
import cors from 'cors'
// const cors = require("cors")
const port = 8000

app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: true }))

app.listen(port, () => {
    console.log("Listening to port 8000");
})

app.get("/api/links", async (req, res) => {
    const uid = req.query.uid
    try {
        const links = [];
        const q = query(collection(db, "links"), where("uid", "==", uid));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                let id = doc.id;
                links.push({ id, ...data });
            });
            res.send(links)
        });
    }
    catch (error) {
        console.log(error)
    }
})

app.get("/api/redirectLink", async (req, res) => {
    const url = req.query.url
    console.log(url)
    try
    {
        const q = query(collection(db, "links"), where("customPath", "==", url))
        onSnapshot(q, (querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if (doc == null || doc === null) 
                {
                    console.log("Cannot find associated link")
                    res.send("Cannot find associated link")
                }
                else
                {
                    const docData = doc.data()
                    const link = docData.realLink
                    console.log(link)
                    // window.location.replace(docData.realLink)
                    res.send(link)
                }
            });
        })
    }
    catch(err)
    {
        console.log(err)
    }
})

app.post("/api/login", async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    try {
        await signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                userCredential.user.getIdTokenResult()
                    .then((token) => {
                        console.log(token)
                        adminAuth.verifyIdToken(token.token)
                            .then((decodedToken) => {
                                console.log(decodedToken)
                                res.send(decodedToken)
                            })
                    })
            })
    }
    catch (err) {
        res.send(err)
    }
})

app.post("/api/logout", async (req, res) => {
    try
    {
        signOut(auth).then((cons) => {
            console.log(cons)
            res.send(cons)
        })
    }
    catch(err)
    {
        console.log(err)
    }
})

app.post("/api/register", async (req, res) => {
    let email = req.body.email
    let password = req.body.password
    try {
        await createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                res.send(userCredential)
            })
    }
    catch (err) {
        res.send(err)
    }
})

app.post("/api/addLink", async (req, res) => {
    const uid = req.body.uid
    const domain = req.body.domain
    const realLink = req.body.realLink
    const customPath = req.body.customPath
    const shortenedLink = domain.concat(customPath)
    console.log(realLink)
    console.log(customPath)
    console.log(shortenedLink)
    try {
        const docRef = await addDoc(collection(db, "links"), {
            realLink: realLink,
            customPath: shortenedLink,
            uid: uid
        })
        res.send({message: "Link succesfully added"})
    }
    catch (err) {
        console.log(err)
    }
})

app.post("/api/update", async (req, res) => {
    const newCustomPath = req.body.newCustomPath
    const uid = req.body.uid
    const docRef = doc(db, "links", uid)

    try {
        await updateDoc(docRef, {
            customPath: newCustomPath
        })
        res.send({message: "Succesfully edited"})
    }
    catch(err)
    {
        console.log(err)
    }
})
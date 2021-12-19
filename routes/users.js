const router = require("express").Router();
const User = require("../model/User");
const express = require("express");
const md5 = require("md5");

//for register
router.post('/register', async (req, res) => {
    console.log(" tryin to post ");
    try {
        const email = req.body.email;
        const password = md5(req.body.password);
        const username = req.body.username;
        const newUser = new User({
            email: email,
            password: password,
            username: username
        });
        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    } catch (err) {
        console.log("err is ", err)
        res.status(500).json(err);
    }
});

//for login

router.post('/login', async (req, res) => {
    try {
        const username = req.body.username;
        const password = md5(req.body.password);
        User.findOne({
            username: username
        }, (err, foundUser) => {
            if (err) {
                console.log(err);
            } else {
                if (foundUser) {
                    if (foundUser.password === password) {
                        res.send("found");
                    } else {
                        res.send("wrong password");
                    }
                } else {
                    res.send("not found");
                }
            }
        })
    } catch (err) {
        console.log(err);
    }
});

module.exports = router;
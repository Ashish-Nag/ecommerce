// dependencies
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// routes 
router.get('/', async (req, res) => {
    const userList = await User.find().select("name email phone");

    if (!userList) return res.status(400).json({ success: false, msg: "No User yet" });

    res.json(userList)
});

// Create user, can be used by admin
router.post('/', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        pin: req.body.pin,
        apartment: req.body.apartment,
        street: req.body.street,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if (!user) return res.status(400).json({ success: false, msg: "could not create a new User" });

    res.json(user)
});

// get Sigle user
router.get('/:id', async (req, res) => {
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) return res.status(404).json({ success: false, msg: "no user found" });
    res.status(200).json(user);
});

// Update user data
router.put('/:id', async (req, res) => {

    const existingUser = await User.findById(req.params.id);
    let newPassword;

    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
        newPassword = existingUser.passwordHash;
    }
    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            pin: req.body.pin,
            apartment: req.body.apartment,
            street: req.body.street,
            city: req.body.city,
            country: req.body.country
        },
        { new: true }
    );
});

// login user
router.post('/login', async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return res.status(400).json({ success: false, msg: "User not found" });
    }

    let secret = process.env.SECRET;
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin
            },
            secret,
            { expiresIn: '1d' }
        );
        return res.status(200).json({ success: true, msg: "Logged in successfully", user: user.email, token: token });
    }
    res.status(400).json({ success: false, msg: "Password incorrect" });
});

// Register User, to be used by the user
router.post('/register', async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        pin: req.body.pin,
        apartment: req.body.apartment,
        street: req.body.street,
        city: req.body.city,
        country: req.body.country
    });

    user = await user.save();

    if (!user) return res.status(400).json({ success: false, msg: "could not create a new User" });

    res.json(user)
});

// get user count
router.get('/get/count', async (req, res) => {
    const userCount = await User.countDocuments();

    if (!userCount) return res.status(500).json({ success: false, msg: "no users yet" });
    res.status(200).json({ userCount })
})

// Delete User 
router.delete('/:id', (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then(user => {
            if (!user) return res.status(404).json({ success: false, msg: "User not found" })
            else return res.status(200).json({ success: true, msg: "User deleted successfully" })
        })
        .catch(e => res.status(500).json({ success: false, error: e }));
});
// exports
module.exports = router;
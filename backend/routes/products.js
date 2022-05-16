// dependencies
const express = require('express')
const Product = require('../models/product')

const router = express.Router();

// todo delte the below routes
router.get('/', async (req, res) => {
    const prodList = await Product.find();

    if (!prodList) return res.status(500).json({ Err: "Server error" })
    res.json(prodList);
});

router.post('/', (req, res) => {
    const prod = new Product({
        name: req.body.name,
        image: req.body.image,
        countInStock: req.body.count
    })

    prod.save().then((createdProd => {
        res.status(201).json(createdProd)
    })).catch((err) => {
        res.status(500).json(err)
    });
})


module.exports = router;
// dependencies
const mongoose = require('mongoose');
const express = require('express');
const Category = require('../models/category');
const Product = require('../models/product')

const router = express.Router();

// routes
router.get('/', async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }
    const prodList = await Product.find(filter).populate('category');

    if (!prodList) return res.status(500).json({ Err: "Server error" })
    res.json(prodList);
});

router.post('/', async (req, res) => {

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).json({ success: false, msg: "Invalid Category" });


    let prod = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        countInStock: req.body.countInStock
    })

    prod.save().then((createdProd => {
        res.status(201).json(createdProd)
    })).catch((err) => {
        res.status(500).json(err)
    });
})

router.get('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, msg: "invalid product id" });
    const prod = await Product.findById(req.params.id).populate('category');

    if (!prod) return res.status(400).json({ success: false, msg: "Product not found" })

    res.status(200).json(prod)

})

// update product 

router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, msg: "invalid product id" });
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).json({ success: false, msg: "Category invalid" });

    const prod = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            price: req.body.price,
            category: req.body.category,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured,
            countInStock: req.body.countInStock
        },
        { new: true }
    );

    if (!prod) return res.status(500).json({ success: false, msg: "could not update the product" });

    res.json(prod);
});

// delete the product

router.delete('/:id', (req, res) => {
    Product.findByIdAndDelete(req.params.id)
        .then(prod => {
            if (prod) return res.status(200).json({ success: true, msg: "Product delted successfully" })
            else return res.status(404).json({ success: false, msg: "Could not find the product" })
        })
        .catch(e => res.status(500).json({ success: false, msg: e.message }));
});

router.get('/get/count', async (req, res) => {
    try {
        const productCount = await Product.countDocuments();
        if (!productCount) return res.status(500).json({ success: false, msg: "no documents found or internal server error" });

        res.json({ productCount });
    } catch (e) {
        return res.status(400).json({ success: false, msg: e.message });
    }

});

router.get('/get/featured/:count', async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const products = await Product.find({ isFeatured: true }).limit(+count);

    if (!products) return res.status(404).json({ success: false, msg: "No featured Product found" });

    res.json(products)
})

module.exports = router;
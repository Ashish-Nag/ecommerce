// dependencies
const mongoose = require('mongoose');
const express = require('express');
const multer = require('multer');
const Category = require('../models/category');
const Product = require('../models/product')

const router = express.Router();

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpg': 'jpg',
    'image/jpeg': 'jpeg'
};
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValidFile = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('Invalid image type');

        if (isValidFile) uploadError = null;
        cb(uploadError, './public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });
// console.log(uploadOptions.destination)

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

router.post('/', uploadOptions.single('image'), async (req, res) => {

    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).json({ success: false, msg: "Invalid Category" });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, msg: "No Image found for upload" });
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let prod = new Product({
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        isFeatured: req.body.isFeatured,
        countInStock: req.body.countInStock
    });

    prod.save().then((createdProd => {
        res.status(201).json(createdProd);
    })).catch((err) => {
        res.status(500).json(err);
    });
});

router.get('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, msg: "invalid product id" });
    const prod = await Product.findById(req.params.id).populate('category');

    if (!prod) return res.status(400).json({ success: false, msg: "Product not found" });

    res.status(200).json(prod);

});

// update product 
router.put('/:id', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, msg: "invalid product id" });
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).json({ success: false, msg: "Category invalid" });

    const product = await Product.findById(req.params.id);
    if (!product) return res.status(400).json({ success: false, msg: "could not find the product" });

    const file = req.file;
    let imagePath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
        imagePath = `${basePath}${fileName}`;
    } else {
        imagePath = product.image;
    }
    const prod = await Product.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: imagePath,
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
});

// upload multiple images for a product.


router.put('/galleryimages/:id', uploadOptions.array('images', 5), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, msg: 'The id is not valid' });
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    if (files) {
        files.map(file => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(400).json({ success: false, msg: "The product cannot be updated" });

    return res.status(200).json(product);
});

module.exports = router;
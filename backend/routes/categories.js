// dependencies
const express = require('express');
const Category = require('../models/category');

const router = express.Router();

router.get('/', async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) return res.status(500).json({ success: false, msg: "Internal server Error" });
    res.status(200).json(categoryList)
});

router.get('/:id', async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) return res.status(400).json({ success: false, msg: "Could not find the category" })
    res.status(200).json(category)
})
router.post('/', async (req, res) => {
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    });

    category = await category.save();

    if (!category) return res.status(400).json({ msg: "The category could not be created" });

    res.json(category);
})

router.delete('/:id', (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then(category => {
            if (category) {
                return res.status(200).json({ success: true, message: 'The Category has been successfully deleted' })
            } else {
                return res.status(404).json({ success: false, msg: "Category not found" })
            }
        }).catch(e => {
            return res.status(400).json({ success: false, msg: e.message })
        })
});

router.put('/:id', async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        }, {
        new: true
    }
    )

    if (!category) return res.status(400).json({ success: false, msg: "Could not update the Category" });

    res.status(200).json(category);
})

module.exports = router;
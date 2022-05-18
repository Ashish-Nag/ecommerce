// dependencies
const express = require('express');
const order = require('../models/order');
const Order = require('../models/order');
const { OrderItem } = require('../models/orderItem');

// invoking the router
const router = express.Router();

// Routes 
// Get all orders
router.get('/', async (req, res) => {
    let orderList;
    try {
        orderList = await Order.find().populate('user', 'name');

    } catch (error) {
        console.log(error.message)
        return res.status(500).json(error.message)
    }

    if (!orderList) return res.status(400).json({ success: false, msg: "no orders yet" });

    res.status(200).json(orderList);
});

// get specific Orders
router.get('/:id', async (req, res) => {
    let order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems', populate: {
                path: 'product', populate: 'category'
            }
        });

    if (!order) return res.status(400).json({ success: false, msg: "no such order found" })

    res.status(200).json(order);
});

// post route
router.post('/', async (req, res) => {

    const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity,
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();
        return newOrderItem.id;
    })).then((data) => data);

    const resolvedIds = await orderItemsIds;

    const totalPrices = await Promise.all(resolvedIds.map(async orderItemId => {
        const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
        const totalPrice = orderItem.product.price * orderItem.quantity;

        return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

    let order = new Order({
        orderItems: resolvedIds,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        country: req.body.country,
        pin: req.body.pin,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    });

    order = await order.save();

    if (!order) return res.status(500).json({ success: false, msg: "Could not create an order" });

    res.status(201).json(order);
});

// update the status
router.put('/:id', async (req, res) => {
    let order = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: req.body.status
        },
        { new: true }
    );

    if (!order) return res.status(400).json({ success: false, msg: "no such ID or something went wrong" });

    res.status(200).json(order);
});

// Delete the order
router.delete('/:id', async (req, res) => {
    Order.findByIdAndDelete(req.params.id)
        .then(async order => {
            if (order) {
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndDelete(orderItem);
                });

                return res.status(200).json({ success: true, msg: "deleted item and orderItems" })
            } else return res.status(400).json({ success: false, msg: "could not delete, something went wrong" });
        })
        .catch(e => {
            console.log(e);
            return res.status(400).json({ success: false, msg: "could not find, wrong id" });
        });
});

// get total sales
router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalSales: { $sum: '$totalPrice' } } }
    ]);

    if (!totalSales) return res.status(400).json({ success: false, msg: "No sales" });

    return res.status(200).json({ total: totalSales.pop().totalSales });
});

// Get Order Count
router.get('/get/count', async (req, res) => {
    const orderCount = await Order.countDocuments();

    if (!orderCount) return res.status(404).json({ success: false, msg: "no Orders" });
    return res.status(200).json({ orders: orderCount });
});

// get order for specific user 
router.get('/get/userorders/:userid', async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid }).populate({
        path: 'orderItems', populate: {
            path: 'product', populate: 'category'
        }
    }).sort({ 'dateOrdered': -1 });

    if (!userOrderList) return res.status(400).json({ success: false, msg: "no Orders yet" });

    return res.status(200).json(userOrderList);
});
// Exports
module.exports = router;
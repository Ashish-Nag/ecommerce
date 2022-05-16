require('dotenv').config()
const express = require('express')
const app = express()

const port = process.env.PORT || 300
app.get('/', (req, res) => {
    res.send("api for our angular app")
})


app.listen(port, () => console.log(`The server is running on Port ${port}`))
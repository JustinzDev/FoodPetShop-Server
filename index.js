const express = require('express')
require('dotenv').config()
const dbconnection = require('./db')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 4000

const itemRoutes = require('./routes/items')
const userRoutes = require('./routes/users')

//connection
dbconnection()

//middlewares
app.use(express.json())
app.use(cors())
app.use(express.urlencoded({ extended: false }))

//routes
app.use('/api/items', itemRoutes)
app.use('/api/users', userRoutes)

app.listen(port, console.log(`Server is runnung ${port}`))
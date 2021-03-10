//importing api's
const express = require('express')
const Users = require('./routes/usersRoute')
const Auth  = require('./routes/authRoute')
const Notification = require('./routes/notificationsRoute')
const Dashboard = require('./routes/dashboardRoute')

module.exports = function(app){
//look for dependency
//Middlware
app.use(express.json())

app.use('/api/users',Users)
app.use('/api/auth',Auth)
app.use('/api/dashboard',Dashboard)
app.use('/api/notifications',Notification)

// app.use(error)


}
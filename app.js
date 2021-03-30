const express = require('express')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
require('dotenv').config()

const Index = require('./routes/index')
const Webhook = require('./routes/webhook')

const app = express()
const admin = require('firebase-admin')

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            'projectId': process.env.FIREBASE_PROJECT_ID,
            'private_key': process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            'client_email': process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    })
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(cookieParser())

app.use('/', Index)
app.use('/webhook', Webhook)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next({
        statusCode: 404,
        status: 'error',
        message: 'Not found.'
    })
})

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500  // if no statusCode is defined, then use HTTP500
    err.status = err.status || 'error'
    console.log(err)
    // return error status and message to the requester
    res.status(err.statusCode).json({
        code: err.code,
        msg: err.message,
    })
})

module.exports = app

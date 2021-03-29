const express = require('express')
const router = express.Router()
const LineBot = require('../controller/LineBot')
const ChannelMiddleware = require('../middleware/channel')

router.post('/line/bot/:botName', LineBot.ReplyMessages)

router.post('/line/bot2/:botName', ChannelMiddleware, LineBot.ReplyMessages2)

module.exports = router

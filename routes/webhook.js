const express = require('express')
const router = express.Router()
const LineBot = require('../controller/LineBot')
const ChannelMiddleware = require('../middleware/channel')

router.post('/line/bot/:botName', ChannelMiddleware, LineBot.ReplyMessages)
router.post('/line/push', LineBot.SendMessage)
router.post('/line/reply', LineBot.SendReplyMessage)

module.exports = router

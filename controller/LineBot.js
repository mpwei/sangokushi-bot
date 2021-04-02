const LineBot = require('@line/bot-sdk')
const admin = require('firebase-admin')
const LineModules = require('../modules/LineBot')
const {FilterCharacter} = require('../modules/Public')
const Bot = new LineBot.Client({
	channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
})

module.exports = {
	ReplyMessages: (req, res, next) => {
		console.log(JSON.stringify(req.body.events))
		const Events = req.body.events
		const ReplyPromise = []
		Events.forEach(async (event) => {
			switch (event.type) {
				case 'message':
					if (event.message.type === 'text') {
						event.message.text = FilterCharacter(event.message.text)

						const CombineCommand = await admin.database().ref(`replyMessage/${event.type}/combinedCommand`).once('value').then((snapshot) => {
							return snapshot.val()
						})

						const FilterCombineCommand = Object.keys(CombineCommand).filter((command) => {
							return event.message.text.indexOf(command) !== -1
						})

						let Command
						if (FilterCombineCommand.length > 0) {
							event.message.text = event.message.text.replace(FilterCombineCommand[0], '')
							console.log(event.message.text)
							console.log(FilterCombineCommand[0])
							Command = LineModules[CombineCommand[FilterCombineCommand[0]]](event).then((message) => {
								return Bot.replyMessage(event.replyToken, message).then(() => true).catch((error) => {
									throw error
								}).catch((error) => {
									throw error
								})
							})
						} else {
							Command = admin.database().ref(`replyMessage/${event.type}/command/${event.message.text}`).once('value').then((snapshot) => {
								if (snapshot.exists()) {
									const Data = snapshot.val()
									if (Data.type === 'function') {
										return LineModules[Data.action](event).then((message) => {
											return Bot.replyMessage(event.replyToken, message).then(() => true).catch((error) => {
												throw error
											})
										}).catch((error) => {
											throw error
										})
									} else {
										return Bot.replyMessage(event.replyToken, Data).then(() => true).catch((error) => {
											throw error
										})
									}
								}
							})
						}
						ReplyPromise.push(Command)
					}
					break
				case 'join':
				case 'follow':
				case 'memberJoined':
					const Command = admin.database().ref(`replyMessage/join/message`).once('value').then((snapshot) => {
						if (snapshot.exists()) {
							return Bot.replyMessage(event.replyToken, snapshot.val()).then(() => true).catch((error) => {
								throw error
							})
						}
					})
					ReplyPromise.push(Command)
					event.joined.members.forEach((userData) => {
						event.source.userId = userData.userId
						ReplyPromise.push(LineModules.GetProfile(event).then((profile) => {
							return LineModules.CreateMember(profile, event)
						}).catch((error) => {
							throw error
						}))
					})
					break
				case 'leave':
				case 'memberLeft':
				case 'unfollow':
					ReplyPromise.push(Bot.pushMessage(event.source.groupId, {
					    type: 'text',
					    text: "感謝兄弟為古武付出的一切努力，希望我們有緣能再見！"
					}))
					break
			}
		})
		return Promise.all(ReplyPromise).then(() => {
			return res.send('OK')
		}).catch((error) => {
			return next({
				Code: 'BOT-C-001',
				Status: 501,
				Message: error
			})
		})
	},
	SendMessage: (req, res, next) => {
		return Bot.pushMessage(req.body.targetId, req.body.message).then(() => {
			return res.send('OK')
		}).catch((error) => {
			return next({
				Code: 'BOT-C-002',
				Status: 501,
				Message: error
			})
		})
	},
	SendReplyMessage: (req, res, next) => {
		return Bot.replyMessage(req.body.replyToken, req.body.message).then(() => {
			return res.send('OK')
		}).catch((error) => {
			return next({
				Code: 'BOT-C-002',
				Status: 501,
				Message: error
			})
		})
	},
	BulkSendMessage: (req, res, next) => {
		return res.send('OK')
	}
}


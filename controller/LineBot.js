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
						const Command = admin.database().ref(`replyMessage/${event.type}/command/${event.message.text}`).once('value').then((snapshot) => {
							if (snapshot.exists()) {
								const Data = snapshot.val()
								if (Data.type === 'function') {
									return LineModules.GetProfile(event).then((message) => {
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
						ReplyPromise.push(Command)
					}
					break
				case 'join':
				case 'follow':
				case 'memberJoined':
					const Command = admin.database().ref(`replyMessage/join/command/message`).once('value').then((snapshot) => {
						if (snapshot.exists()) {
							const ReplyMessagePromise = []
							ReplyMessagePromise.push(Bot.replyMessage(event.replyToken, snapshot.val()))
							return Promise.all(ReplyMessagePromise).then(() => true).catch((error) => {
								throw error
							})
						}
					})
					const CreateUser = LineModules.GetProfile(event).then((profile) => {
						return LineModules.CreateMember(profile)
					}).catch((error) => {
						throw error
					})
					ReplyPromise.push(Command, CreateUser)
					break
				case 'leave':
				case 'memberLeft':
				case 'unfollow':
					// const Profile = await Bot.getProfile(event.left.members[0].userId).then((profile) => {
					//     return profile
					// })
					// ReplyPromise.push(Bot.pushMessage(event.source.groupId, {
					//     type: 'text',
					//     text: "感謝兄弟為古武付出的一切努力，希望我們有緣能再見！"
					// }))
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


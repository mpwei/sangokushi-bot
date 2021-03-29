const admin = require('firebase-admin')

const CheckChannelPermission = (type = 'group', id) => {
	return admin.database().ref(type + '/' + id).once('value').then((snapshot) => {
		if (snapshot.exists()) {
			return !!snapshot.val().status
		} else {
			return false
		}
	}).catch((error) => {
		throw error
	})
}

module.exports = (req, res, next) => {
	console.log(JSON.stringify(req.body.events))
	const Events = req.body.events
	const WebhookData = []
	Events.forEach(async (event) => {
		let ID
		const MessageSource = event.source

		switch (MessageSource.type) {
			case 'user':
				ID = MessageSource.userId
				break
			case 'group':
				ID = MessageSource.groupId
				break
			case 'room':
				ID = MessageSource.roomId
				break
		}

		let MessageText, MessageType
		const permission = await CheckChannelPermission(MessageSource.type, ID)

		switch (event.type) {
			case 'message':
				MessageType = event.message.type
				MessageText = event.message.text
				if (MessageType === 'text') {
					MessageText = MessageText.replace('！', '!')
					if (MessageText.indexOf('!') === -1) {
						return res.send('OK')
					}
				}
				break
			case 'unsend':
			case 'follow':
			case 'unfollow':
			case 'join':
			case 'leave':
			case 'memberJoined':
			case 'memberLeft':
			case 'postback':
			case 'videoPlayComplete':
			case 'beacon':
			case 'accountLink':
			case 'things': //LINE Things
				break
			default:
				return next({
					code: 'BOT-M-001',
					statusCode: 401,
					message: 'Forbidden'
				})
		}

		WebhookData.push({
			eventType: event.type,
			message: MessageText.replace('!', '') || '',
			source: MessageSource,
			permission,
		})
		console.log(WebhookData)
	})

	req.body.webhookData = WebhookData
	return next()
}

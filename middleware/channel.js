const admin = require('firebase-admin')
const axios = require('axios')

const CheckChannelPermission = (id, event) => {
	return admin.database().ref(event.source.type + '/' + id).once('value').then((snapshot) => {
		if (snapshot.exists()) {
			return {
				...event,
				status: !!snapshot.val().status
			}
		} else {
			return {
				...event,
				status: false
			}
		}
	}).catch((error) => {
		throw error
	})
}

module.exports = (req, res, next) => {
	console.log(JSON.stringify(req.body.events))
	const Events = req.body.events
	const ResolvePermission = Events.map(async (event) => {
		let ID
		switch (event.source.type) {
			case 'user':
				ID = event.source.userId
				break
			case 'group':
				ID = event.source.groupId
				break
			case 'room':
				ID = event.source.roomId
				break
		}

		return CheckChannelPermission(ID, event)
	})

	return Promise.all(ResolvePermission).then((result) => {
		req.body.events = result.filter(data => data.status === true)
		const Reject = result.filter(data => data.status === false && data.type === 'message' && data.message.text.replace('！', '!').indexOf('!') !== -1).map((event) => {
			return axios.post(process.env.BASE_URL + '/webhook/line/reply', {
				replyToken: event.replyToken,
				message: {
					type: 'text',
					text: '主公您好，您目前沒有軍令可以使用神兵，請輸入啟動碼得以招喚神兵，或與工程團隊聯繫。\n\nLineID: mailerbx\nEmail: mailermpwei@gmail.com\nIssue Report: https://github.com/mpwei/sangokushi-bot/issues'
				}
			})
		})
		return Promise.all(Reject).then(() => {
			return next()
		}).catch((error) => {
			return next({
				Code: 'BOT-M-001',
				Status: 501,
				Message: error
			})
		})
	})
}

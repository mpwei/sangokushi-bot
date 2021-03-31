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

		return CheckChannelPermission(ID, event)
	})

	return Promise.all(ResolvePermission).then((result) => {
		console.log(result)
		req.body.events = result.filter(data => data.status === true)
		return next()
	})
}

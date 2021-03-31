module.exports = {
	FilterCharacter (text) {
		return text.replace('！', '!')
			.replace('/', '')
			.replace('.', '')
			.replace('#', '')
			.replace('$', '')
			.replace('[', '')
			.replace(']', '')
	}
}

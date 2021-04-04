module.exports = {
	FilterCharacter (text) {
		return text.replace('！', '!')
			.replace(/\s/g, '')
			.replace(/\//g, '')
			.replace(/\./g, '')
			.replace(/#/g, '')
			.replace(/\$/g, '')
			.replace(/\[/g, '')
			.replace(/]/g, '')
			.replace(/\\n/g, '')
	}
}

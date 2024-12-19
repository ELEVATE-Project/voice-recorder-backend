const recordingsService = require('@services/recordings')

module.exports = class Recording {
	async create(req) {
		try {
			return await recordingsService.create(req.body)
		} catch (error) {
			return error
		}
	}
}

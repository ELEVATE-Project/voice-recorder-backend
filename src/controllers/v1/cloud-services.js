const filesService = require('@services/files')

module.exports = class CloudServices {
	/**
	 * Get Signed Url
	 * @method
	 * @name getSignedUrl
	 * @param {JSON} req  request body.
	 * @returns {JSON} Response with status message and result.
	 */
	async getSignedUrl(req) {
		try {
			const signedUrlResponse = await filesService.getSignedUrl(
				req.query.fileName,
				req.query.dynamicPath ? req.query.dynamicPath : '',
				req.query.public && req.query.public == 'true' ? true : false
			)
			return signedUrlResponse
		} catch (error) {
			return error
		}
	}

	/**
	 * Get downlodable Url
	 * @method
	 * @name getDownloadableUrl
	 * @param {JSON} req  request body.
	 * @returns {JSON} Response with status message and result.
	 */
	async getDownloadableUrl(req) {
		try {
			return await filesService.getDownloadableUrl(
				req.query.filePath,
				req.query.public && req.query.public == 'true' ? true : false
			)
		} catch (error) {
			return error
		}
	}
}

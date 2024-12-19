const common = require('@constants/common')
const utils = require('@generics/utils')
const { cloudClient } = require('@configs/cloud-service')


module.exports = class FilesHelper {
	static async convertExpiryTimeToSeconds(expiryTime) {
		expiryTime = String(expiryTime)
		const match = expiryTime.match(/^(\d+)([m]?)$/)
		if (match) {
			const value = parseInt(match[1], 10) // Numeric value
			const unit = match[2]
			if (unit === 'm') {
				return Math.floor(value / 60)
			} else {
				return value
			}
		}
	}
	static async getSignedUrl(bucketName, destFilePath, actionType = common.WRITE_ACCESS, expiryTime = '') {
		try {
			let updatedExpiryTime = await this.convertExpiryTimeToSeconds(expiryTime)
			const signedUrl = await cloudClient.getSignedUrl(
				bucketName, //BucketName
				destFilePath, //FilePath
				updatedExpiryTime, //Expiry
				actionType //Read[r] or Write[w]
			)

			return {
				signedUrl: Array.isArray(signedUrl) ? signedUrl[0] : signedUrl,
				filePath: destFilePath,
				destFilePath,
			}
		} catch (error) {
			throw error
		}
	}
}

'use strict'
const common = require('@constants/common')
const { cloudClient } = require('@configs/cloud-service')

exports.getPublicDownloadableUrl = async (bucketName, filePath) => {
	let downloadableUrl = await cloudClient.getDownloadableUrl(bucketName, filePath)
	return downloadableUrl
}

exports.getDownloadableUrl = async (filePath) => {
	let bucketName = process.env.CLOUD_STORAGE_BUCKETNAME
	let expiryInSeconds = parseInt(process.env.SIGNED_URL_EXPIRY_DURATION) || 300
	let updatedExpiryTime = 300 || convertExpiryTimeToSeconds(expiryInSeconds)
	let response = await cloudClient.getSignedUrl(bucketName, filePath, updatedExpiryTime, common.READ_ACCESS)
	return Array.isArray(response) ? response[0] : response
}

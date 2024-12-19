// Dependencies
const cloudServices = require('@generics/cloud-services')
const httpStatusCode = require('@generics/http-status')
const common = require('@constants/common')
const utils = require('@generics/utils')
const responses = require('@helpers/responses')

module.exports = class FilesHelper {
	/**
	 * Get Signed Url
	 * @method
	 * @name getSignedUrl
	 * @param {JSON} req  request body.
	 * @param {string} req.query.fileName - name of the file
	 * @param {string} id  -  userId
	 * @returns {JSON} - Response contains signed url
	 */
	static async getSignedUrl(fileName, id, dynamicPath = '', isAssetBucket = false) {
		try {
			// Validate input parameters
			if (!fileName) {
				throw new Error('File name is required')
			}

			let destFilePath
			// Use more concise path generation
			destFilePath = dynamicPath ? `${dynamicPath}/${fileName}` : `shikshachaupal/${Date.now()}-${fileName}`

			// Use optional chaining and nullish coalescing for env variables
			const cloudBucket = isAssetBucket
				? process.env.PUBLIC_ASSET_BUCKETNAME
				: process.env.CLOUD_STORAGE_BUCKETNAME

			const expiryInSeconds = Number(process.env.SIGNED_URL_EXPIRY_DURATION) || 900

			const response = await cloudServices.getSignedUrl(
				cloudBucket,
				destFilePath,
				common.WRITE_ACCESS,
				expiryInSeconds
			)

			return responses.successResponse({
				message: 'SIGNED_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			// Log the error for debugging
			console.error('Error generating signed URL:', error)

			// Rethrow or handle more specifically
			throw responses.errorResponse({
				message: error.message || 'FAILED_TO_GENERATE_SIGNED_URL',
				statusCode: httpStatusCode.internal_server_error,
				responseCode: 'ERROR',
			})
		}
	}

	static async getDownloadableUrl(path, isAssetBucket = false) {
		try {
			// Validate input
			if (!path) {
				throw new Error('File path is required')
			}

			// Simplify bucket selection logic
			const bucketName =
				isAssetBucket || process.env.CLOUD_STORAGE_BUCKET_TYPE !== 'private'
					? process.env.PUBLIC_ASSET_BUCKETNAME
					: process.env.CLOUD_STORAGE_BUCKETNAME

			const expiryInSeconds = Number(process.env.SIGNED_URL_EXPIRY_DURATION) || 30000

			// Unified approach for URL generation
			const response =
				isAssetBucket || process.env.CLOUD_STORAGE_BUCKET_TYPE !== 'private'
					? await utils.getPublicDownloadableUrl(bucketName, path)
					: (await cloudServices.getSignedUrl(bucketName, path, common.READ_ACCESS, expiryInSeconds))
							.signedUrl

			return responses.successResponse({
				message: 'DOWNLOAD_URL_GENERATED_SUCCESSFULLY',
				statusCode: httpStatusCode.ok,
				responseCode: 'OK',
				result: response,
			})
		} catch (error) {
			console.error('Error generating downloadable URL:', error)

			throw responses.errorResponse({
				message: error.message || 'FAILED_TO_GENERATE_DOWNLOAD_URL',
				statusCode: httpStatusCode.internal_server_error,
				responseCode: 'ERROR',
			})
		}
	}
}

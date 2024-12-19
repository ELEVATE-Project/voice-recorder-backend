const httpStatusCode = require('@generics/http-status')
const responses = require('@helpers/responses')
const userQueries = require('../database/queries/recording')
const { redisConfiguration } = require('@configs/redis')
const { Queue } = require('bullmq')
const myQueue = new Queue(process.env.DEFAULT_QUEUE, redisConfiguration)

module.exports = class RecordingsHelper {
	static async create(bodyData) {
		const data = {
			name: bodyData.name,
			phone: bodyData.phone,
			location: bodyData.location,
			cloud_upload_path: bodyData.cloud_upload_path,
			transcribed_text: bodyData.transcribed_text,
			type: bodyData.type,
			meta: bodyData.meta,
		}

		let response = await userQueries.create(data)

		await myQueue.add('requestBody.jobName', response)

		return responses.successResponse({
			statusCode: httpStatusCode.created,
			message: 'RECORDING_CREATED',
			result: response,
		})
	}
}

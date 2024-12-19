'use strict'

const { Worker, Job } = require('bullmq')
const { redisConfiguration } = require('@configs/redis')
const { transcribeAndTranslateLargeFile } = require('@helpers/transcribeHelper')
const recordingsQueries = require('../database/queries/recording')

module.exports = function () {
	try {
		console.log(redisConfiguration)
		const worker = new Worker(
			process.env.DEFAULT_QUEUE,
			async (job) => {
				console.log(`Processing job ID: ${job.id}`)
				const { cloud_upload_path } = job.data

				if (!cloud_upload_path) {
					throw new Error('Missing required data: cloud_upload_path')
				}

				console.log(`Starting transcription and translation for: ${cloud_upload_path}`)
				const translation = await transcribeAndTranslateLargeFile(cloud_upload_path)

				console.log(`Job ID ${job.id} completed successfully.`)
				//console.log('Translation:', translation)
				recordingsQueries.update({ id: job.data.id }, { transcribed_text: translation })
				return { translation }
			},
			{
				...redisConfiguration,
				settings: {
					// Retry configuration
					attempts: 5, // Max retry attempts
					backoff: {
						type: 'exponential', // Exponential backoff
						delay: 3000, // Initial delay of 3 seconds
					},
					retryProcessDelay: 5000, // Delay between retries (5 seconds)
				},
			}
		)

		// Worker event listeners
		worker.on('ready', () => console.log('Worker is ready and listening for jobs.'))

		worker.on('completed', (job) => console.log(`Job ID ${job.id} has completed successfully!`))

		worker.on('failed', (job, err) => console.log(`Job ID ${job?.id} failed permanently:`))

		worker.on('error', (err) => console.error('Worker encountered an error:', err))
	} catch (err) {
		console.error('Failed to initialize worker:', err)
		throw err
	}
}

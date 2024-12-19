const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const mime = require('mime-types')
const axios = require('axios')
const { OpenAI } = require('openai')
const { promisify } = require('util')
const unlinkAsync = promisify(fs.unlink)
const mkdirAsync = promisify(fs.mkdir)
const statAsync = promisify(fs.stat)
const utils = require('@generics/utils')

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const CHUNK_SIZE = 25 * 1024 * 1024 - 1024 // Slightly less than 25 MB to avoid exceeding the limit

const openai = new OpenAI({
	apiKey: OPENAI_API_KEY,
})

const TEMP_DIR = path.resolve(__dirname, 'tempAudio')

/**
 * Ensures the temp directory exists.
 */
async function ensureTempDir() {
	if (!fs.existsSync(TEMP_DIR)) {
		await mkdirAsync(TEMP_DIR, { recursive: true })
	}
}

/**
 * Downloads a file from a given URL and saves it with the appropriate extension in the tempAudio folder.
 * @param {string} url - The file URL.
 * @returns {Promise<string>} - The path to the downloaded file.
 */
async function downloadFile(url) {
	await ensureTempDir()

	const response = await axios({
		method: 'get',
		url,
		responseType: 'stream',
	})

	const contentType = response.headers['content-type']
	const extension = mime.extension(contentType) || 'mp3'
	const tempFilePath = path.join(TEMP_DIR, generateTempFileName(extension))

	console.log(`Downloading file to: ${tempFilePath}`)

	const writer = fs.createWriteStream(tempFilePath)
	response.data.pipe(writer)

	return new Promise((resolve, reject) => {
		writer.on('finish', () => resolve(tempFilePath))
		writer.on('error', reject)
	})
}

/**
 * Generates a unique temporary file name with the correct extension.
 * @param {string} extension - The file extension.
 * @returns {string} - A unique file name.
 */
function generateTempFileName(extension) {
	return `temp_audio_${crypto.randomBytes(8).toString('hex')}.${extension}`
}

/**
 * Transcribes or translates a large audio file by splitting it into chunks if necessary.
 * @param {string} url - The URL of the audio file.
 * @param {string} task - "translate" (default) or "transcribe".
 * @returns {Promise<string>} - The combined transcription or translation.
 */
async function transcribeAndTranslateLargeFile(cloudPath, task = 'translate') {
	let tempFilePath

	try {
		const url = await utils.getDownloadableUrl(cloudPath)

		tempFilePath = await downloadFile(url)

		const fileSize = (await statAsync(tempFilePath)).size

		if (fileSize <= CHUNK_SIZE) {
			// If file size is within the limit, process directly
			return await processFile(tempFilePath, task)
		} else {
			// If file size exceeds the limit, split it into chunks
			return await processLargeFileInChunks(tempFilePath, task)
		}
	} catch (error) {
		console.error('Error during transcription and translation:', error)
		throw error
	} finally {
		// Cleanup temp file
		if (tempFilePath && fs.existsSync(tempFilePath)) {
			await unlinkAsync(tempFilePath)
			console.log('Temporary file cleaned up.')
		}
	}
}

/**
 * Processes a single file for transcription or translation.
 * @param {string} filePath - The path to the audio file.
 * @param {string} task - "translate" (default) or "transcribe".
 * @returns {Promise<string>} - The transcribed or translated text.
 */
async function processFile(filePath, task) {
	console.log(`Processing file: ${filePath}`)

	try {
		const response = await openai.audio.translations.create({
			file: fs.createReadStream(filePath),
			model: 'whisper-1',
		})
		console.log(response)
		return response.text
	} catch (error) {
		console.error(`${task.charAt(0).toUpperCase() + task.slice(1)} failed:`, error.response?.data || error.message)
		throw new Error(`API request failed: ${error.message}`)
	}
}

/**
 * Processes a large file in chunks if it exceeds the size limit.
 * @param {string} filePath - The path to the large audio file.
 * @param {string} task - "translate" (default) or "transcribe".
 * @returns {Promise<string>} - The combined transcription or translation.
 */
async function processLargeFileInChunks(filePath, task) {
	console.log(`File exceeds size limit. Processing in chunks...`)

	const readStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE })

	let combinedResult = ''

	for await (const chunk of readStream) {
		// Save each chunk to a temp file and process it
		const chunkPath = path.join(TEMP_DIR, generateTempFileName('mp3'))
		fs.writeFileSync(chunkPath, chunk)

		try {
			const result = await processFile(chunkPath, task)
			combinedResult += result + ' '
		} finally {
			// Cleanup the chunk file
			if (fs.existsSync(chunkPath)) {
				await unlinkAsync(chunkPath)
			}
		}
	}

	return combinedResult.trim()
}

module.exports = {
	transcribeAndTranslateLargeFile,
}

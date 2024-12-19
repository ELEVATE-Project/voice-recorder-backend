const axios = require('axios')
const apiEndpoints = require('@constants/endpoints')

const chatPlatformAxios = axios.create({
	baseURL: 'http://localhost:8065/', // process.env.CHAT_PLATFORM_URL,
	headers: {
		//Authorization: `Bearer ${process.env.CHAT_PLATFORM_ACCESS_TOKEN}`, // Admin token
		Authorization: `Bearer f85rtq75ktr4drgfuncjci6tor`, // Admin token
		'Content-Type': 'application/json',
		accept: 'application/json',
	},
})

// Common error handler
const handleError = (error) => {
	if (error.response) {
		console.log('Error occurred in Mattermost API call::', error.response.data)
		throw new Error(error.response.data.message || 'Mattermost API Error')
	} else {
		console.log('Network or unknown error:', error.message)
		throw error
	}
}

// Admin Login Function
exports.adminLogin = async () => {
	try {
		const payload = {
			login_id: process.env.CHAT_PLATFORM_ADMIN_EMAIL,
			password: process.env.CHAT_PLATFORM_ADMIN_PASSWORD,
		}

		const response = await axios.post(`${process.env.CHAT_PLATFORM_URL}${apiEndpoints.MATTERMOST.LOGIN}`, payload)
		return {
			user_id: response.data.id,
			auth_token: response.headers.token,
		}
	} catch (error) {
		return handleError(error)
	}
}

// User Login Function
exports.login = async (username, password) => {
	try {
		const payload = { login_id: username, password }
		const response = await chatPlatformAxios.post(apiEndpoints.MATTERMOST.LOGIN, payload)
		return {
			user_id: response.data.id,
			auth_token: response.headers.token,
		}
	} catch (error) {
		return handleError(error)
	}
}

// Sign Up Function
exports.signup = async (name, username, password, email) => {
	try {
		const payload = {
			email,
			username,
			password,
			first_name: name,
		}

		const response = await chatPlatformAxios.post(apiEndpoints.MATTERMOST.USERS_CREATE, payload)
		return {
			user_id: response.data.id,
		}
	} catch (error) {
		return handleError(error)
	}
}

// Initiate Chat Room Function
exports.initiateChatRoom = async (usernames, excludeSelf = true) => {
	try {
		if (usernames.length !== 2) {
			throw new Error('Mattermost supports direct channels with exactly 2 users.')
		}

		// Resolve usernames to user IDs
		const userIds = await Promise.all(
			usernames.map(async (username) => {
				const userResponse = await chatPlatformAxios.get(
					apiEndpoints.MATTERMOST.GET_USER_BY_USERNAME.replace('{username}', username)
				)
				return userResponse.data.id
			})
		)
		// Create a direct channel
		const response = await chatPlatformAxios.post(apiEndpoints.MATTERMOST.DIRECT_CHANNEL_CREATE, userIds)

		return {
			room: {
				room_id: response.data.id,
			},
		}
	} catch (error) {
		return handleError(error)
	}
}

// Send Message Function
exports.sendMessage = async (username, password, rid, msg) => {
	try {
		// Login user
		const loginResponse = await this.login(username, password)

		if (loginResponse.auth_token) {
			const payload = {
				channel_id: rid,
				message: msg,
			}

			const response = await chatPlatformAxios.post(apiEndpoints.MATTERMOST.POST_MESSAGE, payload, {
				headers: {
					Authorization: `Bearer ${loginResponse.auth_token}`,
				},
			})

			await this.logout(loginResponse.user_id, loginResponse.auth_token)

			return response.data
		} else {
			throw new Error('Login failed, unable to send message')
		}
	} catch (error) {
		return handleError(error)
	}
}

// Logout Function
exports.logout = async (userId, token) => {
	try {
		const response = await chatPlatformAxios.post(
			apiEndpoints.MATTERMOST.LOGOUT,
			{},
			{
				headers: {
					Authorization: `Bearer ${token}`,
				},
			}
		)
		return response.data
	} catch (error) {
		return handleError(error)
	}
}

// Set Avatar Function
exports.setAvatar = async (username, imageUrl) => {
	try {
		const userResponse = await chatPlatformAxios.get(`/api/v4/users/username/${username}`)
		const userId = userResponse.data.id

		const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' })
		const imageBuffer = Buffer.from(imageResponse.data)

		const response = await chatPlatformAxios.post(
			apiEndpoints.MATTERMOST.SET_AVATAR.replace('{userId}', userId),
			imageBuffer,
			{
				headers: {
					'Content-Type': 'image/png',
				},
			}
		)
		return response.data
	} catch (error) {
		return handleError(error)
	}
}

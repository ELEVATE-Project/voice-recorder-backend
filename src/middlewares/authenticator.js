const httpStatusCode = require('@generics/http-status')
const apiResponses = require('@constants/api-responses')
const responses = require('@helpers/responses')

module.exports = async function (req, res, next) {
	try {
		const internalAccess =
			req.headers.internal_access_token && process.env.ACCESS_TOKEN === req.headers.access_token
		if (internalAccess) return next()
		else
			throw responses.failureResponse({
				message: apiResponses.UNAUTHORIZED_REQUEST,
				statusCode: httpStatusCode.unauthorized,
				responseCode: 'UNAUTHORIZED',
			})
	} catch (err) {
		next(err)
	}
}

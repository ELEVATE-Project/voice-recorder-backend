'use strict'
const Recording = require('@database/models/index').Recording

exports.create = async (data) => {
	try {
		console.log(data)
		const res = await Recording.create(data)
		return res.get({ plain: true })
	} catch (error) {
		throw error
	}
}

exports.findOne = async (filter, options = {}) => {
	try {
		return await Recording.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

exports.update = async (filter, data, options = {}) => {
	try {
		// Update the recording with the given data and filter
		const [affectedRows] = await Recording.update(data, {
			where: filter,
			...options,
		})

		// If no rows were affected, it means no matching record was found
		if (affectedRows === 0) {
			return null
		}

		// Return the updated record (fetch it again after update)
		return await Recording.findOne({
			where: filter,
			...options,
			raw: true,
		})
	} catch (error) {
		throw error
	}
}

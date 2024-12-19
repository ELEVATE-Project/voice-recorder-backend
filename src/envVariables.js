let table = require('cli-table')

let tableData = new table()

let environmentVariables = {
	APPLICATION_ENV: {
		message: 'Required node environment',
		optional: true,
		default: 'production',
	},

	APPLICATION_PORT: {
		message: 'Required port number',
		optional: true,
		default: 3123,
	},
	ENABLE_LOG: {
		message: 'Enable logs',
		optional: true,
		default: false,
	},

	APPLICATION_BASE_URL: {
		message: 'Required application base URL',
		optional: true,
		default: '/shiksha-chaupal/',
	},

	API_DOC_URL: {
		message: 'Required API documentation URL',
		optional: true,
		default: '/api-doc',
	},

	DEV_DATABASE_URL: {
		message: 'Development database URL',
		optional: false,
	},
}

let success = true

module.exports = function () {
	Object.keys(environmentVariables).forEach((eachEnvironmentVariable) => {
		let tableObj = {
			[eachEnvironmentVariable]: 'PASSED',
		}

		let keyCheckPass = true

		if (
			environmentVariables[eachEnvironmentVariable].optional === true &&
			environmentVariables[eachEnvironmentVariable].requiredIf &&
			environmentVariables[eachEnvironmentVariable].requiredIf.key &&
			environmentVariables[eachEnvironmentVariable].requiredIf.key != '' &&
			environmentVariables[eachEnvironmentVariable].requiredIf.operator &&
			validRequiredIfOperators.includes(environmentVariables[eachEnvironmentVariable].requiredIf.operator) &&
			environmentVariables[eachEnvironmentVariable].requiredIf.value &&
			environmentVariables[eachEnvironmentVariable].requiredIf.value != ''
		) {
			switch (environmentVariables[eachEnvironmentVariable].requiredIf.operator) {
				case 'EQUALS':
					if (
						process.env[environmentVariables[eachEnvironmentVariable].requiredIf.key] ===
						environmentVariables[eachEnvironmentVariable].requiredIf.value
					) {
						environmentVariables[eachEnvironmentVariable].optional = false
					}
					break
				case 'NOT_EQUALS':
					if (
						process.env[environmentVariables[eachEnvironmentVariable].requiredIf.key] !=
						environmentVariables[eachEnvironmentVariable].requiredIf.value
					) {
						environmentVariables[eachEnvironmentVariable].optional = false
					}
					break
				default:
					break
			}
		}

		if (environmentVariables[eachEnvironmentVariable].optional === false) {
			if (!process.env[eachEnvironmentVariable] || process.env[eachEnvironmentVariable] == '') {
				success = false
				keyCheckPass = false
			} else if (
				environmentVariables[eachEnvironmentVariable].possibleValues &&
				Array.isArray(environmentVariables[eachEnvironmentVariable].possibleValues) &&
				environmentVariables[eachEnvironmentVariable].possibleValues.length > 0
			) {
				if (
					!environmentVariables[eachEnvironmentVariable].possibleValues.includes(
						process.env[eachEnvironmentVariable]
					)
				) {
					success = false
					keyCheckPass = false
					environmentVariables[eachEnvironmentVariable].message += ` Valid values - ${environmentVariables[
						eachEnvironmentVariable
					].possibleValues.join(', ')}`
				}
			}
		}

		if (
			(!process.env[eachEnvironmentVariable] || process.env[eachEnvironmentVariable] == '') &&
			environmentVariables[eachEnvironmentVariable].default &&
			environmentVariables[eachEnvironmentVariable].default != ''
		) {
			process.env[eachEnvironmentVariable] = environmentVariables[eachEnvironmentVariable].default
		}

		if (!keyCheckPass) {
			if (environmentVariables[eachEnvironmentVariable].message !== '') {
				tableObj[eachEnvironmentVariable] = environmentVariables[eachEnvironmentVariable].message
			} else {
				tableObj[eachEnvironmentVariable] = `FAILED - ${eachEnvironmentVariable} is required`
			}
		}

		tableData.push(tableObj)
	})

	console.log(tableData.toString())

	return {
		success: success,
	}
}

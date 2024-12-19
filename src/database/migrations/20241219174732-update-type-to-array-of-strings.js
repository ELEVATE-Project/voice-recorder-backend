'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Add a temporary column to store the new array type
		await queryInterface.addColumn('recordings', 'type_temp', {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: false,
			defaultValue: [],
		})

		// Convert existing TEXT values to arrays and update the temporary column
		await queryInterface.sequelize.query(`
			UPDATE recordings
			SET type_temp = ARRAY[type]
			WHERE type IS NOT NULL;
		`)

		// Drop the original 'type' column
		await queryInterface.removeColumn('recordings', 'type')

		// Rename 'type_temp' to 'type'
		await queryInterface.renameColumn('recordings', 'type_temp', 'type')
	},

	down: async (queryInterface, Sequelize) => {
		// Add a temporary column to store the reverted TEXT type
		await queryInterface.addColumn('recordings', 'type_temp', {
			type: Sequelize.TEXT,
			allowNull: false,
		})

		// Convert arrays back to TEXT by taking the first element
		await queryInterface.sequelize.query(`
			UPDATE recordings
			SET type_temp = type[1]
			WHERE type IS NOT NULL;
		`)

		// Drop the 'type' column
		await queryInterface.removeColumn('recordings', 'type')

		// Rename 'type_temp' to 'type'
		await queryInterface.renameColumn('recordings', 'type_temp', 'type')
	},
}

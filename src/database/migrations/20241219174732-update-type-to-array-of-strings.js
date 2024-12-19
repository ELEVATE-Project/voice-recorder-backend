'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('recordings', 'type', {
			type: Sequelize.ARRAY(Sequelize.STRING),
			allowNull: false,
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.changeColumn('recordings', 'type', {
			type: Sequelize.TEXT,
			allowNull: false,
		})
	},
}

'use strict'

module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('recordings', {
			id: {
				type: Sequelize.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			phone: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			location: {
				type: Sequelize.JSONB,
			},
			cloud_upload_path: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			transcribed_text: {
				type: Sequelize.TEXT,
			},
			type: {
				type: Sequelize.TEXT,
				allowNull: false,
			},
			meta: {
				type: Sequelize.JSONB,
			},
			created_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
			updated_at: {
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
			deleted_at: {
				type: Sequelize.DATE,
			},
		})
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('recordings')
	},
}

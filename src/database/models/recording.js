'use strict'

module.exports = (sequelize, DataTypes) => {
	const Recording = sequelize.define(
		'Recording',
		{
			id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				autoIncrement: true,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			phone: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			location: {
				type: DataTypes.JSONB,
			},
			cloud_upload_path: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			transcribed_text: {
				type: DataTypes.TEXT,
			},
			type: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			meta: {
				type: DataTypes.JSONB,
			},
			created_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			updated_at: {
				type: DataTypes.DATE,
				defaultValue: DataTypes.NOW,
			},
			deleted_at: {
				type: DataTypes.DATE,
			},
		},
		{
			// Sequelize table options
			tableName: 'recordings',
			timestamps: true,
			paranoid: true, // Enables soft deletion
			underscored: true, // Uses snake_case for column names
		}
	)

	return Recording
}

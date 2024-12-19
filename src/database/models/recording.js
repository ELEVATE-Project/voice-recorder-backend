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
				type: DataTypes.STRING,
			},
			cloud_upload_path: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			transcribed_text: {
				type: DataTypes.TEXT,
			},
			type: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1, // Default to 'Celebrating Success'
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
			// Getter method to map the integer values to labels
			getterMethods: {
				issueType() {
					const issueTypes = {
						1: 'Celebrating Success',
						2: 'Shared Observations',
						3: 'Shared Solutions',
					}
					return issueTypes[this.is_issue] || 'Unknown'
				},
			},
			// Sequelize table options
			tableName: 'recordings',
			timestamps: true,
			paranoid: true, // Enables soft deletion
			underscored: true, // Uses snake_case for column names
		}
	)

	return Recording
}

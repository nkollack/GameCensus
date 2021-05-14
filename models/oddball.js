module.exports = (sequelize, DataTypes) => {
    return sequelize.define('oddball', {
        game_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        player_count: {
            type: DataTypes.INTEGER,
            defaultValue: 1,
            allowNull: false,
        },
    }, {
        timestamps: false,
        freezeTableName: true,
    });
};
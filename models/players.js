module.exports = (sequelize, DataTypes) => {
    return sequelize.define('players', {
        game_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        discord_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    }, {
        timestamps: false,
        freezeTableName: true,
    });
};
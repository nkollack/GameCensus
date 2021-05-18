module.exports = (sequelize, DataTypes) => {
    return sequelize.define('games', {
        game_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        player_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
    }, {
        timestamps: false,
        freezeTableName: true,
    });
};
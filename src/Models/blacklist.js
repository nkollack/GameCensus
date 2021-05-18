module.exports = (sequelize, DataTypes) => {
    return sequelize.define('blacklist', {
        game_id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        
    }, {
        timestamps: false,
        freezeTableName: true,
    });
};
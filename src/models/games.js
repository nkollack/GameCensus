const Sequelize = require("sequelize");
class Games extends Sequelize.Model {    //add a game with no players
    static addGame(game_id) {
        const game = this.findOne({
            where: { game_id: game_id },
        });

        if (!game) {
            this.findOrCreate({
                where: { game_id: game_id, player_count: 0 }
            });
            Oddball.destroy({
                where: { game_id: game_id },
                force: true,
            });
            Oddball_Players.destroy({
                where: { game_id: game_id },
                force: true,
            });
            return true;
        }
        return false;
    }

    //get all players for a game
    static getAll(game_id) {
        return Players.findAll({
            where: { game_id: game_id },
        });
    }

    //not currently used
    static incrementCount(game_id) {
        const game = this.findOne({
            where: { game_id: game_id },
        });

        const playerCount = Players.count({
            where: { game_id: game_id },
        })

        game.player_count = playerCount;
        await game.save();
    }

    static init(sequelize, DataTypes) {
        return super.init(
            {
                game_id: {
                    type: DataTypes.STRING,
                    primaryKey: true,
                },
                player_count: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,
                },
            },
            { sequelize }
        );
    }
}

module.exports = {
    name: "Games",
    dbmodel: (sequelize, DataTypes) => {
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
        })
    },

    //add a game with no players
    addGame: async function (game_id) {
        const game = await Games.findOne({
            where: { game_id: game_id },
        });

        if (!game) {
            await Games.findOrCreate({
                where: { game_id: game_id, player_count: 0 }
            });
            await Oddball.destroy({
                where: { game_id: game_id },
                force: true,
            });
            await Oddball_Players.destroy({
                where: { game_id: game_id },
                force: true,
            });
            return true;
        }
        return false;
    },

    //get all players for a game
    getAll: async function (game_id) {
        return await Players.findAll({
            where: { game_id: game_id },
        });
    },

    //not currently used
    incrementCount: async function (game_id) {
        const game = await Games.findOne({
            where: { game_id: game_id },
        });

        const playerCount = await Players.count({
            where: { game_id: game_id },
        })

        game.player_count = playerCount;
        await game.save();
    },

};
module.exports = {
    name: "Blacklist",
    dbmodel: (sequelize, DataTypes) => {
        return sequelize.define('blacklist', {
            game_id: {
                type: DataTypes.STRING,
                primaryKey: true,
            },

        }, {
            timestamps: false,
            freezeTableName: true,
        });
    },
    addGame: async function (game_id) {
        //check blacklist for pre-existing, or add to blacklist
        const [game, created] = await Blacklist.findOrCreate({
            where: { game_id: game_id },
        });

        //if successfully added to blacklist
        if (created) {
            //remove game from games db, remove players from player db
            await Games.destroy({
                where: { game_id: game_id },
                force: true,
            });
            await Players.destroy({
                where: { game_id: game_id },
                force: true,
            });
            await Oddball.destroy({
                where: { game_id: game_id },
                force: true,
            });
            await Oddball_Players.destroy({
                where: { game_id: game_id },
                force: true,
            });
            return created;
        }
        return created;
    },
    removeGame: async function (game_id) {
        const game = await Blacklist.findOne({
            where: { game_id: game_id },
        });

        if (game) {
            await Blacklist.destroy({
                where: { game_id: game_id },
                force: true,
            });

            return true;
        }
        return false;
    },
    reset: async function (game_id) {
        const blacklisted = await module.exports.Blacklist.prototype.addGame(game_id);

        if (blacklisted) {
            const unblacklisted = await module.exports.Blacklist.prototype.removeGame(game_id);

            if (unblacklisted) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }
};
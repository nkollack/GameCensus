const Sequelize = require('sequelize');
const oddball = require('../models/oddball');
const GiantbombAPI = require('./giantbomb_api');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
    retry: {
        match: [
            /SQLITE_BUSY/,
        ],
        name: 'query',
        //5000 is the default max number of online users that can be in a discord
        max: 5000
    },
});

const Blacklist = require('../models/blacklist')(sequelize, Sequelize.DataTypes);
const Games = require('../models/games')(sequelize, Sequelize.DataTypes);
const Oddball_Players = require('../models/oddball_players')(sequelize, Sequelize.DataTypes);
const Oddball = require('../models/oddball')(sequelize, Sequelize.DataTypes);
const Players = require('../models/players')(sequelize, Sequelize.DataTypes);

//Players.belongsTo(Games, { foreignKey: 'game_id', as: 'game_id' });
//Oddball_Players.belongsTo(Oddball, { foreignKey: 'game_id', as: 'game_id' });

//add a player to a game
Players.prototype.addPlayer = async function(game_id, discord_id, oddball_accept) {
    const game = await Games.findOne({
        where: { game_id: game_id },
    });

    //if game exists
    if(game) {
        //find player or create if it exists
        const [player, created] = await Players.findOrCreate({
            where: { game_id: game_id, discord_id: discord_id },
        });

        if(created) {
            game.player_count += 1;
            await game.save();
        }

    //if game does not exist
    } else {
        const blacklist = await Blacklist.findOne({
            where: {game_id: game_id},
        });

        //if game is not in blacklist
        if(!blacklist) {
            //poll giantbomb api
            const giantbomb = await GiantbombAPI.giantbombCompare(game_id);

            //if in giantbomb api
            if(giantbomb) {
                //add game to games list
                const game = await Games.findOrCreate({
                    where: { game_id: game_id },
                });
                //add player to players list
                const [player, created] = await Players.findOrCreate({
                    where: { game_id: game_id, discord_id: discord_id }
                });

                if(created) {
                    game[0].player_count += 1;
                    await game[0].save();
                }

            //if not in giantbomb api
            } else {
                //check oddball database for game
                const oddball = await Oddball.findOne({
                    where: { game_id: game_id },
                });
                //if is in oddball list
                if(oddball) {
                    //find player or create if it exists
                    const [oddball_player, created] = await Oddball_Players.findOrCreate({
                        where: { game_id: game_id, discord_id: discord_id },
                    });
                    //if player is not in oddball db
                    if(created) {
                        oddball.player_count += 1;
                        await oddball.save();

                        //compare oddball player count to oddball acceptance variable
                        if(oddball.player_count == oddball_accept) {
                            //if true, add oddball to game db, add player to players db, and remove player and game from oddball dbs
                            const game = await Games.findOrCreate({
                                where: { game_id: game_id },
                            });
                            const [player, created] = await Players.findOrCreate({
                                where: { game_id: game_id, discord_id: discord_id }
                            });
                            await Oddball.destroy({
                                where: { game_id: game_id },
                                force: true,
                            });
                            await Oddball_Players.destroy({
                                where: { game_id: game_id },
                                force: true,
                            });
                            if(created) {
                                game[0].player_count += 1;
                                await game[0].save();
                            }
                        }
                    }

                //game is not in oddball db
                } else {
                    //add game to oddball db and add player to oddball players db
                    //IMPORTANT: if you update this code, make sure to check the default value for the oddball player_count
                    console.log("oddball: " + game_id);
                    await Oddball.findOrCreate({
                        where: { game_id: game_id },
                    });
                    await Oddball_Players.findOrCreate({
                        where: { game_id: game_id, discord_id: discord_id }
                    });
                }
            }
        }
    }
};

Games.prototype.addGame = async function(game_id) {
    const game = await Games.findOne({
        where: { game_id: game_id },
    });

    if(!game) {
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
};

//get all players for a game
Games.prototype.getAll = async function(game_id) {
    return await Players.findAll({
        where: { game_id: game_id },
    });
};

Games.prototype.incrementCount = async function(game_id) {
    const game = await Games.findOne({
        where: { game_id: game_id },
    });

    const playerCount = await Players.count({
        where: { game_id: game_id },
    })

    game.player_count = playerCount;
    await game.save();
};

Blacklist.prototype.addGame = async function(game_id) {
    //check blacklist for pre-existing, or add to blacklist
    const [game, created] = await Blacklist.findOrCreate({
        where: { game_id: game_id },
    });

    //if successfully added to blacklist
    if(created) {
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
};

Blacklist.prototype.removeGame = async function(game_id) {
    const game = await Blacklist.findOne({
        where: { game_id: game_id },
    });

    if(game) {
        await Blacklist.destroy({
            where: { game_id: game_id },
            force: true,
        });

        return true;
    }
    return false;
};

Blacklist.prototype.reset = async function(game_id) {
    const blacklisted = await module.exports.Blacklist.prototype.addGame(game_id);

    if(blacklisted) {
        const unblacklisted = await module.exports.Blacklist.prototype.removeGame(game_id);

        if(unblacklisted) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};

module.exports = {Blacklist, Games, Oddball_Players, Oddball, Players};
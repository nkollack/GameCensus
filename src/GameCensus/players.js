const client = require("../index.js");
const GiantbombAPI = require('./giantbomb_api');

const Players = client.models['players'];
const Games = client.models['games'];
const Oddball_Players = client.models['oddball_players'];
const Oddball = client.models['oddball'];
const Blacklist = client.models['blacklist'];
const oddball_accept = client.config.internal_options.oddball_accept;

Players.addPlayer = async function(game_id, discord_id) {
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

module.exports = Players;
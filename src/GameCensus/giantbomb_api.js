require('isomorphic-fetch');
const config = require("../../config.json");

module.exports = {
    //returns false if no exact match found, true if found
    giantbombGET: async(game) => {
        const URL = `https://www.giantbomb.com/api/search?api_key=${config.GB_API_Key}&format=json&query=${encodeURIComponent(game)}&resources=game&field_list=name`;

        const response = await fetch(URL);
        var data = await response.json();

        return await data;
    },

    giantbombCompare: async(game) => {
        let data = await module.exports.giantbombGET(game);

        if(data.results.length != 0) {
            for(let i = 0; i < data.results.length; i++) {
                if(data.results[i].name.toLowerCase() == game.toLowerCase()) {
                    return true;
                }
            }
        }
        return false;
    }
};
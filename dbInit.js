const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

require('./models/games')(sequelize, Sequelize.DataTypes);
require('./models/blacklist')(sequelize, Sequelize.DataTypes);
require('./models/oddball_players')(sequelize, Sequelize.DataTypes);
require('./models/oddball')(sequelize, Sequelize.DataTypes);
require('./models/players')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({force})
         .then( () => {
            console.log('Database synced');
            sequelize.close();
         })
         .catch(console.error);
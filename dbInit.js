const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

require('./src/models/games')(sequelize, Sequelize.DataTypes);
require('./src/models/blacklist')(sequelize, Sequelize.DataTypes);
require('./src/models/oddball_players')(sequelize, Sequelize.DataTypes);
require('./src/models/oddball')(sequelize, Sequelize.DataTypes);
require('./src/models/players')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({force})
         .then( () => {
            console.log('Database synced');
            sequelize.close();
         })
         .catch(console.error);
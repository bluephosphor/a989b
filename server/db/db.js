const Sequelize = require("sequelize");

const db = new Sequelize('messenger', 'postgres', 'pass', {
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = db;
const mysql = require('mysql');
const mysqldump = require('mysqldump');
const pool = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS, 
    database: process.env.DB_DATABASE
});

const poolWP = mysql.createPool({
    host: process.env.WP_DB_HOST,
    user: process.env.WP_DB_USER,
    password: process.env.WP_DB_PASS, 
    database: process.env.WP_DB_DATABASE


});






/// export pool mySQL
module.exports = {
    pool : pool,
    poolWP : poolWP,
    // backupDB : backupDB
}
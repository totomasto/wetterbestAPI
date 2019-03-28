const mysql = require('mysql');

const pool = mysql.createPool({
    host: 'remotemysql.com',
    user: 'hb6roaQZdt',
    password: 's1LsLkot9L', 
    database: 'hb6roaQZdt'
});




module.exports = {
    pool : pool
}
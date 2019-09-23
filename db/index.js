const mysql = require('mysql');
const mysqldump = require('mysqldump');
const pool = mysql.createPool({
    host: 'remotemysql.com',
    user: 'hb6roaQZdt',
    password: 's1LsLkot9L', 
    database: 'hb6roaQZdt'
});

const poolWP = mysql.createPool({
    host: '89.42.220.153',
    user: 'r63016wett_api',
    password: 'Depaco123#', 
    database: 'r63016wett_wtb'


});

// dump the result straight to a file doesn't work at the moment 
//  let backupDB = mysqldump({
//     connection: {
//         host: 'remotemysql.com',
//         user: 'hb6roaQZdt',
//         password: 's1LsLkot9L', 
//         database: 'hb6roaQZdt'
//     },
//     dumpToFile: '/backup.sql',
// });





/// export pool mySQL
module.exports = {
    pool : pool,
    poolWP : poolWP,
    // backupDB : backupDB
}
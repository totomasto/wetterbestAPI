const db = require('./index');




let importAllDataFromDB = async (callback) => {

    db.pool.query('SELECT * FROM leads', (err, result, fields)=>{

        callback(null, result);

    });



}



module.exports = {


    importAllDataFromDB

}
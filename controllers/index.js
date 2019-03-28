const db = require('./../db');




let displayClients = (callback) => {
    db.pool.query('SELECT * FROM clients', (err, result, fields)=>{     
     callback(null, result);
    });
}

let insertLeads = (data, callback) =>{
    
    
    db.pool.query(`INSERT INTO leads (name, phone, region, city, source) VALUES ('${data.fullName}','${data.phone}','${data.region}','${data.city}','${data.source}' )`, (err, result, fields)=>{

        if(err) throw err;
        callback(null, 1);
        
    });
}

let selectLeads = (callback)=>{
    db.pool.query(`SELECT * FROM leads`, (err, result, fields)=>{

        callback(null, result);

    });
}


module.exports = {
    displayClients,
    insertLeads,
    selectLeads
}
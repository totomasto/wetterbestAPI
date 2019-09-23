const db = require('./../db');
const nodemailer = require('nodemailer');
const axios = require('axios');
const Nexmo = require('nexmo');
const mailer = require('../index');




///////////////////////////////////////////////////////// WETTERBEST APP /////////////////////////////////////////////



let checkIfResellerExistsAndReturnEmail = async (cif,callback)=>{

    console.log(cif);
    let query = `SELECT E_Mail FROM clients_leads WHERE CIF ='${cif}' LIMIT 1 `;

    db.pool.query(query, async (err, result, fields)=>{
        if(err) console.log(err);
        console.log(result[0]);
        callback(null, result[0]);
      
    })



}















/////////////////////////////////////////////////////////// END WETTERBEST APP ////////////////////////////////////////////














let backupDatabase = async () => {

    db.backupDB();


}



let compareDatabasesForLeads = async (callback) => { 
    // getting the max value from lead table
    let maxLead = async (callback) =>{ await db.pool.query('SELECT wp_id FROM leads WHERE wp_id = (SELECT MAX(wp_id) FROM leads)',(err, result, fields)=>{ callback(null, result);  }); }
    // getting the max value from wp table
    let maxWP   = async (lead, callback) =>{ await db.poolWP.query('SELECT distinct(post_id) FROM wtb_postmeta WHERE post_id = (SELECT MAX(post_id) from wtb_postmeta)', (err, result, fields)=>{ callback(null, result);  })}
    maxLead((err, result)=>{

        let lead = result;
        maxWP(lead, (err, result)=>{

            
            let results = lead.concat(result);   // creating an array with the 2 values
            let leadValue = JSON.stringify(results[0]).replace(/[^0-9]/g,''); // getting the integers from string lead
            let wpValue   = JSON.stringify(results[1]).replace(/[^0-9]/g,''); // getting the integers from string wp 
            let values = [];
            for(let i = parseInt(leadValue)+1; i<= wpValue; i++){
                values.push(i);// creating the array with the numbers bettween the 2
            }
            
            callback(null, values); // result 
            
        });

    })
    // callback(null, maxLead);
    
}




let getLastLead =  async (lastID, callback)=>{

let query = `SELECT * from wtb_postmeta WHERE post_id =  '${lastID}' `;

    db.poolWP.query(query, async (err, result, fields)=>{
        if(err) console.log(err);

       let lead = {wpID: result[0].post_id, source : 'Website', tip : 'Material+Montaj'};
        // console.log(result);
        result.forEach((element)=>{
                
                if(element.meta_key === '_field_nume') lead.fullName = element.meta_value;
                if(element.meta_key === '_from_email') lead.email = element.meta_value;
                if(element.meta_key === '_field_telefon') lead.phone = element.meta_value;
                if(element.meta_key === '_field_judet') lead.region = element.meta_value;
                if(element.meta_key === '_field_oras') lead.city = element.meta_value;
                if(element.meta_key === '_field_mesaj') lead.obs = element.meta_value;
        });
                    
        if(!lead.fullName){
            callback(null, null);
        
        } else { 
            // console.log(lead);
        callback(null, lead);
        }
    })
}



////////////////          functionalitate FORMULAR       ///////////////////////////////////////////
// afisare clienti formular, nu se foloseste in niciun route * 
let displayClients = (callback) => {
    db.pool.query('SELECT * FROM clients', (err, result, fields)=>{     
     callback(null, result);
    });
}

let getCortinaProductsFromDB = (callback) => {
    db.pool.query('SELECT * FROM cortina_produse_formular', (err, result, fields)=>{

            callback(null, result);
    });
}


let getCortinaPriceListFromDB = (callback)=>{
    db.pool.query('SELECT * FROM cortina_clients_prices', (err, result, fields)=>{
        callback(err, result);
    })
}

let getCortinaClientsListFromDB = (callback)=>{
    db.pool.query('SELECT * FROM cortina_clients_discounts', (err, result, fields)=>{
        callback(err, result);
    })
}


////////////////          END FORMULAR       ///////////////////////////////////////////










////////////////          functionalitate LEAD-URI      ///////////////////////////////////////////


// se introduc in baza de date lead-urile, se folosesc in paginile de lead-uri
// ----- API-ul pentru inserare din website din pagina de contact 
let insertLeads = (data, callback) =>{
    // let timeStamp = new Date().toJSON().slice(0, 10);
    console.log('Data was received...');
    let timeStamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    
        let wpID = (data.wpID) ? data.wpID : 0;
    
        
    

    db.pool.query('INSERT INTO leads (name, email, phone, region, city, tip, source, status, client ,obs, sent_date, reason,wp_id) VALUES ("'+data.fullName+'","'+data.email+'","'+data.phone+'","'+data.region+'","'+data.city+'","'+data.tip+'","'+data.source+'","Neprocesat", "-" , "'+data.obs+'" , "'+timeStamp+'" ,"-", "'+ wpID +'")', (err, result, fields)=>{
    
        if(err) throw err;

        db.pool.query('SELECT LAST_INSERT_ID()', (err, result, fields)=>{
 
            console.log(result);
        console.log('Data has been inserted succesfully...');
        // let data = {
        //     apiKey : '7830e32b',
        //     apiSecret : 'Macboopro2012', 
        //     phone : '0730137527',
        //     id: result[0]
        // }
        // sendSMSAgent(data);
        callback(null, 1);
        });
    });

}


// aduce toate datele din tabela de leaduri
let selectLeads = (callback)=>{
    db.pool.query(`SELECT * FROM leads ORDER BY id ASC `, (err, result, fields)=>{
        if(err) throw err;
        callback(null, result);
    });
}

//verifica datele din db externa din WP 
let selectLeadsWP = (callback)=>{
    
}

let deleteLead = (id, callback)=>{
    db.pool.query(`DELETE FROM leads WHERE id = ${id}`, (err, result, fields)=>{
        if(err) console.log(err);
        callback(null, result);
    })
}


// update pentru tabela de leaduri 
let updateLeads = (data,callback)=>{
    // let date = new Date().toJSON().slice(0, 10);
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // console.log('Updating... ');
    db.pool.query(`UPDATE leads SET status = 'In lucru', client='${data.client}', sent_date='${date}' WHERE id = '${data.id}'`, (err, result, fields)=>{
        if(err) console.log(err);
        callback(null, 'Success');
    });
}


let updateLeadsReminder = (data, callback)=>{
    // console.log(data.id);
    // let date = new Date().toJSON().slice(0, 10);
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // console.log('Updating... ');
    db.pool.query(`UPDATE leads SET sent_date='${date}' WHERE id = '${data.id}'`, (err, result, fields)=>{
        if(err) console.log(err);
        
        db.pool.query(`SELECT * FROM leads WHERE id = '${data.id}'`, (err, result, fields)=>{
                if(err) console.log(err);
        
                let lead = result[0];
                db.pool.query(`INSERT INTO reminders (lead_id, last_date, reminder_no) VALUES ('${lead.id}', '${date}', '0')`, (err, result, fields)=>{

                    callback(err, 'Success');


                });


        });
    });


}

let selectLogsReminders = (callback) => {

    db.pool.query('SELECT * FROM reminders', (err, result, fields)=>{

        callback(err, result);
    });

}


let changeLeadStatus = (data, callback)=>{
console.log(data);
   // let date = new Date().toJSON().slice(0, 10);
   let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

   db.pool.query(`UPDATE leads SET status = 'Finalizat', sent_date = '${date}', reason='${data.reason}' WHERE name = '${data.name}'`, (err, result, fields) =>{

    if(err) console.log(err);
    callback(null, 'Success');

   });

}

let changeLeadStatusFailed = (data, callback)=>{
    console.log(data);
       // let date = new Date().toJSON().slice(0, 10);
       let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
       db.pool.query(`UPDATE leads SET status = 'Pierdut', sent_date = '${date}', reason='${data.reason}' WHERE name = '${data.name}'`, (err, result, fields) =>{
    
        if(err) console.log(err);
        callback(null, 'Success');
    
       });
    
    }

    let changeLeadStatusWait = (data, callback)=>{
        console.log(data);
           // let date = new Date().toJSON().slice(0, 10);
           let date = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
           db.pool.query(`UPDATE leads SET status = 'In asteptare', sent_date = '${date}', reason='In asteptare' WHERE name = '${data.name}'`, (err, result, fields) =>{
        
            if(err) console.log(err);
            callback(null, 'Success');
        
           });
        
        }    



// query pentru un singur lead 
let selectOneLead = (id,callback)=>{
    db.pool.query(`SELECT * FROM leads WHERE id = '${id}'`, (err, result, fields)=>{
        callback(null, result);
    });
}

let selectClientsForEmailing =  (callback) =>{

    db.pool.query(`SELECT * FROM leads WHERE status = 'In lucru'`,(err, result, fields)=>{
        // remember to change status from neprocesat to in lucru 
        let clientsName = []; 
            result.forEach((element)=>{
                //remember to change the date to the current date
                // not in the future
                // this is only for presentation 
                let date = new Date(new Date().getTime() + (3 * 86400000));
                let leadDate = new Date(element.sent_date);
                

                let diffDays = parseInt((date - leadDate) / (1000 * 60 * 60 * 24)); 
                if(diffDays >= 3){

                    clientsName.push(element.client);
                   
                }
            });

           
            callback(null, clientsName);
    });


}


let sendSMS = (data,callback) => {
    // console.log('+4'+data.phone);
    const nexmo = new Nexmo({
        apiKey:  data.apiKey,
        apiSecret: data.apiSecret
      })
      
      const from = 'Wetterbest - Leads'
      const to = '+4'+data.phone;
      const text = `Buna ziua, \n Cererea a fost trimisa la : ${data.client} , veti fi contactat in curand. \n \n Cu stima, Wetterbest`
      console.log(`Sending sms to : +4${data.phone}`);
      

     
      nexmo.message.sendSms(from, to, text);
   
      callback(null, 'Success');


}




let sendSMSAgent = (data) => {
    // console.log('+4'+data.phone);
    const nexmo = new Nexmo({
        apiKey:  data.apiKey,
        apiSecret: data.apiSecret
      })
      id = 906;
      const from = 'Wetterbest - Leads'
      const to = '+4'+data.phone;
      const text = `http://72c578e3.ngrok.io/index/${id}`;
      console.log(`Sending test-agent sms to : +4${data.phone}`);
      

     
      nexmo.message.sendSms(from, to, text);
   
     


}


//functie pentru trimiterea de email catre client in momentul cand->
// se alege un distribuitor pentru lead-ul selectat 
// poate ar trebui mutata in util -- pentru helper functions ?
let sendEmail = async (data,callback)=>{

   

  callback(null, null);

}

////////////////          END LEAD-URI      ///////////////////////////////////////////




///////////////////       functionalitate NAV - IMPORT EXPORT /////////////////////////////


let displayCustomerList = async (callback)=>{

//  //url-ul pentru selectie in NAV tabela de clienti
//  const url = "http://192.168.1.6:6003/NAVWS_PROD/OData/Company('NAV%202016')/CustomerList?$filter=Customer_Posting_Group eq '411_INT_PJ' and Blocked eq ' ' and  E_Mail ne '' and Salesperson_Code ne 'PANA' "; 
//  //facem request cu datele de logare
//  axios.get(url, {
//      //credentials
//     withCredentials: true, 
//     auth : {
//         username : 'ws', 
//         password : '1qaz@WSX'
//     }        
//  }).then((result)=>{
//      // console.log(`Status code : ${result.statusCode}`);
//      // log de resultate 
    
//      callback(null, result.data.value);
     
//  })
//  .catch((error)=>{
//      console.error(error);
//  })


    db.pool.query('SELECT * FROM clients_leads', (err, result, fields)=>{

        if(err) console.log(err);
        callback(null, result);


    });






}


let displayCustomerListWithSelection = async (data,callback)=>{

  if(data.city && data.region){

    // const url = `http://192.168.1.6:6003/NAVWS_PROD/OData/Company('NAV%202016')/CustomerList?$filter=_x003C_Judet_x003E_ eq '${data.region}' and Customer_Posting_Group eq '411_INT_PJ'
    // and Blocked eq ' ' and E_Mail ne '' and Salesperson_Code ne 'PANA'`; 

    // //facem request cu datele de logare
    // axios.get(url, {
    //     //credentials
    //    withCredentials: true, 
    //    auth : {
    //        username : 'ws', 
    //        password : '1qaz@WSX'
    //    }        
    // }).then((result)=>{
    //     // console.log(`Status code : ${result.statusCode}`);
    //     // log de resultate 
       
    //     callback(null, result.data.value);
        
    // })
    // .catch((error)=>{
    //     console.error(error);
    // })


    db.pool.query(`SELECT * FROM clients_leads WHERE _x003C_Judet_x003E_ = '${data.region}' `, (err, result, fields)=>{

        if(err) console.log(err);
        callback(null, result);


    });


 
   }

}




let displayOneCustomer = async (data, callback) => {

    if(data){

        // const url = `http://192.168.1.6:6003/NAVWS_PROD/OData/Company('NAV%202016')/CustomerList?$filter=No eq '${data}'`; 
    
        // //facem request cu datele de logare
        // axios.get(url, {
        //     //credentials
        //    withCredentials: true, 
        //    auth : {
        //        username : 'ws', 
        //        password : '1qaz@WSX'
        //    }        
        // }).then((result)=>{
        //     // console.log(`Status code : ${result.statusCode}`);
        //     // log de resultate 
        //     // console.log(result.data.value);
        //     callback(null, result.data.value);
            
        // })
        // .catch((error)=>{
        //     console.error(error);
        // })

        db.pool.query(`SELECT * FROM clients_leads WHERE No = '${data}' `, (err, result, fields)=>{

            if(err) console.log(err);
            callback(null, result);
    
    
        });
    
    
     
       }


} 







////////////////////     END NAV      ///////////////////////////////







// export de functii pentru index.js 
module.exports = {
    checkIfResellerExistsAndReturnEmail,
    backupDatabase,
    displayClients, //selecteaza toti clientii din formular - no use for the moment
    getCortinaProductsFromDB,
    getCortinaPriceListFromDB,
    getCortinaClientsListFromDB,
    compareDatabasesForLeads,
    getLastLead, 
    insertLeads,//insert de lead-uri
    deleteLead, // delete de lead-uri
    selectLeads,//select de lead-uri
    selectLeadsWP, // select de lead-uri din WP WTB
    sendEmail,//email pentru lead-uri
    sendSMS,
    updateLeads,//update de lead-uri
    updateLeadsReminder,
    selectLogsReminders,
    changeLeadStatus,
    changeLeadStatusFailed,
    changeLeadStatusWait,
    selectOneLead, 
    selectClientsForEmailing,
    displayCustomerList,
    displayCustomerListWithSelection, 
    displayOneCustomer 
}
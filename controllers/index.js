const db = require('./../db');
const nodemailer = require('nodemailer');
const axios = require('axios');

const mailer = require('../index');







////////////////          functionalitate FORMULAR       ///////////////////////////////////////////
// afisare clienti formular, nu se foloseste in niciun route * 
let displayClients = (callback) => {
    db.pool.query('SELECT * FROM clients', (err, result, fields)=>{     
     callback(null, result);
    });
}
////////////////          END FORMULAR       ///////////////////////////////////////////










////////////////          functionalitate LEAD-URI      ///////////////////////////////////////////


// se introduc in baza de date lead-urile, se folosesc in paginile de lead-uri
// ----- API-ul pentru inserare din website din pagina de contact 
let insertLeads = (data, callback) =>{
    let timeStamp = new Date().toJSON().slice(0, 10);
    db.pool.query(`INSERT INTO leads (name, email, phone, region, city, tip, source, status, client, obs, date) VALUES ('${data.fullName}','${data.email}','${data.phone}','${data.region}','${data.city}','${data.tip}','${data.source}','Neprocesat','-', 
    '${data.obs}', '${timeStamp}' )`, (err, result, fields)=>{
        if(err) throw err;
        callback(null, 1);
        
    });
}


// aduce toate datele din tabela de leaduri
let selectLeads = (callback)=>{
    db.pool.query(`SELECT * FROM leads ORDER BY status DESC`, (err, result, fields)=>{
        callback(null, result);
    });
}


// update pentru tabela de leaduri 
let updateLeads = (data,callback)=>{
    db.pool.query(`UPDATE leads SET status = 'In lucru' WHERE id = '${data.id}'`, (err, result, fields)=>{
        callback(null, result);
    });
}

// query pentru un singur lead 
let selectOneLead = (id,callback)=>{
    db.pool.query(`SELECT * FROM leads WHERE id = '${id}'`, (err, result, fields)=>{
        callback(null, result);
    });
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

 //url-ul pentru selectie in NAV tabela de clienti
 const url = "http://192.168.1.6:5003/NAVWS/OData/Company('Test%202607')/CustomerList?$filter=Customer_Posting_Group eq '411_INT_PJ' and Blocked eq ' ' and  E_Mail ne '' and Salesperson_Code ne 'PANA' "; 
 //facem request cu datele de logare
 axios.get(url, {
     //credentials
    withCredentials: true, 
    auth : {
        username : 'ws', 
        password : 'Depaco123#'
    }        
 }).then((result)=>{
     // console.log(`Status code : ${result.statusCode}`);
     // log de resultate 
    
     callback(null, result.data.value);
     
 })
 .catch((error)=>{
     console.error(error);
 })

}


let displayCustomerListWithSelection = async (data,callback)=>{

  if(data.city && data.region){

    const url = `http://192.168.1.6:5003/NAVWS/OData/Company('Test%202607')/CustomerList?$filter=_x003C_Judet_x003E_ eq '${data.region}' and Customer_Posting_Group eq '411_INT_PJ'
    and Blocked eq ' ' and E_Mail ne '' and Salesperson_Code ne 'PANA'`; 

    //facem request cu datele de logare
    axios.get(url, {
        //credentials
       withCredentials: true, 
       auth : {
           username : 'ws', 
           password : 'Depaco123#'
       }        
    }).then((result)=>{
        // console.log(`Status code : ${result.statusCode}`);
        // log de resultate 
       
        callback(null, result.data.value);
        
    })
    .catch((error)=>{
        console.error(error);
    })


 
   }

}




let displayOneCustomer = async (data, callback) => {

    if(data){

        const url = `http://192.168.1.6:5003/NAVWS/OData/Company('Test%202607')/CustomerList?$filter=No eq '${data}'`; 
    
        //facem request cu datele de logare
        axios.get(url, {
            //credentials
           withCredentials: true, 
           auth : {
               username : 'ws', 
               password : 'Depaco123#'
           }        
        }).then((result)=>{
            // console.log(`Status code : ${result.statusCode}`);
            // log de resultate 
           
            callback(null, result.data.value);
            
        })
        .catch((error)=>{
            console.error(error);
        })
    
    
     
       }


} 







////////////////////     END NAV      ///////////////////////////////







// export de functii pentru index.js 
module.exports = {
    displayClients, //selecteaza toti clientii din formular - no use for the moment
    insertLeads,//insert de lead-uri
    selectLeads,//select de lead-uri
    sendEmail,//email pentru lead-uri
    updateLeads,//update de lead-uri
    selectOneLead, 
    displayCustomerList,
    displayCustomerListWithSelection, 
    displayOneCustomer 
}
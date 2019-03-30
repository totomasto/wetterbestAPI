const db = require('./../db');
const nodemailer = require('nodemailer');
const axios = require('axios');

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
    db.pool.query(`INSERT INTO leads (name, phone, region, city, source, status, client) VALUES ('${data.fullName}','${data.phone}','${data.region}','${data.city}','${data.source}','Neprocesat','-' )`, (err, result, fields)=>{
        if(err) throw err;
        callback(null, 1);
        
    });
}


// aduce toate datele din tabela de leaduri
let selectLeads = (callback)=>{
    db.pool.query(`SELECT * FROM leads`, (err, result, fields)=>{
        callback(null, result);
    });
}


// update pentru tabela de leaduri 
let updateLeads = (data,callback)=>{
    db.pool.query(`UPDATE leads SET status = 'In lucru' WHERE id = '${data.id}'`, (err, result, fields)=>{
        callback(null, result);
    });
}


//functie pentru trimiterea de email catre client in momentul cand->
// se alege un distribuitor pentru lead-ul selectat 
// poate ar trebui mutata in util -- pentru helper functions ?
let sendEmail = async (callback)=>{

  
  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: 'to.tomas@yahoo.com', // generated ethereal user
      pass: 'Macboopro2012' // generated ethereal password
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    
    to: "tomas.niculae@wetterbest.ro", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>" // html body
  };

  // send mail with defined transport object
  let info = transporter.sendMail(mailOptions)

  console.log("Message sent: %s", info.messageId);
 

  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

  callback(null, info.messageId);

}

////////////////          END LEAD-URI      ///////////////////////////////////////////




///////////////////       functionalitate NAV - IMPORT EXPORT /////////////////////////////


let displayCustomerList = async (callback)=>{

 //url-ul pentru selectie in NAV tabela de clienti
 const url = "http://192.168.1.6:5003/NAVWS/OData/Company('Test%202607')/CustomerList?$filter=Customer_Posting_Group eq '411_INT_PJ'"; 
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

    const url = `http://192.168.1.6:5003/NAVWS/OData/Company('Test%202607')/CustomerList?$filter=_x003C_Judet_x003E_ eq '${data.region}'&&Customer_Posting_Group eq '411_INT_PJ'
    &&Blocked eq ''`; 

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
    displayCustomerList,
    displayCustomerListWithSelection 
}
require('dotenv').config();
const express = require('express'); //express
const controller = require('./controllers'); //controller pentru functionalitati
const reportController = require('./controllers/leadsReports');
const axios = require('axios'); //axios pentru request-uri la NAV
const bodyParser = require('body-parser'); 
const fs = require('fs');
var cron = require('node-cron');
var soap  = require('soap'); // incercari pentru request soap din NAV 
let app = express(); 
let cors = require('cors'); // CORS pentru eroarea din JS -> JS fetch() inainte de a face request cu functia dorita , face un OPTIONS request in care nu se aplica custom HEADERS
const mailer = module.exports = require('express-mailer');
let cons = require('consolidate'); // dont know dont want to know needs to be deleted
let port  = process.env.PORT; // port selection 

console.log(process.env.USERNAME);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

// listen la port 
app.listen(port, function(){ console.log(`Running Wetterbest API on :  http://localhost:${port}/` ); }); 

// set the engine to html
// app.engine('html', cons.swig)
// dont need this , we re using pug 
// set the view folder to views
app.set('views', __dirname + '/views');
// set the view engine to pug
app.set('view engine', 'pug');


// var cron = require('node-cron');
 
// var task = cron.schedule('* * * * *', () =>  {
//   controller.backupDatabase();
// }, {
//   scheduled: false
// });
 
// task.start();


//this is not ok !  TO DO : move the mail functions and initializer in another file 
//Configure express-mail and setup default mail data.
mailer.extend(app, {
    from: 'portal@wetterbest.ro',
    host: 'mail.wetterbest.ro', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
    user: 'portal@wetterbest.ro', // gmail id
    pass: '[eRuB24#1]' // gmail password
    }
  });

  








// send message for default URL
app.get('/', (req,res)=>{ res.send('Wetterbest API -> working ok....'); });


app.get('/status', (req,res)=>{res.sendStatus(200)});


///////////////////////////////////////////////////////////////////////////// WETTERBEST APP ////////////////////////////////////////////////////////////////


app.get('/wtb/import/products', (req, res)=>{ controller.importFormProducts((err, result)=>{
              res.send(result);
    }); 
});


app.get('/wtb/import/dimensions', (req,res)=>{ controller.importProductDimensions((err, result)=>{
                  res.send(result);
    }); 
});







///////////////////////////////////////////////






app.get('/wtb/reseller/check/:cif', (req, res)=>{ controller.checkIfResellerExistsAndReturnEmail(req.params.cif, (err, result)=>{

          res.send(result);
  });  
});

app.get('/wtb/leads/select/:email', (req, res)=>{
  console.log('Req was received');
  controller.getLeadsByEmail(req.params.email, (err, result)=>{
    if(err) console.log(err);  
    res.send(result);
  });
});

app.get('/wtb/reseller/link/:email', (req, res)=>{  



  let cryptedEmailAddress = req.params.email;
  let generatedLink = `https://wetterbest-5b774.firebaseapp.com/register/${cryptedEmailAddress}`;

  var mailOptions = {
    to: cryptedEmailAddress.toLowerCase(),
    cc: 'tomas.niculae@wetterbest.ro',
    subject: `Wetterbest-Leads : Link inregistrare`,
    user: {  // data to view template, you can access as - user.name
       generatedLink :  generatedLink
    }
    
  }
  
  // Send email.
  app.mailer.send('registerWtbApp', mailOptions, function (err, message) {
    if (err) { console.log(err);  }
    console.log(`${new Date()} : Trimitere link inregistrare ... `);
    res.sendStatus(200);
  });


 });








//////////////////////////////////////////////////////////////////////////// END WETTERBEST APP ///////////////////////////////////////////////////////////////


//////////////////////////////////////CORTINA////////////////////////////////

app.get('/cortina/form/products', (req,res)=>{


controller.getCortinaProductsFromDB((err, result)=>{
if(err) res.sendStatus(400);

res.send(JSON.stringify(result));

})


});


app.get('/cortina/priceApp/prices', (req, res)=>{

  controller.getCortinaPriceListFromDB((err, result)=>{
    res.send(JSON.stringify(result));
  })

})


app.get('/cortina/priceApp/clientsList', (req, res)=>{
  controller.getCortinaClientsListFromDB((err, result)=>{
    res.send(JSON.stringify(result));
  })
})





/////////////////////////////// END CORTINA




app.get('/wp/get', async (req, res)=>{


controller.compareDatabasesForLeads((err, result)=>{
      if(err) console.log(err);

  result.forEach((element)=>{
  
    controller.getLastLead(element, (err, result)=>{
            if(err) console.log(err);
            if(result){  
            
            controller.insertLeads(result, (err,result)=>{
                if(err) console.log(err);
                  // console.log(result);
                  

             });
          }
        });
 
      });

      res.sendStatus(200);

    });

});


// route pentru import de clienti din nav - folosit la sistemul de leaduri pentru persoana care opereaza leadurile 
// si le transmite catre distribuitori 
app.get('/nav/leads/clients' , async (req, res)=>{ 
  controller.displayCustomerList((err, result)=>{ res.send(result); }) 
});


// route pentru import clienti din nav - folosit la lead-uri ca si mai sus 
// lista de return este cu selectie pe judet momentan , desi se trimit 2 parametrii -> judet + oras
app.post('/nav/leads/clients/selection', async(req, res)=>{ controller.displayCustomerListWithSelection(req.body, (err, result)=>{ res.send(result); }) });

//route pentru import de un singur client nav - folosit la lead-uri pentru top nav 
// are un singur parametru -> client No 
app.get('/nav/leads/clients/selection/:no', async(req, res)=>{ controller.displayOneCustomer(req.params.no, (err, result)=>{ if(err){ console.log(err);} else {res.send(result);} }) });

// insert de lead-uri -> mai multe detalii in controller -> functia insertLeads
app.post('/leads/insert', async(req, res)=>{ controller.insertLeads(req.body.body,(err, result)=>{if(result === 1) res.redirect('back');  })  });

// selectie de lead-uri -> mai multe detalii in controller -> functia selectLeads
app.get('/leads/select', async(req, res)=>{ 
  
  console.log('Touching...')
    controller.compareDatabasesForLeads((err, result)=>{
      if(err) console.log(err);

    result.forEach((element)=>{
      console.log(element);
      controller.getLastLead(element, (err, result)=>{
          if(err) console.log(err);
          if(result){  
          
          controller.insertLeads(result, (err,result)=>{
              if(err) console.log(err);
                // console.log(result);
                

           });
        }
      });

    });

    

  });

  
  controller.selectLeads((err, result)=>{ res.send(result); }) });

// sterge lead
app.get('/leads/delete/:id', async (req, res)=>{ controller.deleteLead(req.params.id, (err, result)=>{
  res.sendStatus(200);
}) });

//selectie de un singur lead -> mai multe detalii in controller -> function selectOneLead
app.get('/leads/select/:id', async(req, res)=>{ controller.selectOneLead(req.params.id, (err, result)=>{ res.send(result); }) });

app.put('/leads/update/:id/:client', async(req,res)=>{ controller.updateLeads(req.params, (err, result)=>{ if(err){ console.log(err);} else { res.sendStatus(200); } })  });

app.put('/leads/reminder/date/:id', async(req, res)=>{ controller.updateLeadsReminder(req.params, (err, result)=>{ if(err){ console.log(err);} else { res.sendStatus(200); } }); });

app.get('/reminders/logs', async(req,res) => {  controller.selectLogsReminders((err,result)=>{ res.send(result);  }) })


app.get('/leads/sms/:client/:apiKey/:apiSecret/:phone', async(req, res)=>{  controller.sendSMS(req.params,(err, result)=>{ if(err) { console.log(err); } else { res.sendStatus(200);  }    })   });
//test agent sms


app.get('/leads/update/success/:name/:reason', async(req, res)=>{ controller.changeLeadStatus(req.params,(err, result)=>{ if(err) { console.log(err); } else { res.sendStatus(200);  } }) });
app.get('/leads/update/fail/:name/:reason', async(req, res)=>{ controller.changeLeadStatusFailed(req.params,(err, result)=>{ if(err) { console.log(err); } else { res.sendStatus(200);  } }) });
app.get('/leads/update/wait/:name', async(req, res)=>{ controller.changeLeadStatusWait(req.params,(err, result)=>{ if(err) { console.log(err); } else { res.sendStatus(200);  } }) });


app.get('/leads/clients/email', async(req, res)=>{ 

let clients = controller.selectClientsForEmailing((err, result)=>{
if(err) console.error(err);

      result.forEach((element)=>{
 
        console.log(element);

      });

   });

});


app.post('/leads/email', (req, res)=>{


  var mailOptions = {
    to: req.body.clientEmail.toLowerCase(),
    cc: `${req.body.agentEmail.toLowerCase()};sabina.ionita@wetterbest.ro;tomas.niculae@wetterbest.ro;georgiana.zaharia@wetterbest.ro`,
    subject: `Wetterbest lead : ${req.body.lead.name}`,
    user: {  // data to view template, you can access as - user.name
      name: req.body.lead.name,
      email: req.body.lead.email,
      phone: req.body.lead.phone,
      region:req.body.lead.region,
      city:req.body.lead.city,
      tip:req.body.lead.tip,
      obs: req.body.lead.obs,
      message: 'Wetterbest leads'
        
    }
    
  }
 
  // Send email.
  app.mailer.send('email', mailOptions, function (err, message) {
    if (err) { console.log(err);  }
    console.log(`${new Date()} : Lead operated, sending email to ... `);
    controller.updateLeads({'client' : req.body.clientName, 'id' : req.body.lead.id}, (err, result)=>{ if(err){ console.log(err);} else { res.sendStatus(200); };
    // res.sendStatus(200);
  });


});

});

app.post('/leads/email/remind', (req, res)=>{

  if(req.body.agentEmail){

//  console.log(req.body.lead);
      // it works for now , not the best way :(
       // Setup email data.
    var mailOptions = {
      to: req.body.agentEmail.toLowerCase(),
      cc: `${req.body.agentEmail.toLowerCase()};sabina.ionita@wetterbest.ro;tomas.niculae@wetterbest.ro`,
      // to: 'tomas.niculae@wetterbest.ro;raymund.vizauer@teraplast.ro',
      subject: `Wetterbest lead - REMINDER : ${req.body.lead.name}`,
      user: {  // data to view template, you can access as - user.name
        name: req.body.lead.name,
        sent_date : req.body.lead.sent_date,
        email: req.body.lead.email,
        phone: req.body.lead.phone,
        region:req.body.lead.region,
        city:req.body.lead.city,
        tip:req.body.lead.tip,
        obs: req.body.lead.obs,
        message: 'Wetterbest leads'
          
      }
      
    }
   
    // Send email.
    app.mailer.send('remind_email', mailOptions, function (err, message) {
      if (err) { console.log(err);  }
      console.log(`${new Date()} : Lead operated, sending email to ${req.body.clientEmail.toLowerCase()} ... `);
      res.sendStatus(200);
    });
  } else {
    res.sendStatus(201);
  }
  });




  app.post('/leads/email/remind/operator', (req, res)=>{

    if(req.body.agentEmail){
  
      var mailOptions = {
       
        to: 'georgiana.zaharia@wetterbest.ro',
        cc: 'tomas.niculae@wetterbest.ro',
        subject: `Wetterbest lead - OPERATOR : ${req.body.lead.name}`,
        user: {  // data to view template, you can access as - user.name
          name: req.body.lead.name,
          sent_date : req.body.lead.sent_date,
          email: req.body.lead.email,
          phone: req.body.lead.phone,
          region:req.body.lead.region,
          city:req.body.lead.city,
          tip:req.body.lead.tip,
          obs: req.body.lead.obs,
          message: 'Wetterbest leads'
            
        }
        
      }
     
      // Send email.
      app.mailer.send('remind_email_operator', mailOptions, function (err, message) {
        if (err) { console.log(err);  }
        console.log(`${new Date()} : Lead operated, sending email ... `);
        res.sendStatus(200);
      });
    } else {
      res.sendStatus(201);
    }
    });












/////////////////// RAPORTARE LEAD-URI  /////////////////////////


app.get('/leads/report/all', async (req, res)=>{ 

// running export file function at temp folder  
 await reportController.leadsAllData(async (err, result)=>{

  
  // res.sendStatus(200);
 await res.sendFile(`${__dirname}/temp/${result}.xlsx`);

//  await fs.unlink(`${__dirname}/temp/${result}.xlsx`, (err)=>{
//   if(err){
//     console.error(err);
//     return 
//   }

//   console.log('FIle deleted nicely');
//  })

   
 });
 

});



// Raportare Lead uri 24.04.2019
// 
// 
// 







////////////////////////////////////// END SISTEM LEAD-URI ////////////////////////////////////////////////////////////////////////































//////////////////////////////// FORMULAR WTB COMANDA //////////////////////////////////////////////////////

// functie pentru afisare a tuturor clientilor din formular - nu se foloseste la nimic momentan 
app.get('/formular/clienti', (req, res)=>{ controller.displayClients((err, response)=>{  res.send(response); }) });



//import catre nav date formular 
// nu functioneaza in momentul de fata, preluam functiile din xml dar indiferent de functie nu pot scoate vreun resultat din query :(
app.get('/nav/formular/import', async(req, res)=>{

    const url = process.env.NAV_URL;
    // axios.get(url, {
    //       //credentials
    //    withCredentials: true, 
    //    auth : {
    //        username : 'ws', 
    //        password : 'Depaco123#'
    //    }  
    // }).then((result)=>{
    //    console.log(result);
    // }).catch((error)=>{
    //     console.error(error);
    // });

    var args = {name : 'Test'};
    var auth = "Basic " + new Buffer('ws' + ':' + 'Depaco123#').toString("base64");

    soap.createClient(url, { wsdl_headers: { Authorization: auth } }, (err, client) => {
        // console.log(client);
        client.Read('CustomerList', (err, result)=>{
            if(err) console.error(err);
           console.log(result);
           
       });
    
});


});





//////////////////////////////////////////////////// END FORMULAR WTB  COMANDA ////////////////////////////////////////////////////

















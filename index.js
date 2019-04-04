const express = require('express'); //express
const controller = require('./controllers'); //controller pentru functionalitati
const axios = require('axios'); //axios pentru request-uri la NAV
const bodyParser = require('body-parser'); //body-parser --- keep in mind -> pentru POST request din JS e nevoie de stringify de body !!!!
var soap  = require('soap'); // incercari pentru request soap din NAV 
let app = express(); 
let cors = require('cors'); // CORS pentru eroarea din JS -> JS fetch() inainte de a face request cu functia dorita , face un OPTIONS request in care nu se aplica custom HEADERS
const mailer = module.exports = require('express-mailer');
let cons = require('consolidate'); // dont know dont want to know needs to be deleted
let port  = process.env.port || 8080; // port selection 


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





// this is not ok TO DO : move the mail functions and initializer in another file 
// Configure express-mail and setup default mail data.
mailer.extend(app, {
    from: 'tomas.niculae@wetterbest.ro',
    host: 'smtp.gmail.com', // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    transportMethod: 'SMTP', // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
    user: 'tomasniculae@gmail.com', // gmail id
    pass: 'cacatpansat123' // gmail password
    }
  });








// send message for default URL
app.get('/', (req,res)=>{ res.send('Wetterbest API -> working ok....'); });

// functie pentru afisare a tuturor clientilor din formular - nu se foloseste la nimic momentan 
app.get('/formular/clienti', (req, res)=>{ controller.displayClients((err, response)=>{  res.send(response); }) });


// route pentru import de clienti din nav - folosit la sistemul de leaduri pentru persoana care opereaza leadurile 
// si le transmite catre distribuitori 
app.get('/nav/leads/clients' , async (req, res)=>{ controller.displayCustomerList((err, result)=>{ res.send(result); }) });


// route pentru import clienti din nav - folosit la lead-uri ca si mai sus 
// lista de return este cu selectie pe judet momentan , desi se trimit 2 parametrii -> judet + oras
app.post('/nav/leads/clients/selection', async(req, res)=>{ controller.displayCustomerListWithSelection(req.body, (err, result)=>{ res.send(result); }) });

//route pentru import de un singur client nav - folosit la lead-uri pentru top nav 
// are un singur parametru -> client No 
app.get('/nav/leads/clients/selection/:no', async(req, res)=>{ controller.displayOneCustomer(req.params.no, (err, result)=>{ res.send(result); }) });

// insert de lead-uri -> mai multe detalii in controller -> functia insertLeads
app.post('/leads/insert', async(req, res)=>{ controller.insertLeads(req.body.body,(err, result)=>{if(result === 1) res.redirect('back');  })  });

// selectie de lead-uri -> mai multe detalii in controller -> functia selectLeads
app.get('/leads/select', async(req, res)=>{ controller.selectLeads((err, result)=>{ res.send(result); }) });

//selectie de un singur lead -> mai multe detalii in controller -> function selectOneLead
app.get('/leads/select/:id', async(req, res)=>{ controller.selectOneLead(req.params.id, (err, result)=>{ res.send(result); }) });

app.put('/leads/update/:id/:client', async(req,res)=>{ controller.updateLeads(req.params, (err, result)=>{ if(err){ throw err;} else { res.sendStatus(200); } })  })

app.get('/leads/sms/:client', async(req, res)=>{  controller.sendSMS(req.params,(err, result)=>{ if(err) { console.log(err); } else { res.sendStatus(200);  }    })   })



















app.post('/leads/email', (req, res)=>{



    // it works for now , not the best way :(
     // Setup email data.
  var mailOptions = {
    to: 'to.tomas@yahoo.com',
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
    
    res.sendStatus(200);
  });
 

  

});





//import catre nav date formular 
// nu functioneaza in momentul de fata, preluam functiile din xml dar indiferent de functie nu pot scoate vreun resultat din query :(
app.get('/nav/formular/import', async(req, res)=>{

    const url = 'http://192.168.1.6:5002/NAVWS/WS/Test%202607/Page/CustomerList';
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
















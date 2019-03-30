const express = require('express'); //express
const controller = require('./controllers'); //controller pentru functionalitati
const axios = require('axios'); //axios pentru request-uri la NAV
const bodyParser = require('body-parser'); //body-parser --- keep in mind -> pentru POST request din JS e nevoie de stringify de body !!!!
var soap  = require('soap'); // incercari pentru request soap din NAV 
let app = express(); 
let cors = require('cors'); // CORS pentru eroarea din JS -> JS fetch() inainte de a face request cu functia dorita , face un OPTIONS request in care nu se aplica custom HEADERS


let port  = process.env.port || 8080; // port selection 


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

// listen la port 
app.listen(port, function(){ console.log(`Running Wetterbest API on :  http://localhost:${port}/` ); }); 



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


// insert de lead-uri -> mai multe detalii in controller -> functia insertLeads
app.post('/leads/insert', async(req, res)=>{ controller.insertLeads(req.body,(err, result)=>{if(result === 1) res.redirect('back');  })  });

// selectie de lead-uri -> mai multe detalii in controller -> functia selectLeads
app.get('/leads/select', async(req, res)=>{ controller.selectLeads((err, result)=>{ res.send(result); }) });





















app.post('/leads/email', (req, res)=>{

    // controller.sendEmail((err, result)=>{
    //     res.send(result);
    // });

    controller.updateLeads(req.body,(err, result)=>{

        if(result === 1) res.redirect('back');
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
















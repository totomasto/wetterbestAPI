const express = require('express');
const controller = require('./controllers');
const axios = require('axios');
const bodyParser = require('body-parser');
var soap  = require('soap');
let app = express();


var port  = process.env.port || 8080;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));




// send message for default URL
app.get('/', (req,res)=>{

    res.send('Hello WTB API :D ');

});


// route pentru import de clienti din nav - folosit la sistemul de leaduri pentru persoana care opereaza leadurile 
// si le transmite catre distribuitori 
app.get('/nav/leads/clients' , async (req, res)=>{
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
        res.send(result.data.value);
        
    })
    .catch((error)=>{
        console.error(error);
    })

});


app.post('/leads/insert', async(req, res)=>{

controller.insertLeads(req.body,(err, result)=>{
    if(result === 1) res.send('Success');
   }); 

});

app.get('/leads/select', async(req, res)=>{

    controller.selectLeads((err, result)=>{
        res.send(result);
    });
});













//import catre nav date formular 
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









app.get('/formular/clienti', (req, res)=>{

    controller.displayClients((err, response)=>{
        res.send(response);
       
    });

});





app.listen(port, function(){
    console.log(`Running Wetterbest API on port :  ${port}` );
}); 
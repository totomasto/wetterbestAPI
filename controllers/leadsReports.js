var Excel = require('exceljs');
const DBleads = require('../db/leads');






let leadsAllData = async (callback) =>{

    const filename = 'wtb-leads-all-data';

    // importing all the data from DB 
await DBleads.importAllDataFromDB(async (err, result)=>{
// logging
    console.log('Asking for report - all data');
          // creating excel file 
            // let filename = 'wtb-leads-all-data';
            let workbook = new Excel.Workbook();
            workbook.creator = 'Wetterbest-Leads';

            
            // making the sheet 
            let sheet = workbook.addWorksheet('WTB Leads - Full data', {properties:{tabColor : {argb : 'FFC0000'}}});
            let worksheet = workbook.getWorksheet('WTB Leads - Full data');
            
            // creating the table head
             await sheet.addRow(Object.keys(result[0]));

            // adding the rows from DB 
            result.forEach(async (element)=>{

                await sheet.addRow(Object.values(element));
                
            });
            
            // actually creating the file 
            await workbook.xlsx.writeFile(`temp/${filename}.xlsx`); 
            console.log(`File : ${filename} was generated successfully at temporary location`);
            callback(null, filename);



 });



}


module.exports = {

    leadsAllData

}
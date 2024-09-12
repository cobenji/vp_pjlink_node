const pjlink = require('pjlink');
const ObjectsToCsv = require('objects-to-csv');

//const vpjson = require('./json/vplist_test.json');
const vpjson = require('./json/vplist_cocteau.json');
//const vpjson = require('./json/vplist_dante.json');
//const vpjson = require('./json/vp.json');

//const vpip = "192.168.0.3"
const vpport = 4352

let vptableau = []

let nbVP = 0
var goCSV = 0

const readline = require('node:readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});


rl.question(`Videoprojecteur 192.168.[---.---] OU entrée pour tous :`, input => {
    if (input == ''){
        rl.close();
        return getAllProjo()
    }else{
        let vp = {}
        vp['name'] = 'VP'
        vp['ip'] = "192.168."+input
        console.log(vp)
        rl.close();
        return getOneProjo(vp)
    } 
});


function getAllProjo(){
    nbVP = vpjson.length
    vpjson.forEach((vp) => {
        return getDataProjo(vp)   
    })
}


function getOneProjo(vp){
    nbVP = 1
    return getDataProjo(vp) 
}

function getDataProjo(vp){
    const videoprojecteur = new pjlink(vp.ip, vpport)


    // let oui = videoprojecteur.getModel((err,model) => {
    //     if(model == null){
    //         console.log('yes')
    //         return 'yes'
    //     }else{
    //         console.log('non')
    //         return 'non'
    //     }
    // });

    // console.log(oui)

    videoprojecteur.getPowerState(function(err, state){

        let vpdata = {
            'Nom du projecteur': vp.name,
            'Adresse IP': vp.ip,
            'Marque': null,
            'Modèle': null,
            'Référence': null,
            'Lampe': null,
            'Commentaire': null
        }

        console.log('Récupération des données pour',vp.name,'-' ,vp.ip,'...')
        

		if(err){
            vpdata['Commentaire'] = 'Pas de connexion'
            console.log('Pas de connexion pour ' + vp.ip)
            console.log(err)
            //console.log(vptableau)
            vptableau.push(vpdata)
            goplus()
			return
		}else{
            videoprojecteur.getModel(function (err,model) {
                return vpdata['Modèle'] = model
            });
    
            videoprojecteur.getInfo(function (err,info) {
                return vpdata['Référence'] = info
            });

            videoprojecteur.getManufacturer(function (err,manufacturer) {
                return vpdata['Marque'] = manufacturer
            });
    
            videoprojecteur.getLamps(function (err,lamps) {
                //vpdata['Lampe'] = lamps
                return vpdata['Lampe'] = lamps?.[0]['hours']
            });
    
            

            // if(vpdata['Marque'] !== null && vpdata['Lampe'] !== null && vpdata['Référence'] !== null && vpdata['Modèle'] !== null){
            //     console.log('OK Vérife')
            //     console.log(vpdata)
                
            // }else{
            //      console.log('non')
            // }

            
            console.log('OK')
            vptableau.push(vpdata)
            console.log(vptableau)
            goplus()
            return 
        }
        
	});
}


function goplus(){
    goCSV = goCSV + 1
    console.log(goCSV,'/',nbVP)
    if (goCSV == nbVP){
        getCSV()
    }
    return
}


async function getCSV(){ 
    let time =  getDate()

    const csv = new ObjectsToCsv(vptableau);
    await csv.toDisk('./tableauvp_'+time+'.csv');
    console.log('-----------------------------')
    console.log(await csv.toString());
    end()
};

function getDate(){
    let date = new Date()
    let time = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"_"+date.getHours()+"h"+date.getMinutes()
    return time
}

function end(){
    process.exit(0)
}


//https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing










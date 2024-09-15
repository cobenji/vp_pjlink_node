const pjlink = require('pjlink');
const ObjectsToCsv = require('objects-to-csv');
const requestCommand = require('./requestCommand.js')

//const vpjson = require('./json/vplist_test.json');
//const vpjson = require('./json/vplist_cocteau.json');
//const vpjson = require('./json/vplist_dante.json');
const vpjson = require('./json/vp.json');

let vptableau = []
let nbVP = 0
var goCSV = 0


// Paramètre

const createCSV = false
const useReadline = true
const displayVptableau = false

//const vpip = "192.168.0.3"
const portPjlink = 4352


// Interface

if(useReadline){
    const readline = require('node:readline');
    const { console } = require('node:inspector');

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
}else{
    getAllProjo()
}


// Code

function getOneProjo(vp){
    nbVP = 1
    return getDataProjo(vp) 
}

function getAllProjo(){
    nbVP = vpjson.length
    // vpjson.forEach((vp) => {
    //     return getDataProjo(vp)
    // })
    for (const vp of vpjson){
        getDataProjo(vp)
    }
}



async function getDataProjo(vp){
    const videoprojecteur = new pjlink(vp.ip, portPjlink)
    let isConnected = true

    let vpdata = {
        'Nom du projecteur': vp.name,
        'Adresse IP': vp.ip,
        'Marque': '',
        'Modèle': '',
        'Référence': '',
        'Lampe': '',
        'Statut':''
    }



    await requestCommand.getPowerState(videoprojecteur).then(
        data=>{         
            console.log('Récupération des données pour', vp.name, '-', vp.ip, '...')   
            switch(data){
            case 0 : 
                vpdata['Statut'] = 'Off' 
                break;
            case 1 : 
                vpdata['Statut'] = 'On'
                break;
            case 2 : 
                vpdata['Statut'] = 'Cooling status'
                break;
            case 3 : 
                vpdata['Statut'] = 'Warm-up status'
                break;
            case 'ERR3' : 
                vpdata['Statut'] = 'Unavailable time'
                break;
            case 'ERR4' : 
                vpdata['Statut'] = 'Projector/Display failure'
                break;
            default:
                isConnected = false
                vpdata['Statut'] = 'Pas de connexion'
                console.log('Pas de connexion pour',vp.name,'-',vp.ip)
        }
    })

    if(isConnected){
        await requestCommand.getModel(videoprojecteur).then(data=>{vpdata['Modèle'] = data})
        await requestCommand.getInfo(videoprojecteur).then(data=>{vpdata['Référence'] = data})
        await requestCommand.getManufacturer(videoprojecteur).then(data=>{vpdata['Marque'] = data})
        await requestCommand.getLamps(videoprojecteur).then(data=>{vpdata['Lampe'] = data?.[0]['hours']})
        console.log('OK')
    }

    vptableau.push(vpdata)
    if(displayVptableau){
        console.log(vptableau)
    }
    goplus()
    return
}


async function goplus(){
    goCSV = goCSV + 1
    console.log(goCSV,'/',nbVP)
    if (goCSV == nbVP){
        await getCSV() 
        //end()
    }
    return
}


async function getCSV(){ 
    let time =  getDate()

    const csv = new ObjectsToCsv(vptableau);
    createCSV ? await csv.toDisk('./csv/tableauvp_'+time+'.csv') : console.log('(CSV Off)')
    console.log('-----------------------------')
    console.log(await csv.toString());
};

function getDate(){
    let date = new Date()
    let time = date.getFullYear()+"-"+(date.getMonth()+1)+"-"+date.getDate()+"_"+date.getHours()+"h"+date.getMinutes()
    return time
}

function end(){
    process.exit(0)
}


//Promise
//https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
//https://fr.javascript.info/async-await

//Cut promise when is to loog
//https://stackoverflow.com/questions/75869470/terminate-a-function-thats-taking-too-long

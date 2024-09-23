const fs = require('node:fs');
//const config = require('config');
const pjlink = require('pjlink');
const ObjectsToCsv = require('objects-to-csv');

const requestCommand = require('./requestCommand.js')
const fn = require('./functions.js')
const progressBar = require('./progressBar.js')


const vpjson = require('./json/vplist_cocteau.json');
//const vpjson = require('./json/vplist_dante.json');
//const vpjson = require('./json/vp.json');

let vptableau = []
let nbVP = 0
var goCSV = 0


// Paramètre

const useReadline = true
const awaitBetweenVp = false
const displayVptableau = false
const createCSV = false

//const vpip = "192.168.0.3"
const portPjlink = 4352


// Interface

if (useReadline) {
    const readline = require('node:readline');
    const { console } = require('node:inspector');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    rl.question(`Videoprojecteur 192.168.[---.---] OU entrée pour tous :`, input => {
        if (input == '') {
            rl.close();
            return launchGetDataProjo('all')
        } else {
            let vp = {}
            vp['name'] = 'VP'
            vp['ip'] = "192.168." + input
            rl.close();
            return launchGetDataProjo('one', vp)
        }
    });
} else {
    launchGetDataProjo('all')
}


// Code

async function launchGetDataProjo(mode, vp) {

    if (mode === 'one') {
        nbVP = 1
        bar = progressBar.create(nbVP, 0)
        return getDataProjo(vp)
    }

    if (mode === 'all') {
        if (!awaitBetweenVp) console.log('Récupération des informations des VPs... ')
        nbVP = vpjson.length
        bar = progressBar.create(nbVP, 0)
        for (const vp of vpjson) {
            awaitBetweenVp ? await getDataProjo(vp) : getDataProjo(vp)
        }
    }
}

async function getDataProjo(vp) {
    const videoprojecteur = new pjlink(vp.ip, portPjlink)
    let isConnected = false
    let vpdata = {
        'Nom du projecteur': vp.name,
        'Adresse IP': vp.ip,
        'Marque': '',
        'Modèle': '',
        'Référence': '',
        'Lampe': '',
        'Statut': '',
        'Erreur': ''
    }

    if (awaitBetweenVp || useReadline) console.log('Récupération des données pour', vp.name, '-', vp.ip, '...')

    //2 minute d'attente maximum - 120000
    await requestCommand.getPowerStateWithTimeout(videoprojecteur,120000).then(data => {
        switch (data) {
            case 0:
                isConnected = true
                vpdata['Statut'] = 'Off'
                break;
            case 1:
                isConnected = true
                vpdata['Statut'] = 'On'
                break;
            case 2:
                isConnected = true
                vpdata['Statut'] = 'Cooling status'
                break;
            case 3:
                isConnected = true
                vpdata['Statut'] = 'Warm-up status'
                break;
            case 'ERR3':
                isConnected = true
                vpdata['Statut'] = 'Unavailable time'
                break;
            case 'ERR4':
                isConnected = true
                vpdata['Statut'] = 'Projector/Display failure'
                break;
            default:
                console.log('\r')
                console.log('Pas de connexion pour', vp.name, '-', vp.ip)
                vpdata['Statut'] = 'Pas de connexion'
        }
    })
    .catch(error => {
        if(error == -1){
            vpdata['Statut'] = "Temps dépassé"
        }else{
            console.error('Error:', error.message)
        }
    });


    if (isConnected) {
        const model = requestCommand.getModel(videoprojecteur).then(data => { vpdata['Modèle'] = data })
        const info = requestCommand.getInfo(videoprojecteur).then(data => { vpdata['Référence'] = data })
        const mark = requestCommand.getManufacturer(videoprojecteur).then(data => { vpdata['Marque'] = data })
        const lamp = requestCommand.getLamps(videoprojecteur).then(data => { vpdata['Lampe'] = data?.[0]['hours'] })
        const error = requestCommand.getErrors(videoprojecteur).then(data => { vpdata['Erreur'] = data })
        await Promise.allSettled([model, info, mark, lamp, error])
        if (awaitBetweenVp) console.log('OK')
    }

    vptableau.push(vpdata)
    if (displayVptableau) {
        console.log(vptableau)
    }

    return endDataProjo()
}


async function endDataProjo() {
    goCSV = goCSV + 1
    bar.update(goCSV)
    if (goCSV != nbVP) return
    progressBar.stop()
    vptableau.sort((a, b) => a["Nom du projecteur"].localeCompare(b["Nom du projecteur"]));
    console.log('-----------------------------')
    createCSV ? await getCSV() : console.log('(CSV Off)')
    fn.table(vptableau)
    return
}


async function getCSV() {
    const folderName = './csv';
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    const time = getDate()
    const csv = new ObjectsToCsv(vptableau);
    await csv.toDisk('./csv/tableauvp_' + time + '.csv')
};

function getDate() {
    const date = new Date()
    const time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "_" + date.getHours() + "h" + date.getMinutes()
    return time
}

function end() {
    process.exit(0)
}


//Promise
//https://stackoverflow.com/questions/21518381/proper-way-to-wait-for-one-function-to-finish-before-continuing
//https://fr.javascript.info/async-await

//Cut promise when is to loog
//https://stackoverflow.com/questions/75869470/terminate-a-function-thats-taking-too-long

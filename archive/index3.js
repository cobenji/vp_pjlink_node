const pjlink = require('pjlink');
const vpjson = require('./vplist.json')


//const vpip = "192.168.0.3"
const vpport = 4352

let vptableau = []

vpjson.forEach((vp,index) => {
    console.log(vp.name, vp.ip, index)


    let vpdata = {
        'Nom du projecteur': vp.name,
        'Adresse IP': vp.ip,
        'Marque': '',
        'Modèle': '',
        'Référence': '',
        'Lampe': '',
        'Commentaire': ''
    }

    let videoprojecteur = new pjlink(vp.ip, vpport)



    videoprojecteur.powerOff(function (err) {
        if (err) {
            //console.log('error turning on', err);
            console.log('Pas de connexion pour ', vp.ip)
            vpdata['Commentaire'] = 'Pas de connexion'
            return;
        }else{
            getDataVp(videoprojecteur,vpdata)
        }
       
        console.log(vptableau)
        return vptableau.push(vpdata)
    })


})


function getDataVp(videoprojecteur,vpdata){
    videoprojecteur.getModel(function (err, model) {
        return vpdata['Modèle'] = model
    });

    videoprojecteur.getInfo(function (err, info) {
        return vpdata['Référence'] = info
    });

    videoprojecteur.getLamps(function (err, lamps) {
        return vpdata['Lampe'] = lamps
        //vpdata['Lampe'] = lamps[0]['hours']
    });

    videoprojecteur.getManufacturer(function (err, manufacturer) {
        return vpdata['Marque'] = manufacturer
    });
    
    return
}










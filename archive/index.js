const pjlink = require('pjlink');
const vpjson = require('./vplist.json')
const ObjectsToCsv = require('objects-to-csv');


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
        'Commentaire':''
    }

    let videoprojecteur = new pjlink(vp.ip, vpport)


    videoprojecteur.getManufacturer(function (err, manufacturer) {
        if (err) {
            console.log('Pas de connexion pour ' + vp.ip)
            vpdata['Commentaire'] = 'Pas de connexion'
            vptableau.push(vpdata)
            console.log(vptableau)
            return
        }

        vpdata['Marque'] = manufacturer
        

        videoprojecteur.getModel(function (err, model) {
            vpdata['Modèle'] = model

            videoprojecteur.getInfo(function (err, info) {
                vpdata['Référence'] = info

                videoprojecteur.getLamps(function (err, lamps) {
                    vpdata['Lampe'] = lamps[0]['hours']
    
                    vptableau.push(vpdata)
                    console.log(vptableau)
                    
                });
            });
        });
    });

    console.log(index,vpjson.length)

    if ((index + 1) == vpjson.length){
        getCSV(vptableau)
    }

})



async function getCSV(vptableau){
    const csv = new ObjectsToCsv(vptableau);
    await csv.toDisk('./test.csv');
    console.log(await csv.toString());
};








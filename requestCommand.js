const displayError = false

function getPowerState(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getPowerState((err,state)=>{
            resolve(state)
            if(err && displayError){
                reject(console.log(err))
            }
        })
    })
}

function getModel(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getModel((err,model)=>{
            resolve(model)
            if(err && displayError){
                reject(console.log(err))
            }
        })
    })
}

function getInfo(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getInfo((err,info)=>{
            resolve(info)
            if(err && displayError){
                reject(console.log(err))
            }
        })
    })
}

function getManufacturer(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getManufacturer((err,manufacturer)=>{
            resolve(manufacturer)
            if(err && displayError){
                reject(console.log(err))
            }
        })
    })
}

function getLamps(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getLamps((err,lamps)=>{
            resolve(lamps)
            if(err && displayError){
                reject(console.log(err))
            }
        })
    })
}

module.exports = {
    getPowerState,
    getModel,
    getInfo,
    getManufacturer,
    getLamps
}
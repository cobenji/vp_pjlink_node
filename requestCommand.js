function getPowerStateWithTimeout(videoprojecteur,ms) {
    return Promise.race([
        getPowerState(videoprojecteur),
        timeout(ms)
    ]);
}

function getPowerState(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getPowerState((err,state)=>{
            resolve(state)
            if(err){
                reject(new Error(err))
            }
        })
    })
}

function timeout(ms) {
    return new Promise((_, reject) =>
      setTimeout(() => reject(-1), ms)
    );
}

function getModel(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getModel((err,model)=>{
            resolve(model)
            if(err){
                reject(console.log(err))
            }
        })
    })
}

function getInfo(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getInfo((err,info)=>{
            resolve(info)
            if(err){
                reject(console.log(err))
            }
        })
    })
}

function getManufacturer(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getManufacturer((err,manufacturer)=>{
            resolve(manufacturer)
            if(err){
                reject(console.log(err))
            }
        })
    })
}

function getLamps(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getLamps((err,lamps)=>{
            resolve(lamps)
            if(err){
                reject(console.log(err))
            }
        })
    })
}

function getErrors(videoprojecteur){
    return new Promise((resolve, reject) => {
        videoprojecteur.getErrors((err,errors)=>{
            resolve(errors)
            if(err){
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
    getLamps,
    getErrors,
    getPowerStateWithTimeout
}
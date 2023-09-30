

const mongoClient = require("mongodb").MongoClient;
var state = {

    db: null
}

module.exports.connect = function (done) {

  
    const url = "mongodb://127.0.0.1:27017";
    const dbname = 'shopping';

    var client = new mongoClient(url);
    client.connect().then((client) => {
        state.db = client.db(dbname);

       
          done();

 



    })
}


module.exports.get = function () {
    return state.db;
}
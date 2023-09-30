
var db = require("../config/connection");
var collection = require("../config/collections");
var objecM = require("mongodb").ObjectId;
module.exports = {


    addProduct: (product, callback) => {


        const DB = db.get();
        DB.collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data) => {
          
            callback((data.insertedId).toString());

        }

        );

    },

    getAllProducts: () => {

        return new Promise(async (resolve, reject) => {

            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray();
            resolve(products);


        })
    },
    deleteProduct:(id)=>{

        return new Promise((resolve,reject)=>{
            var objectId = objecM.createFromHexString(id);
            console.log(objectId);
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId}).then((data)=>{
                
                console.log(data);
                resolve("deleted");
            })
        })
    },
    getProducts:(id)=>{

        return new Promise((resolve,reject)=>{

            var objectId = objecM.createFromHexString(id);
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId}).then((data)=>{

                console.log("got");
                resolve(data);
            })

        })
    },
    updateProduct:(id,details)=>{

        return new Promise((resolve,reject)=>{
            var objectId = objecM.createFromHexString(id);
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId},{$set:{name:details.name,category:details.category,description:details.description}}).then((data)=>{
                resolve(data);
            })

        })
    }

}
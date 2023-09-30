var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { response } = require("express");
const { ReturnDocument } = require("mongodb");
var objecM = require("mongodb").ObjectId;
const Razorpay = require("razorpay");
var instance = new Razorpay({
    key_id: 'rzp_test_XouelohZrCiuGK',
    key_secret: 'wT0SnNiea7Wngy4s9oswDefO',
  });

module.exports={

    dosignup:(userData)=>{


        return new Promise(async(resolve,reject)=>{

            userData.Password =await bcrypt.hash(userData.Password,10);
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                return resolve(data);
            });
            
    
        })
       
    },
    doLogin:(userData)=>{

        return new Promise (async(resolve,reject)=>{
            
            let loginsts = false;
            let response = {};
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email});

            if(user){

                bcrypt.compare(userData.Password,user.Password).then((result)=>{
                    if(result){
                        console.log("Login successful");
                        response.user = user;
                        loginsts = true; 
                        resolve({result:true,user});   
                    }
                    else{
                        console.log("Login failed");
                        resolve({result:false});
                    }
                })

            }
            else{
                console.log("Login failed");
                resolve({result:false});
            }


        })

    },

    addToCart:(proId,userId,operation)=>{

        return new Promise(async (resolve,reject)=>{


            var userID = objecM.createFromHexString(userId);
            var proID = objecM.createFromHexString(proId);
            let proObj = {

                item:proID,
                quantity:0
            }
           
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:userID});
            if(userCart){

                console.log("hello cart updation");
               let proIndex = userCart.products.findIndex(product=>product.item==proId);
      
               if(proIndex!=-1){
                

                db.get().collection(collection.CART_COLLECTION).updateOne({"products.item":proID},{$inc:{'products.$.quantity':operation}}).then((data)=>resolve(data))


               }
               else{

                db.get().collection(collection.CART_COLLECTION).updateOne({user:userID},{

                    $push:{products:proObj  }
                }).then((response)=>{
                    resolve(response);
                })

               }
               
            }
            else{

                console.log("hello cart creation")
                let cartobj = {
                    user:userID,
                    products :[proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartobj).then((response)=>{
                    resolve();
                })
            }
        })
    },

    getCartProducts:(userId)=>{

        return new Promise (async(resolve,reject)=>{
        

        var userID = objecM.createFromHexString(userId);
      
        let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([{

            $match:{user:userID}
        },
        {
            $unwind:'$products'
        },
        {
            $project:{
                item:'$products.item',
                quantity:'$products.quantity'
            }
        },
        {
            $lookup:{
                from:collection.PRODUCT_COLLECTION,
                localField:'item',
                foreignField:"_id",
                as:"products"
            }
        }
        // {
        //     $lookup:{
        //         from:collection.PRODUCT_COLLECTION,
        //         let:{productlist:"$products"},
        //         pipeline:[{

        //             $match:{

        //                 $expr:{
        //                     $in:["$_id","$$productlist"]
        //                 }
        //             }

        //         }],
        //         as:"cartItems"

                   
                
        //     }
        // }
    
        ]).toArray();
       
        resolve(cartItems);
        })
    },

    getCartCount:(userId)=>{

        var userID = objecM.createFromHexString(userId);
        return new Promise(async(resolve,reject)=>{

            let count = 0;
            let cart =await db.get().collection(collection.CART_COLLECTION).findOne({user:userID})
            if(cart){
                count = cart.products.length;
            }

            resolve(count);
        })
    },
    deleteCartItem:(proId,userId)=>{

        return new Promise (async (resolve,reject)=>{

            var userID = objecM.createFromHexString(userId);
            var proID = objecM.createFromHexString(proId);
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user:userID});
            let proIndex = userCart.products.findIndex(product=>product.item==proId);
      
            if(proIndex!=-1){
             

             db.get().collection(collection.CART_COLLECTION).updateOne({user:userID},{$pull:{products:{item:proID}}}).then((data)=>resolve(data))


            }

        })
    },

    getTotal:function (userId){


        return new Promise (async(resolve,reject)=>{
        

            var userID = objecM.createFromHexString(userId);
          
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([{
    
                $match:{user:userID}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:"_id",
                    as:"products"
                }
            },
            {

                $project:{
                    item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                }

            },
            {
                $group:{
                    _id:null,
                    total:{$sum:{$multiply:['$quantity','$products.price']}}
                }

            }
        
            ]).toArray();
           

            resolve(cartItems[0].total);
            })

    },
    getCartProductList:function(userId){

        return new Promise (async(resolve , reject)=>{

            var userID = objecM.createFromHexString(userId);
            let cart  = await db.get().collection(collection.CART_COLLECTION).findOne({user:userID});
            resolve(cart.products);
            
        })
    },
    placeOrder:function (order,product,total){

        return new Promise ((resolve ,reject)=>{
            var userID = objecM.createFromHexString(order.userId);
            let status = order.paymethode === 'COD'?'PLACED ':'PENDING';
            let orderObject = {

                delivery:{
                    mobile:order.mobile,
                    address:order.address,
                    pin:order.pin
                },
                userId:objecM.createFromHexString(order.userId),
                paymentMethode:order.paymethode,
                products:product,
                totalamount:total,
                date:new Date(),
                status:status

            }

            db.get().collection(collection.ORDER_COLLECTON).insertOne(orderObject).then((data)=>{
                db.get().collection(collection.CART_COLLECTION).deleteOne({user:userID});
                resolve((data.insertedId).toString());
            })
            console.log(order,product,total);   
        })
    },
    getOrders:function(userId){

        return new Promise (async(resolve,reject)=>{

            var userID = objecM.createFromHexString(userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTON).find({userId:userID}).toArray();
            // console.log(orders);
            resolve(orders);
        })
    },
    getOrderedProducts:function (id){


        return new Promise (async(resolve,reject)=>{
        

            var ID = objecM.createFromHexString(id);
          
            let orderItems = await db.get().collection(collection.ORDER_COLLECTON).aggregate([{
    
                $match:{_id:ID}
            },
            {
                $unwind:'$products'
            },
            {
                $project:{
                    item:'$products.item',
                    quantity:'$products.quantity'
                }
            },
            {
                $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:"_id",
                    as:"products"
                }
            }
           
        
            ]).toArray();
           
            resolve(orderItems);
            })


    },
    generateRazorPay:function (orderId,total){


        return new Promise ((resolve, reject)=>{


            var options = {
                amount: total,  // amount in the smallest currency unit
                currency: "INR",
                receipt: ''+orderId
              };
              instance.orders.create(options, function(err, order) {
                console.log("online order")
                if(err){
                    console.log(err)
                }
                else{
                    console.log(order);
                    resolve(order);
                }
               
              });


        })
        
    },
    verifyPayment:function (details){

        return new Promise((resolve,reject)=>{

            const crypto = require("crypto");
            var hmac = crypto.createHmac("sha256",'wT0SnNiea7Wngy4s9oswDefO');
            hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
            hmac=hmac.digest('hex');
            console.log(hmac);
            if(hmac==details['payment[razorpay_signature]']){
                console.log("sha 256 payment success")
                resolve("payment success")
            }
            else{
                reject();
            }
        })
    },
    changeOrderStatus:function(orderId){

        return new Promise ((resolve,reject)=>{

            var orderID = objecM.createFromHexString(orderId);
            db.get().collection(collection.ORDER_COLLECTON).updateOne({_id:orderID},{$set:{status:'placed'}}).then(()=>{

                resolve();
            })
        })
    }

}
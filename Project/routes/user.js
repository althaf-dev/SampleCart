var express = require('express');
var router = express.Router();
const productHelper = require("../helpers/product-helpers");
const userHelper =require("../helpers/user-helpers");


const verifyLogin = (req,res,next)=>{

  if(req.session.loggedIn){
    next();
  }
  else{
    res.redirect("/login");
  }
}
/* GET home page. */
router.get('/', async function(req, res, next) {


  let user = req.session.user;

  let cartCount = null;
  if(user){

    cartCount = await userHelper.getCartCount(user._id);
  }
 
  // console.log(user);

  productHelper.getAllProducts().then((products)=>{
    
   
    res.render('user/view-product', { admin: false, products ,user,cartCount});
  });
 
});

router.get('/login',(req,res,next)=>{

  if(req.session.loggedIn){
    res.redirect("/");
  }
  else{
    res.render("user/login",{"loginError":req.session.loginError});
    req.session.loginError = false;
  }
  
})



router.get('/signup',(req,res,next)=>{

  res.render("user/signup");
})

router.post('/signup',(req,res)=>{

  console.log("signup");
  userHelper.dosignup(req.body).then((result)=>{
    
    // console.log(result);
    req.session.loggedIn = true;
    req.session.user = response.user;
    res.redirect("/");

})
  res.render("user/signup");
})


router.post('/login',(req,res)=>{

  console.log("login");
  userHelper.doLogin(req.body).then((response)=>{

    if(response.result){
      req.session.loggedIn = true;
      req.session.user = response.user;
      res.redirect("/");
      console.log("home")
     }
    else{
      req.session.loginError =true;
       res.redirect("/login");

       
       console.log("not home")
    }
  })
  
  
})

router.get("/logout",(req,res)=>{

  req.session.destroy();
  res.redirect("/");
})


router.get("/cart",verifyLogin,async (req,res)=>{



  let total = await userHelper.getTotal(req.session.user._id)
  console.log(total);
  let product = await userHelper.getCartProducts(req.session.user._id);
  // console.log(product);
  res.render("cart/cart",{product,user:req.session.user,total})


})

router.get("/add-to-cart/:id" ,(req,res)=>{

  console.log(req.session.user._id);

  // console.log(req.session.user._id);
  // res.json({status:true});
  
  userHelper.addToCart(req.params.id,req.session.user._id).then(()=>{

    res.json({status:true});
    
  })
}) 


router.post("/add-to-cart/:id" ,async(req,res)=>{

  

  let operation = Number(req.body.operation);
  let user = req.session.user;
  
 
  userHelper.addToCart(req.params.id,req.session.user._id,operation).then(async(response)=>{

    console.log(response);
    let total = await userHelper.getTotal(req.session.user._id)
    res.json({status:true,Total:total});
    
  })
  
}) 

router.post("/delete-cart-item/:id",(req,res)=>{

  console.log("delete api is called");
  let user = req.session.user;
  userHelper.deleteCartItem(req.params.id ,user._id).then(()=>{
    res.json({status:true});
  })

})

router.get("/placeorder",verifyLogin,async (req,res)=>{


 let total = await userHelper.getTotal(req.session.user._id).then((data)=>{

 
  res.render("cart/placeorder.hbs",{data,user:req.session.user})
 })
 
})

router.post("/checkout" ,async(req,res)=>{

  console.log("api called");

  // console.log(req.body);
  let product = await userHelper.getCartProductList(req.session.user._id);
  let total = await userHelper.getTotal(req.session.user._id);
  userHelper.placeOrder(req.body,product,total).then((orderId)=>{

    if(req.body.paymethode=='COD'){
      res.json({codsucess:true});
    }
    else{

      userHelper.generateRazorPay(orderId,total).then((response)=>{
        res.json(response);
      })
    }
    
  })

})
router.get("/message",(req,res)=>{

  console.log("message");
  res.render("cart/order-success");
})

router.get("/orders", verifyLogin,async(req,res)=>{


  let orders = await userHelper.getOrders(req.session.user._id);

  console.log(orders);
  res.render("cart/orders",{orders});
})
router.get("/orderProducts/:id",async(req,res)=>{

  console.log("orderedProducts");
  let product = await userHelper.getOrderedProducts(req.params.id);
  console.log(product);
  res.render("cart/ordered-product",{product});

})

router.post("/verify-pay",(req,res)=>{

  console.log("payment recieved")
  console.log(req.body);
  userHelper.verifyPayment(req.body).then(()=>{
    userHelper.changeOrderStatus(req.body['order[receipt]']).then(()=>{
      res.json({status:true});
    })
  }).catch((err)=>{

    res.json({status:false,err:" "})
  })
})
module.exports = router;

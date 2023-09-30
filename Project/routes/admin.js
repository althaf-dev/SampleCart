var express = require('express');
var router = express.Router();
var productHelper = require("../helpers/product-helpers");




/* GET users listing. */
router.get('/', function (req, res, next) {

  productHelper.getAllProducts().then((products)=>{
    
  
    
    res.render('admin/view-product', { admin: true, products });
  });
 
   

});

router.get('/add-products', function (req, res, next) {
  res.render('admin/add-product');
  
})


router.post('/add-products', function (req, res, next) {


  let product =req.body;
  product.price = Number(product.price);
  productHelper.addProduct(product, (id) => {
    
    let img = req.files.image;
    img.mv("./public/product-images/"+id+".jpg",(err)=>{

      if(!err){
        productHelper.getAllProducts().then((products)=>{
    
          console.log(products)
          
          res.render('admin/view-product', { admin: true, products });
        });
      }
    });

    
  });

})

router.get("/delete-product/:id",(req,res)=>{

    console.log("delete")
    let proId = req.params.id;
    console.log(proId);
    productHelper.deleteProduct(proId).then(()=>{
      res.redirect("/admin")
    })

})

router.get("/edit-product/:id", async(req,res)=>{

  
  let product = await productHelper.getProducts(req.params.id);
  console.log(product);
  res.render("admin/edit-product",{product})
})

router.post("/edit-products/:id",(req,res)=>{

  let id = req.params.id;
  console.log("editmode")
  productHelper.updateProduct(req.params.id,req.body).then(()=>{
    res.redirect("/admin");
    if (req.files.image){
      let img = req.files.image;
      img.mv("./public/product-images/"+id+".jpg");
    }

  })
})
module.exports = router;

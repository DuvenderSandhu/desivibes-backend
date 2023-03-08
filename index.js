const express= require('express')
const jwt = require("jsonwebtoken");
const bp = require("body-parser");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
let cors = require('cors')
const mongoose = require("mongoose");
const db = require("./db");
// const fetchUser='./Middleware/loginUser'
const fetchUser = function (req, res, next) {
  if (req.body.token) {
    try {
      let result = jwt.verify(req.body.token, JWT_SECRET);
      req.user = result.user;
    } catch (error) {
      res.status(401).json({ error: "Unauthorized Login" });
    }
  }
  next();
};

const app= express()
const MONGO_URI="mongodb://localhost:27017/DesiVibes"
const JWT_SECRET="DSandhu@DesiVibes"
async function  connectToMongo (){
try{
    let result=await mongoose.connect(MONGO_URI);
    return "Connected"
}    
catch{
    return "Error"
}

}
app.use(cors())
app.use(bp.json());

const userSchema = new mongoose.Schema({
  email: String,
  full_name:String,
  mobile:String,
  password: String,
});

const cartSchema = new mongoose.Schema({
        name:String,
        type:String,
        color:String,
        size:String,
        user:Object
});

const productSchema = new mongoose.Schema({
        image1:String,
        image2:String,
        image3:String,
        image4:String,
        image5:String,
        name:String,
        type:String,
        color:String,
        size:String
});

const User = mongoose.model("user", userSchema);
const Product = mongoose.model("product", productSchema);
const Cart = mongoose.model("cart", cartSchema);

app.get("/", async function(req,res){
    res.send("Hello world")
})

app.post("/signup", async (req, res) => {
    let mongodb=await connectToMongo()
    if(mongodb!='Connected'){
        res.redirect('/')
    }
    else{
        let temp_user = await User.find({
            $or: [{ email: req.body.email.toLowerCase() }, { mobile: req.body.mobile.toLowerCase() }],
          });
          if (temp_user.length === 0) {
            let user = await User.create({
              email: req.body.email.toLowerCase(),
              full_name: req.body.full_name.toLowerCase(),
              mobile: req.body.mobile.toLowerCase(),
              password: await bcrypt.hash(req.body.password, await bcrypt.genSalt(10)),
            });
            res.status(200).send(user);
          } else {
            res.status(200).json({ error: "User Already exists with same details" });
          }
    }
  });
app.get('/login',(req,res)=>{
  res.send("Login required")
})
  app.post("/login", async (req, res) => {
    // Login Is n't WOring Fix THis
    let mongodb=await connectToMongo()
    if(mongodb!="Connected"){
        res.redirect('/')
    }
    else{
        let temp_user = await User.find({ email: req.body.email.toLowerCase() }).select(
            "-password"
          );
          if (temp_user.length === 0) {
            res.status(400).json({ error: "Invalid Crediantials" });
          } else {
            let new_user = await User.findOne({ email: req.body.email.toLowerCase() });
        
            let user = await bcrypt.compare(req.body.password, new_user.password);
            if (user) {
              let payload = {
                user: temp_user,
              };
              let token = await jwt.sign(payload, JWT_SECRET);
              res.json({token:token});
            } else {
              res.status(400).json({ error: "Invalid Crediantials" });
            }
          }
    }
  });

app.get('/forgot/:email',(req,res)=>{
// TODO: 
    res.send("Todo: Forgot Password")
})

app.get('/shop',async(req,res)=>{
  let mongodb=await connectToMongo()
  if(mongodb!="Connected"){
    res.redirect('/');
  }
  else{
    let product= await Product.find()
    res.send(product)
  }
})

app.get('/search/:product',async (req,res)=>{
    // TODO: 
    let mongodb=await connectToMongo()
    if(mongodb!="Connected"){
      res.redirect('/');
    }
    else{
      let query= req.params.product
      let product= await Product.find({ name: query})
      res.send(product)
    }
    
})

app.get('/cart',fetchUser,async(req,res)=>{
  if(req.user && await connectToMongo()){
    console.log("WOrking")
    let cart= await Cart.find({user:req.user})
    console.log("WOrking")
    res.send(cart)
  }
  else{
    res.redirect('/login')
  }
})

app.get('/cart/:product',async (req,res)=>{
})


app.listen(80,()=> console.log('http://localhost'))
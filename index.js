const express= require('express')
const jwt = require("jsonwebtoken");
const bp = require("body-parser");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
let cors = require('cors')
const mongoose = require("mongoose");
const db = require("./db");


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
const User = mongoose.model("user", userSchema);

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

app.get('/shop',(req,res)=>{
    res.send(db)
})

app.get('/search/:product',(req,res)=>{
    // TODO: 
    res.send("Todo: Search Product")
})


app.listen(80,()=> console.log('http://localhost'))
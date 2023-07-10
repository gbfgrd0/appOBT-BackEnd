const express = require("express");
const app = express();
const mongoose = require("mongoose");
app.use(express.json());
const cors = require("cors");
app.use(cors());
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

const JWT_SECRET = "asdas91841231n321"

const mongoUrl =
    "mongodb+srv://filhosdeares:katyusha9090@cluster0.6uuwwm5.mongodb.net/"

mongoose.connect(mongoUrl, {
    useNewUrlParser: true
}).then(() => {
    console.log("Conectado ao MongoDB!")
}).catch((e) => {
    console.log(e)
});

require("./userDetalhes")

const User = mongoose.model("UserInfo");

app.post("/register", async (req, res) => {
    const {name, email, password} = req.body;

    const encryptedPassword = await bcrypt.hash(password, 10)
    try {
        const oldUser = await User.findOne({ email })

        if(oldUser){
            return res.send({error: "User Exists!"})
        }
        await User.create({
            name,
            email,
            password: encryptedPassword
        })
        res.send({status:"Ok"})
    } catch (error) {
        res.send({status:"Error"})
    }
})

app.post("/login", async (req, res)=>{
    const {email, password} = req.body;

    const user = await User.findOne({email})
    if(!user){
        return res.json({error:"Usuário não encontrado!"})
    }
    if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({email: user.email}, JWT_SECRET);

        if(res.status(201)){
            return res.json({status:"Ok", data: token})
        }else{
            return res.json({error: "Error"})
        }
    }
    res.json({status:"error", error: "Senha invalida"})
})

app.post("/userData", async (req, res)=>{
    const { token } = req.body;
    try {
        const user = jwt.verify(token, JWT_SECRET);
        const usermail = user.mail;
        User.findOne({email: usermail}).then((data)=>{
            res.send({status: "Ok", data: data});
        }).catch((err)=>{
            res.send({status: "Error", data: err})
        })

    } catch (error) {
        
    }
})

app.listen(5000, () => {
    console.log("Servidor Iniciado!")
})

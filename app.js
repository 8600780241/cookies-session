const express = require("express");
const session = require("express-session");
const mongoDbSession = require('connect-mongodb-session')(session);

const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const bodyparser = require("body-parser");
const app = express();
const usermodel = require('./userModels/user')
const mongoURL = "mongodb://localhost:27017/sessions"
mongoose.connect(mongoURL, {
    useUnifiedTopology: true,
})
    .then((res) => {
        console.log("MongoDb Connected")
    })
    .catch((error) => {
        console.log(error)
    })

const store = new mongoDbSession({
    uri: mongoURL,
    collection: "sets",
});

app.use(cors());
app.use(express.json());
app.use(bodyparser.json());
app.use(morgan('dev'));
app.use(session({
    secret: "key",
    resave: false,
    saveUninitialized: false,
    store: store,
}))
const isAuth = (req, res, next) => {
    if (req.session.isAuth) {
        next();
    }
    else {
        res.send({
            message: 'invalid'
        })
    }
}
// app.get('/', (req, res) => {
//     req.session.isAuth = true;
//     res.send("hii");
//     // console.log(req.session.id);

// });

app.post('/register', async (req, res) => {
    const { username, email, simplepassword } = req.body;
    const existingUser = await usermodel.findOne({ email });
    if (existingUser) {
        res.status(404).send({
            message: "user exist"
        })
    }
    const salt = await bcrypt.genSalt();

    const hashpassword = await bcrypt.hash(simplepassword, salt);

    const user = new usermodel({ username, email, hashpassword });
    await user.save()
    console.log(user)
    return res.status(200).send({
        message: "register successfully",
        user
    })
})
app.post('/login', async (req, res) => {
    const { email, simplepassword } = req.body;
    const user = await usermodel.findOne({ email })
    if (!user) {
        return res.status(404).send({
            message: "email does not exist"
        })
    }
    const isMatched = await bcrypt.compare(simplepassword, user.hashpassword);
    if (!isMatched) {
        return res.status(400).send({
            message: "invalid password"
        })
    }
    // return res.status(200).send({
    //     message:"login successfull"
    // })
    req.session.isAuth = true;
    res.redirect('/profile');
})
app.get('/profile', isAuth, (req, res) => {
    return res.status(200).send({
        message: "profile page"
    })
})
app.listen(5000, () => {
    console.log("server is running on port 5000")
})
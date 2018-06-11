const express = require('express')
server = express()
User = require('./models/user')
mongoose = require('mongoose')
bcrypt = require('bcrypt')
session = require('express-session')
helmet = require('helmet')
cors = require('cors')

server.use(helmet())
server.use(cors())
server.use(express.json())

// global middleware initialising a session w/ secret key, adds session to the req object
server.use(session({
    resave: false,
    saveUninitialized: false,
    secret: `I sexually Identify as an Attack Helicopter. Ever since I was a boy I dreamed of soaring over the oilfields dropping hot sticky loads on foreigners. People say to me that a person being a helicopter is Impossible and I'm fucking retarded but I don't care, I'm beautiful.I'm having a plastic surgeon install rotary blades, 30 mm cannons and AMG-114 Hellfire missiles on my body. From now on I want you guys to call me "Apache" and respect my right to kill from above and kill needlessly. If you can't accept me you're a heliphobe and need to check your vehicle privilege. Thank you for being so understanding.`
}))

// global middleware that restricts access to restricted and following to non-logged in users
server.use('/api/restricted', (req, res, next) => {
    req.session.loggedIn ? next() : res.status(403).json({ error: "Please login to view this site" })
})

server.use('/api/users', (req, res, next) => {
    req.session.loggedIn ? next() : res.status(403).json({ error: "Please login to view this site" })
})

server.get('/', (req, res) => {
    // console.log(req)
    res.status(200).json({ api: "running", req: req.session })
})

server.post('/api/register', (req, res) => {
    User.create(req.body)
        .then(result => res.status(201).json(result))
        .catch(err => res.status(500).json({ error: err.message }))
    // save the user to the db
})

server.post('/api/login', async function (req, res) {
    let { username, password } = req.body
    User.findOne({ username })
        .then(result => {
            if (!result) {
                return res.status(401).send('You shall not pass!')
            } else if (!bcrypt.compareSync(password, result.password)) {
                // console.log("user pw", result[0].password, "login", hash)
                return res.status(401).send('You shall not pass!')
            } else {
                //sets properties in the session for this user
                req.session.loggedIn = true;
                req.session.uid = result._id
                return res.status(200).send('Succesfully logged in!')
            }
        })
})
server.get('/api/users', (req, res) => {
    // if user is logged in, he will be able to request all users
    User.find({}, { username: 1, _id: 0, password: 1 })
        .then(result => res.status(200).json({ result }))
        .catch(err => res.status(500).json({ error }))
})

mongoose.connect('mongodb://localhost/cs10')
server.listen(8000, () => {
    console.log('\n *** API running on port 8000 ***\n')
})
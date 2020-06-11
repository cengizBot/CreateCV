
// env variable
require('dotenv').config()

//express
var express = require('express');
const app = express(),
    server = app.listen(process.env.PORT || 8000);
var fs = require('fs');
var path = require('path');



const password = 'testpassword';
const username = "testusername";


//security HTTP header
var helmet = require('helmet');
app.use(helmet());
app.disable('Cache-Control');

app.use(express.static(__dirname + '/node_modules'));  
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.static(path.join(__dirname, '/img')));
app.use(express.static(path.join(__dirname, '/client')));
app.use(express.static(__dirname));  

// manager gère la création du cv
let manager = require('./public/js/manager.js');
manager = manager.manager;

// pdfManager gère la crypt decrypt pdf
let pdfManager = require('./public/js/manager.js');

var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');


//token
var jwt = require('jsonwebtoken');


//session
var session = require('express-session');
var sess;

const socket = require('socket.io');
var io = socket(server);

// // pptx const ///
// const PPTX = require('nodejs-pptx');
// let pptx = new PPTX.Composer();

var bodyParser = require('body-parser')

//body parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


//id folder of client
var crypto = require('crypto');
var base64url = require('base64url');

function randomStringAsBase64Url(size = 40 ) {
    return base64url(crypto.randomBytes(size));
}


// pdf password and encrypt
let folderEncrypt = require('folder-encrypt');

app.set('trust proxy', 1) // trust first proxy

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); 
app.use(session({
  secret: process.env.APP_SESSION,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true,
            // httpOnly: true,
            // domain: 'http://localhost:8000',
            // path: 'foo/bar',
            // expires: expiryDate 
          }
}))

var cookieParser = require('cookie-parser');
app.use(cookieParser());

// let create id folder for user when connect
let id_folder = randomStringAsBase64Url();


//pdf crypt decrypt
const passwordPDF = pdfManager.passwordPDF;

app.get('/', async (req,res) => {

    sess=req.session;

    // check id folder client if exist or not
    // if client_id n'est pas défini on l'ajout id_folder dans la session
    if(!req.session.client_id){
        req.session.client_id = id_folder;
        sess.client_id = id_folder;
        //folder id client
        res.cookie('FDCL', req.session.client_id);

        //password username crypt pdf
        sess.passwordPDF = passwordPDF;

    }else{
        id_folder = req.session.client_id;
        sess.client_id = id_folder;
        res.cookie('FDCL', id_folder);
    }

 
    var older_token = jwt.sign({ client_id : id_folder, exp: Math.floor(Date.now() / 1000) + (60 * 60) }, 'shhhhh');
    res.cookie('token',older_token);


    if(fs.existsSync(`./client/${req.session.client_id}`)){

    }else{
        fs.mkdir(`./client/${req.session.client_id}`, function(err) {
            if (err) {
              console.log(err);
            } else {
              console.log("New directory successfully created.");
            }
        });
    }

 
    // check si le folder du client_id exist ou non dans le folder client
   
    // console.log(req.session.client_id);

    return res.sendFile(__dirname + '/interface.html');

});


app.post('/dowloadCV', async (req,res) => {
 
    console.log(sess);

    let check = req.headers.authorization;
    // get bearer string
    let string = check.split(' ')[0].toLowerCase();
    var bearer = string.includes("bearer");

    if(!bearer){
        return res.json(['erreur']);
    }

    let token = check.split(' ')[1];

    let decoded = jwt.verify(token, 'shhhhh');

    if(!decoded){
        return res.json(['erreur']);
    }

    let client_id = decoded.client_id;

    // check if client_id of user is equal to session client id
    if(sess.client_id != client_id ){
        return res.json(['erreur']);
    }

    //url client_id
    let url = __dirname + `/client/${client_id}/`;

    //new folder name random for decrypt
    let randomFolder = randomStringAsBase64Url();

    folderEncrypt.decrypt({
            password: pdfManager.passwordPDF,
            input: url + pdfManager.encryptfolder,
            output: url + randomFolder // optional, default will be input path without extension
        }).then(() => {
            console.log('decrypted!');
            // when using a wrong password on file decryption, the file will be decrypted to a bunch of garbled text. 
            // But still considered `decrypted` due to there is no way knowing the original content.
        }).catch((err) => {
            console.log(err); 
            // when using a wrong password on directory decryption, a `tar is corrupted` error will occured.
    });


    return res.json([{ "client_id" : sess.client_id , "decryptfolder" : randomFolder }  ]);
    
});


app.get('*', async (req,res) => {

    res.redirect('/');

});


io.sockets.on('connection', function (socket) {

    console.log('connecter');       

    socket.on('creation',function(data){

    });

    socket.on('create_docx',function(data){

            let form_about = data.form_about[0];
            manager.CreateCV(form_about,id_folder);
    
    });

    

});



// ^ y
// |
// | 
// |
// |_ _ _ _ _  _ _> x

async function CV() {

    await pptx.load(`./cv.pptx`);

    await pptx.compose(async pres => {
          
        
        // nom prenom
        await pres.getSlide('slide1').addText( text => {
                    // declarative way of adding an object

                    text
                    .value('KURT Cengiz')
                    .x(230)
                    .y(35)
                    .fontFace('Avenir Book')
                    .fontSize(30)
                    .textColor('1A1A1A')
                    .textWrap('none')
                    .textAlign('left')
                    .textVerticalAlign('center')
                    // .line({ color: '0000FF', dashType: 'dash', width: 1.0 })
                    .margin(0);                
        });

        /////////  adress and icon addres //////////////////
        ///// /////////////////////////////////
        await pres.getSlide('slide1').addImage( image => {
            // declarative way of adding an object    
            image
            .file('./img/house.png')
            .x(335)
            .y(110)
            .cx(10);          
        });
        await pres.getSlide('slide1').addText( text => {
            // declarative way of adding an object    
                text
                .value('17 rue de la Reussite 75012 Paris')
                .x(350)
                .y(100)
                .fontFace('Avenir Book')
                .fontSize(12)
                .textColor('6F6F6F')
                .textWrap('none')
                .textAlign('left')
                .textVerticalAlign('center')
                // .line({ color: '0000FF', dashType: 'dash', width: 1.0 })
                .margin(0);             
        });
        /////////  FINISH adress and icon addres //////////////////
        ///////////////////////////////////////

        /////////  PHONE and icon phone //////////////////
        ///// /////////////////////////////////
        // await pres.getSlide('slide1').addImage( image => {
        //     // declarative way of adding an object    
        //     image
        //     .file('./img/phone.png')
        //     .x(400)
        //     .y(105)
        //     .cx(10);          
        // });
        await pres.getSlide('slide1').addText( text => {
            // declarative way of adding an object    
                text
                .value('06 48 79 16 26')
                .x(350)
                .y(120)
                .fontFace('Avenir Book')
                .fontSize(12)
                .textColor('6F6F6F')
                .textWrap('none')
                .textAlign('left')
                .textVerticalAlign('center')
                // .line({ color: '0000FF', dashType: 'dash', width: 1.0 })
                .margin(0);             
        });
        /////////  FINISH adress and icon addres //////////////////
        ///////////////////////////////////////
    });  

    await pptx.save(`./test.pptx`);

}


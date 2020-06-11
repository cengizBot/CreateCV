// docxtemplater for docx ///
var PizZip = require('pizzip');
var Docxtemplater = require('docxtemplater');
var fs = require('fs');
var path = require('path');
let test = require('../../app.js');

let manager = {};

// move file
const moveFile = require('move-file');

// api convert
var convertapi = require('convertapi')('8InwzdplpYWwiGRn'); 

//extra fs (delete folder)
const fs_extra = require('fs-extra')

// random string for pdf (username and mdp ) fot crypting
var crypto = require('crypto');
var base64url = require('base64url');
function randomStringAsBase64Url(size = 40 ) {
    return base64url(crypto.randomBytes(size));
}

// pdf password and encrypt
let folderEncrypt = require('folder-encrypt');
let passwordPDF = randomStringAsBase64Url();
let encryptfolder = randomStringAsBase64Url();


// The error object contains additional information when logged with JSON.stringify (it contains a properties object containing all suberrors).
manager.replaceErrors = (key, value) => {
    if (value instanceof Error) {
        return Object.getOwnPropertyNames(value).reduce(function(error, key) {
            error[key] = value[key];
            return error;
        }, {});
    }
    return value;
}

manager.errorHandler = (error) => {
    console.log(JSON.stringify({error: error}, replaceErrors));

    if (error.properties && error.properties.errors instanceof Array) {
        const errorMessages = error.properties.errors.map(function (error) {
            return error.properties.explanation;
        }).join("\n");
        console.log('errorMessages', errorMessages);
        // errorMessages is a humanly readable message looking like this :
        // 'The tag beginning with "foobar" is unopened'
    }
    throw error;
}

manager.CreateCV = (form_about, id_folder) => {

        console.log('creattion');
        //Load the docx file as a binary
        var content = fs
            .readFileSync(path.resolve(__dirname + "/../../", 'cv.docx'), 'binary');

        var zip = new PizZip(content);
        var doc;

        try {
            doc = new Docxtemplater(zip);
        } catch(error) {
            // Catch compilation errors (errors caused by the compilation of the template : misplaced tags)
            errorHandler(error);
        }

        console.log(form_about);
        //set the templateVariables
        doc.setData({
            first_name: form_about.firstname,
            last_name: form_about.name,
            post: form_about.post,
            profil: form_about.profil,
            phone: form_about.tel,
            email: form_about.email,
            addr : form_about.addr,
            exp: [
                { 
                    "entreprise" : "evian",
                    "poste" : "informaticien",
                    "date_start" : "Septembre 2010",
                    "date_end" : "Octobre 2015",
                    "descript" : "Tâches réalisées, Duis augue magna, bibendum at nunc id, gravida ultrices tellus. Pellentesqu, ehicula ante id, dictum arcu hicula ante gravida ultrices. Lorem ipsum dolor sit amet. varius mauris. Duis augue magna, bibendum at nunc id, gravida ultrices tellus ante gravida ultrices."
                },
                { 
                    "entreprise" : "evian",
                    "poste" : "informaticien",
                    "date_start" : "Septembre 2010",
                    "date_end" : "Octobre 2015",
                    "descript" : "Tâches réalisées, Duis augue magna, bibendum at nunc id, gravida ultrices tellus. Pellentesqu, ehicula ante id, dictum arcu hicula ante gravida ultrices. Lorem ipsum dolor sit amet. varius mauris. Duis augue magna, bibendum at nunc id, gravida ultrices tellus ante gravida ultrices."
                },
                { 
                    "entreprise" : "evian",
                    "poste" : "informaticien",
                    "date_start" : "Septembre 2010",
                    "date_end" : "Octobre 2015",
                    "descript" : "Tâches réalisées, Duis augue magna, bibendum at nunc id, gravida ultrices tellus. Pellentesqu, ehicula ante id, dictum arcu hicula ante gravida ultrices. Lorem ipsum dolor sit amet. varius mauris. Duis augue magna, bibendum at nunc id, gravida ultrices tellus ante gravida ultrices."
                }
            ]
            
        });

        try {
            // render the document (replace all occurences of {first_name} by John, {last_name} by Doe, ...)
            doc.render()
        }
        catch (error) {
            // Catch rendering errors (errors relating to the rendering of the template : angularParser throws an error)
            errorHandler(error);
        }

        var buf = doc.getZip()
                    .generate({type: 'nodebuffer'});

        // buf is a nodejs buffer, you can either write it to a file or do anything else with it.

        //url client_id
        let url = __dirname + `/../../client/${id_folder}/`;
        // url docx file
        let urldocx = __dirname + `/../../client/${id_folder}/cv_fast.docx`;

        
        // creation de nos fichier
        //on inclu dans le fichier le document docx
        fs.writeFileSync(path.resolve(__dirname + `/../../client/${id_folder}`, 'cv_fast.docx'), buf);
        // on créée un dossier encryptMe qui va contenir à l'intérieur le pdf du docx convertie
        fs.existsSync(path)
        fs.mkdirSync(__dirname + `/../../client/${id_folder}/encryptMe`);
        
        //url encryptMe
        let urlEncrypt = __dirname + `/../../client/${id_folder}/encryptMe/`;


        convertapi.convert('pdf', { File: urldocx })
                .then(function(result) {
                // get converted file url
                console.log("Converted file url: " + result.file.url);
            
                // save to file
                return result.file.save(url + "example.pdf");
                })
                .then(function(file) {
                    // delete docx for security
                    fs.unlink(urldocx,function(err){
                        if(err) return console.log(err);
                        console.log('file deleted successfully');
                    });  

                    // une fois la conversion fini on récupère le pdf et l'inclu dans le dossier encryptMe
                    (async () => {

                        let urlPdf = url + "example.pdf";
        
                        await moveFile(urlPdf, urlEncrypt + "example.pdf");
                        console.log('dossier deplacé');

                        folderEncrypt.encrypt({
                            password: passwordPDF,
                            input: urlEncrypt,
                            output: url + encryptfolder 
                        }).then(() => {
                            console.log('encrypted!');
                            fs_extra.remove(url + "encryptMe");
                               //decrypt folder

                        }).catch((err) => {
                            console.log(err);
                        });

                
                       
                    })();
                    
                })
                .catch(function(e) {
                         console.error(e.toString());
                });
        //delete cv docx and crypt pdf
         


}


module.exports = {
    manager: manager,
    passwordPDF : passwordPDF,
    encryptfolder : encryptfolder

};
$(function(){
    
                var socket = io.connect('http://localhost:3000');
    
                let docxs = $('#create_docx');

                let key = getCookie('FDCL');

                //form about client (name, firstname,email,...)

                $(docxs).click(function(){
                    
                  

                    let form_about = [
                      { "name" : $('#form_name').val(),
                        "firstname" : $('#form_firstname').val(),
                        "profil" : $('#form_profil').val(),
                        "post" : $('#form_post').val(),
                        "tel" : $('#form_tel').val(),
                        "addr" : $('#form_addr').val(),
                        "email" : $('#form_email').val()
                    }
                    ];

                    let form_formations = [{

                        Formations : []
                    }
                    ];

                    let childForm = $('#form_formations').children();
               
                    for(var i = 0; i < $(childForm).length - 1; i ++){

                        let div = $(childForm[i]).children();
                        let diplome = $(div[1]).val();
                        console.log(diplome)
                        form_formations[0].Formations.push({
                            "diplome" : diplome
                        });

                    }
                    // let input = `#form_diplome${i}`;
                    // console.log(input)



                    console.log(form_formations);
          

                     socket.emit('create_docx',{form_about: form_about});
                     console.log('docx');
    
                })
    
              $('#link_cv_down').attr('href',`${key}/cv_fast.docx`);
              $('#link_cv_down').attr('download',`cv_fast.docx`);

});
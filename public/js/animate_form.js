$(function(){

    let btn_form = $('.open_form');

    $(btn_form).click(function(){

        let parent = $(this).parent();

        let child = $(parent).children('form');
        console.log($(child).css('display'));

        if($(child).css('display') === "none"){
            $(child).css('display','block');
            $(child).animate({
                opacity: "1"
            }, 1000)

            $(this).css('transform','rotate(180deg)');
        }else{
            // $(child).css('display','none');
            $(this).css('transform','rotate(0deg)');
            $(child).animate({
                opacity: "0"
            }, 1000)
            $(child).hide( "slow" );
        }
            

    })

    // add form other with button plus 

    $('#add_formations').click(function(){

        

    })
   
  
});
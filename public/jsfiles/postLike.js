function like(icon){
   let answerId = $(icon).attr('data-value');
   let status = 0;
   if($(icon).hasClass("far")){ //like the post...
     status = 1;
     if($("#" + answerId ).find(".dislike").hasClass("fas")){
         dislike($("#" + answerId ).find(".dislike"));
     }
   }  // else unlike the post...
   $(icon).toggleClass("far fas");
   $.post(
      "/like",
      {
        status: status,
        answerId: answerId
      },
      function(data, status, jqXHR){
        //countLikes(answerId);
        console.log("successfully liked the post.");
      }
   );
}

function dislike(icon){
    let answerId = $(icon).attr('data-value');
    let status = 0;
    if($(icon).hasClass("far")){ //dislike the post...
        status = 1;
        if($("#" + answerId ).find(".like").hasClass("fas")){
            like($("#" + answerId ).find(".like"));
        }
    }  // else remove dislike from the post...
    $(icon).toggleClass("far fas");
    $.post(
        "/dislike",
        {
            status: status,
            answerId: answerId
        },
        function(data, status, jqXHR){
            //console.log(answerId);
            countLikes(answerId);
            console.log("successfully disliked the post.");
        }
    );
}

// function countLikes(answerId){
//     $.post(
//         "/countLikes",
//         {answerId: answerId },
//         function (data, status, jqXHR) {
//             console.log(data);
//             console.log("successfully count the likes.");
//         },
//     )
// }

//"/" homepage or dashboard goes here
const express = require("express");
const router = express.Router();
const Answer = require("../models/Answer");
const Question = require("../models/Question");
const Event = require("../models/Event");
const Contact = require("../models/Contact");
const Announcement = require("../models/Announcement");

const {ensureAuthenticated,forwardAuthenticated}=require("../config/auth");

function setNewLine(statement){
  statement = statement.replace(/\r?\n/g, '\n');
  statement = statement.replace(" ", "");
  return statement;
}

function afterFewSeconds(value) {
  return new Promise(resolve => {
    setTimeout(() => { resolve(value) }, 500);
  });
}

//----- Home Page When user is not registered -----
router.get("/", forwardAuthenticated,(req,res)=>{
    res.render("home",{
      authFlag: false,
      title: "Student Forum",
    });
});

//------------------- Dashboard -------------------
router.get("/dashboard",ensureAuthenticated,(req,res)=>{
    res.render("index",{
        user:req.user,
        title: "Student Forum",
        authFlag: true
    });
});

//---------------- Contact US ----------------------
router.post("/contact",(req,res)=>{
  const contact = new Contact({
    name: req.body.name,
    email: req.body.email,
    subject: req.body.subject,
    message: req.body.message
  });
  contact.save(function(err){
    if(!err){
      console.log("Contact us form successfully submitted.");
    } else{
      console.log(err);
    }
  });
  res.redirect("/");
});

//------------------- Events home route -------------------
router.get("/events",ensureAuthenticated,(req,res)=>{
  Event.find({}, function(err, foundEvents){
    if(!err){
      Announcement.find({}, function(err, foundAnnouncements){
        if(!err){
          var adminFlag=false;
          if(req.user.email === process.env.ADMIN){
            adminFlag=true;
          };
          res.render("events",{
              user: req.user,
              title: "Events",
              events: foundEvents,
              announcements: foundAnnouncements,
              admin: adminFlag,
              authFlag: true
          });
        } else{
          console.log(err);
        }
      });

    } else{
      console.log(err);
    }
  });
});

//-------------------- Add Event get Route ---------------------
router.get("/composeEvent", ensureAuthenticated,(req,res)=>{
  if(req.user.email === process.env.ADMIN){
    res.render("composeEvent", {
      user:req.user,
      title: "Compose Event",
      authFlag: true
    });
  } else{
    req.flash('admin_auth', 'Only Admin can add an event!');
    res.redirect('/events');
  }
});

//-------------------- Add Event post Route ---------------------
router.post("/composeEvent", function(req,res){
  if(req.user.email === process.env.ADMIN){
    let content = setNewLine(req.body.content);
    let link = setNewLine(req.body.link);
    let youtubeLink = setNewLine(req.body.youtubeLink);

    const event = new Event({
      title: req.body.title,
      content: content,
      link: link,
      youtubeLink: youtubeLink
    });
    event.save(function(err){
      if(!err){
        console.log("Event successfully submitted.")
      } else{
        console.log(err);
      }
    });
    res.redirect("/events");

  } else{
    res.send("Only admin can add Events.");
  }
});

//------------------- Add Announcement get route-----------------
router.get("/composeAnnouncement", ensureAuthenticated,(req,res)=>{
  if(req.user.email === process.env.ADMIN){
    res.render("composeAnnouncement", {
      user:req.user,
      title: "New Announcement",
      authFlag: true
    });
  } else{
    req.flash('admin_auth', 'Only Admin can add an event!');
    res.redirect('/events');
  }
});

//------------------- Add Announcement post route-----------------
router.post("/composeAnnouncement", function(req,res){
  if(req.user.email === process.env.ADMIN){
    let content = setNewLine(req.body.content);
    let link = setNewLine(req.body.link);
    let youtubeLink = setNewLine(req.body.youtubeLink);

    const announcement = new Announcement({
      title: req.body.title,
      content: content,
      link: link,
      youtubeLink: youtubeLink
    });
    announcement.save(function(err){
      if(!err){
        console.log("Announcement successfully submitted.")
      } else{
        console.log(err);
      }
    });
    res.redirect("/events");
  } else{
    res.send("Only admin can add Announcement.");
  }
});

//------------------- Academics home route -------------------
router.get("/academics",ensureAuthenticated,(req,res)=>{
    res.render("academics",{
        user:req.user,
        title: "Academics",
        authFlag: true
    });
});

//---------------------- QA home route ----------------------
router.get("/QA",ensureAuthenticated,(req,res)=>{
  Question.find({},async function(err, foundQuestions){
    if(!err){
      for (const q of foundQuestions) {
        const arr = [];
        q.answers.forEach(function(ansId){
         Answer.find({_id: ansId},function(err, foundAns){
            if(!err){
              arr.push(foundAns[0]);
            } else{
              console.log("answer is not fetched");
            }
          });
        });
        let x = await afterFewSeconds(10);
        q.answers = arr;
      }
      let x = await afterFewSeconds(10);
      res.render("QA",{
          user:req.user,
          title: "Question-Answers",
          questions: foundQuestions,
          authFlag: true
      });
    } else{
      console.log("question is not fetched");
    }
  });
});

//---------------------- compose Question get route ----------------------
router.get("/composeQuestion",ensureAuthenticated,(req,res)=>{
  res.render("composeQuestion", {
    user:req.user,
    title: "Ask a Question",
    authFlag: true
  });
});

//---------------------- compose Question post route ----------------------
router.post("/composeQuestion",ensureAuthenticated,(req,res)=>{
  let questionAsker = req.user.name;
  // if(req.body.anonymously.checked()){
  //   questionAsker = "Anonymous";
  // }
  const question = new Question({
    questionAsker: questionAsker,
    question: req.body.question,
  });
  question.save(function(err){
    if(!err){
      console.log("value inserted");
    } else{
      console.log(err);
    }
  });
  res.redirect("/QA");
});

//---------------------- compose Answer get route ----------------------
router.post("/composeAnswer",ensureAuthenticated,(req,res)=>{
    Question.findOne({_id: req.body.questionId}, function(err, foundquestion){
      if(!err){
        res.render("composeAnswer",{
          user: req.user,
          title: "Answer the question",
          q: foundquestion,
          authFlag: true
        });
      }
    });
});

//---------------------- compose Answer post route ----------------------
router.post("/submitAnswer",ensureAuthenticated,(req,res)=>{
  const owner = req.user.name;
  const ans = setNewLine(req.body.answer);
  const link = setNewLine(req.body.link);

  const answer = new Answer({
    owner: owner,
    answer: ans,
    link: link,
    like: [],
    dislike: []
  });
  answer.save(function(err){
    if(!err){
      console.log("value intserted");
    }
  });

  Question.findOneAndUpdate(
    {_id: req.body.questionId},
    {$push: {answers: answer} },
    function(err){
      if(err){
        console.log(err);
      } else{
        console.log("answer is successfully submitted.");
        res.redirect("/QA");
      }
    }
  );
});

//---------------------- Add/ remove like post route ----------------------
router.post("/like",(req,res)=>{
  const user = req.user.id;
  const answerId = req.body.answerId;
  if(req.body.status == 1){
    Answer.findOneAndUpdate(
      {_id: answerId},
      {$push: {like: user}},
      function(err){
        if(err){
          console.log(err);
        } else{
          console.log("successfully like the post.");
         // console.log(like);
          res.redirect("/QA");
        }
      }
    );
  } else{
    Answer.findOneAndUpdate(
      {_id: answerId},
      {$pull: {like: user}},
      function(err){
        if(err){
          console.log(err);
        } else{
          console.log("successfully remove like from the post.");
          res.redirect("/QA");
        }
      }
    );
  }
});

//----------------------Count the like get route---------------------------
// router.post("/countLikes", (req,res)=>{
//   const answerId = req.body.answerId;
//   Answer.find({_id: answerId}, function(err, foundAnswer){
//     res.send(
//         {
//           likeCount: foundAnswer.like.length,
//           dislikeCount: foundAnswer.dislike.length
//         }
//     );
//   })
// });

//---------------------- Add/ remove dislike post route ----------------------
router.post("/dislike",(req,res)=>{
  const user = req.user.id;
  const answerId = req.body.answerId;
  if(req.body.status == 1){
    Answer.findOneAndUpdate(
        {_id: answerId},
        {$push: {dislike: user}},
        function(err){
          if(err){
            console.log(err);
          } else{
            console.log("successfully dislike the post.");
            res.redirect("/QA");
          }
        }
    );
  } else{
    Answer.findOneAndUpdate(
        {_id: answerId},
        {$pull: {dislike: user}},
        function(err){
          if(err){
            console.log(err);
          } else{
            console.log("successfully remove dislike the post.");
            res.redirect("/QA");
          }
        }
    );
  }
});

module.exports = router;

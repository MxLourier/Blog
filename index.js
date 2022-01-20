var mysql = require("mysql");
var express = require("express");
const bodyParser = require("body-parser");
var ejs = require("ejs");

var posts = [];
var length;
var length2;
const app = express();


app.set('view engine', 'ejs'); //???

app.use(express.urlencoded({
  extended: true
}))

var con = mysql.createConnection({
  host: "localhost",
  port: "3307",
  user: "blog",
  password: "blog",
  database: "blog"
});


con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

app.get("/", function(req, res) {
  console.log("New DB query!");
  con.query("SELECT * FROM `pages`", function(err, result, fields) {
    if (err) throw err;
    //console.log(result);
    posts = result;
    console.log(posts);
    length = posts.length;
  })
  res.render("home", {
    posts: posts,
    length: length
  })
})

// app.get("/posts/:topic", function(req, res){
//   var match=false;
//   posts.forEach(function(post){
//   if(_.lowerCase(post.title)===_.lowerCase(req.params.topic)){
//     console.log("Match!");
//     res.render("post", {postTitle: post.title, postBody: post.body})
//   }
//   })
//
// })

app.get("/posts/:topic", function(req, res) {
  var match = false;
  posts.forEach(function(element) {
    if (element.url === ("/" + req.params.topic)) {
      match = true;
      con.query("SELECT * FROM `paragraphs` WHERE `paragraphs`.`PageID` = " + element.ID, function(err, result, fields) {
        if (err) throw err;
        //console.log(result);
        var paragraphs = result;
        console.log(paragraphs);
        length2 = paragraphs.length;
        res.render("post", {
          postTitle: element.Title,
          postBody: element.Summary,
          content: paragraphs,
          length: length2,
          id: element.ID
        })
      })

    }
  });
  if (!match) {
    res.render("post", {
      postTitle: "Not found",
      postBody: "No post found for " + req.params.topic,
      id: 0
    })
  }
})

app.get("/admin/post/:id/delete", function(req, res) {
  var match = false;
  posts.forEach(function(element, index) {
    if (element.ID == req.params.id) {
      match = true;
      con.query("DELETE FROM `paragraphs` WHERE `paragraphs`.`PageID` = " + element.ID, function(err) {
        if (err) throw err;
        //console.log(result);
        //var paragraphs=result;
        con.query("DELETE FROM `pages` WHERE `ID` = " + element.ID, function(err) {
          if (err) throw err;
          //posts.splice(index,1);
          res.redirect("/");
        })

      })

    }
  });
  if (!match) {
    res.render("post", {
      postTitle: "Not found",
      postBody: "No post found for " + req.params.topic,
      id: 0
    })
  }
})

app.get("/admin/post/:id/edit", function(req,res){
  if(req.params.id==0){
      res.render("edit", {post: 0});
  }else{
    con.query("SELECT * FROM `pages` WHERE `ID` = " + req.params.id, function(err, result, fields){
      if (err) throw err;
      console.log(result);
        res.render("edit", {post: result[0]});
     })
  }


})

app.post("/admin/post/:id/edit", function(req,res){
  if (req.params.id==0){
    con.query("INSERT INTO `pages` (`url`, `Title`, `Summary`) VALUES ('" + req.body.url + "', '"+ req.body.title+"', '" + req.body.summary +"');", function(err, result){
      if(err) throw err;
      res.redirect("/");

    })

  }else{
    con.query("UPDATE `pages` SET `url` = '" + req.body.url + "', `Title` = '" + req.body.title + "', `Summary` = '" + req.body.summary + "' WHERE `pages`.`ID` =" + req.params.id + ";", function(err){
      if(err) throw err;
      res.redirect("/");
    })
  }
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});

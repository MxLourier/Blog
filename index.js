
var mysql = require("mysql");
var express = require("express");
const bodyParser = require("body-parser");
var ejs = require ("ejs");

var posts = [];
var length;
var length2;
const app=express();


app.set('view engine', 'ejs'); //???

var con = mysql.createConnection({
  host: "localhost",
  port: "3307",
  user: "blog",
  password: "blog",
  database: "blog"
});

// con.connect(function(err){
//   if (err) throw err;
//   console.log("Connected!");
//   con.query("SELECT * FROM `pages`", function(err, result, fields){
//     if (err) throw err;
//     //console.log(result);
//     posts=result;
//     console.log(posts);
//     length = posts.length;
//     })
// });

con.connect(function(err){
  if (err) throw err;
  console.log("Connected!");
});

app.get("/", function(req, res){
  console.log("New DB query!");
  con.query("SELECT * FROM `pages`", function(err, result, fields){
    if (err) throw err;
    //console.log(result);
    posts=result;
    console.log(posts);
    length = posts.length;
    })
  res.render("home", {posts:posts, length: length})
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

app.get("/posts/:topic", function(req,res){
  var match=false;
  posts.forEach(function(element){
    if(element.url===("/"+req.params.topic)){
      match=true;
      con.query("SELECT * FROM `paragraphs` WHERE `paragraphs`.`PageID` = " +element.ID, function(err, result, fields){
        if (err) throw err;
        //console.log(result);
        var paragraphs=result;
        console.log(paragraphs);
        length2 = paragraphs.length;
        res.render("post", {postTitle: element.Title, postBody:element.Summary, content:paragraphs, length: length2})
        })

    }
  });
  if (!match) {
    res.render("post", {postTitle: "Not found", postBody:"No post found for "+req.params.topic})
  }
})



app.listen(3000, function() {
  console.log("Server started on port 3000");
});

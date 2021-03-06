var mysql = require("mysql");
var express = require("express");
const bodyParser = require("body-parser");
var ejs = require("ejs");

var length;
var length2;
const app = express();


app.set('view engine', 'ejs'); //???

app.use(express.urlencoded({ // turns "body" into object
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
    var posts = result;
    console.log(posts);
    length = posts.length;
    res.render("home", {
      posts: posts,
      length: length
    })

  })
})

app.get("/posts/:topic", function(req, res) {
  var match = false;
  con.query("SELECT * FROM `pages` WHERE `url` = '/" + req.params.topic + "'", function(err, result) {
    if(err) throw err;
      if (result.length == 0) {
        res.render("post", {
          postTitle: "Not found",
          postBody: "No post found for " + req.params.topic,
          id: 0
        })
        return;
      }
      con.query("SELECT * FROM `paragraphs` WHERE `paragraphs`.`PageID` = " + result[0].ID, function(err, result2, fields) {
          if (err) throw err;
          var paragraphs = result2;
          console.log(paragraphs);
          length2 = paragraphs.length;
          res.render("post", {
              postTitle: result[0].Title,
              postBody: result[0].Summary,
              content: paragraphs,
              length: length2,
              id: result[0].ID
            }
          )
      });
  });
});


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

app.get("/admin/post/:id/edit", function(req, res) {
  if (req.params.id == 0) {
    res.render("edit", {
      post: 0,
      length: 0,
      paragraph: []
    });
  } else {
    con.query("SELECT * FROM `pages` WHERE `ID` = " + req.params.id, function(err, result, fields) {
      if (err) throw err;
      console.log(result);
      con.query("SELECT * FROM `paragraphs` WHERE `PageID` = " + req.params.id, function(err, result2, fileds) {
        length = result2.length;
        res.render("edit", {
          post: result[0],
          length: length,
          paragraph: result2
        });
      })
      ///define length! = to paragraph count
    })
  }


})

app.post("/admin/post/:id/edit", function(req, res) {
  if (req.params.id == 0) {
    con.query("INSERT INTO `pages` (`url`, `Title`, `Summary`) VALUES ('" + req.body.url + "', '" + req.body.title + "', '" + req.body.summary + "');", function(err, result) {
      if (err) throw err;
      for (let i = 0; i < (req.body.paragraph.length); i++) {
        con.query("UPDATE `paragraphs` SET `Content` = '" + req.body.paragraph[i] + "' WHERE `PageID` = " + req.params.id + " and `ID` = " + req.body.paragraphID[i] + ";");
      }
      //con.query("INSERT INTO `paragraphs` ()")
      res.redirect("/");
    })

  } else {
    con.query("UPDATE `pages` SET `url` = '" + req.body.url + "', `Title` = '" + req.body.title + "', `Summary` = '" + req.body.summary + "' WHERE `pages`.`ID` =" + req.params.id + ";", function(err) {
      if (err) throw err;
      console.log(req.body.paragraph);
      if (!req.body.paragraph) {
        res.redirect("/");
        return;
      }
      req.body.paragraph.forEach(function(element, index) {
        var sql;
        console.log(parseInt(req.body.paragraphID[index]));
        if (parseInt(req.body.paragraphID[index])) {
          sql = "UPDATE `paragraphs` SET `Content` = '" + req.body.paragraph[index] + "' WHERE `PageID` = " + req.params.id + " and `ID` = " + req.body.paragraphID[index] + ";"
        } else {
          sql = "INSERT INTO `paragraphs` (`PageID`, `Content`) values('" + req.params.id + "', '" + req.body.paragraph[index] + "');"
        }
        console.log(sql);
        con.query(sql);
      })
      res.redirect("/");
    })
  }
})

app.post("/admin/addParagraph", function(req, res) {
  res.render("editParagraph", {
    i: req.body.delta,
    paragraph: {
      ID: 0,
      Content: ""
    }
  }) //?
})


app.post("/admin/deleteParagraph", function(req, res) {
  con.query("DELETE FROM `paragraphs` WHERE `paragraphs`.`ID` = " + req.body.paragraphID);

})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});

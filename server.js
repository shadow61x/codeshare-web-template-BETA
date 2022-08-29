const http = require('http');
const fs = require('fs');
const express = require('express');
const app = express()
const session = require("express-session");
const morgan = require('morgan');
const mongoose = require('mongoose');
const passport = require("passport");
const path = require("path");
const { Strategy } = require("passport-discord");
const bodyParser = require("body-parser");
const ejs = require("ejs");

//Mongodb models
const dbuser = require("./models/user.js");
const dbcodes = require("./models/codes.js");
const history = require("./models/history.js");


  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  app.use(bodyParser.json());
  app.use(
    bodyParser.urlencoded({
      extended: true,
    })
  );

  mongoose.connect("MONGO DB URL" , {useNewUrlParser : true , useUnifiedTopology: true})
.then((result) =>{
     console.log('mongoDB Bağlantı kuruldu');
})
.catch((err) => console.log(err))


  const strategy = new Strategy(
	{
	 clientID:"clientID",
        clientSecret:"clientSecret",
        callbackURL:"http://localhost:3000/callback",
     scope: ["identify","guilds.join","guilds"]
	},
	(_access_token, _refresh_token, user, done) =>
		process.nextTick(() => done(null, user)),
);

passport.use(strategy);

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: false,
	}),
);
app.use(passport.session());
app.use(passport.initialize());

app.use(express.static("public"));
app.set('view engine' , 'ejs')


const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    req.session.backURL = req.url;
    res.redirect("/anasayfa");
  };

  const templateDir = path.resolve(`${process.cwd()}${path.sep}/views`);

  const renderTemplate = (res, req, template, data = {}) => {
    const baseData = {
      path: req.path,
      user: req.isAuthenticated() ? req.user : null,
    };
      res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data)
      );
    
  };

  app.get(
    "/giris",
    (req, res, next) => {
      if (req.session.backURL) {
        req.session.backURL = req.session.backURL;
      } else if (req.headers.referer) {
  
      } else {
        
        res.redirect("/");
      }
      next();
    },
    passport.authenticate("discord", /*oto auth*/ { prompt: "none" })
  );
  
  app.get("/callback", 
      passport.authenticate("discord", {
          failureRedirect: "/hata",
      }),
         async (req, res) =>{
        let getuser = req.user
        const dbuserfind = await dbuser.findOne({userıd:req.user.id});
        if(dbuserfind.userıd == undefined)
        {
          const Dbuser = new dbuser({
           userıd: getuser.id,
           username: getuser.username,
           admin:false,
           vip:false,
           sharer:false
        })
        Dbuser.save()
        .then((result) =>{
            res.redirect("/");
        })
        .catch((err) =>{
            console.log(err);
        })

        }else{
          res.redirect("/");
        }
      },
  );

  // SAYFALAR //
  app.get("/anasayfa", async (req, res) => {
    renderTemplate(res, req, "anasayfa.ejs", {

  });
});


app.get("/", checkAuth, async (req, res) => {
  let dbuserfind = req.user
  let getuser = await dbuser.findOne({userıd:dbuserfind.id});
    renderTemplate(res, req, "index.ejs", {
getuser
  });
});

app.get("/panel/:ID", checkAuth, async (req, res) => {
  let dbuserfind = req.user
  const sunucu = req.params.ID;
  let getuser = dbuser.find({userıd:dbuserfind.sunucu});
  renderTemplate(res, req, "panel/index.ejs", {
  getuser
});
});

// ADMİN PANEL //
app.get("/admin/panel", checkAuth, async (req, res) => {
  let dbuserfind = req.user
  let codedata = await dbcodes.find();
  let historydata = await history.find();
  let getuser = await dbuser.findOne({userıd:dbuserfind.id});
  if(getuser.admin == false)
  {
    res.redirect("/admin/err");
  }
  else
  {
    renderTemplate(res, req, "admin/panel.ejs", {
      getuser,
      codedata,
      historydata
    });
  }


});


app.get("/admin/panel/codes", checkAuth, async (req, res) => {
  let dbuserfind = req.user
  let codedata = await dbcodes.find();
  let getuser = await dbuser.findOne({userıd:dbuserfind.id});
  if(getuser.admin == false)
  {
    res.redirect("/admin/err");
  }
  else
  {
    renderTemplate(res, req, "admin/codes.ejs", {
      getuser,
      codedata
    });
  }
});

app.get("/admin/panel/codes/add", checkAuth, async (req, res) => {
  let dbuserfind = req.user
  let getuser = await dbuser.findOne({userıd:dbuserfind.id});
  if(getuser.admin == false)
  {
    res.redirect("/admin/err");
  }
  else
  {
    renderTemplate(res, req, "admin/addcode.ejs", {
      getuser
    });
  }


});




// KOD PAYLAŞMA SİSTEMİ //
app.get("/codes", checkAuth, async (req, res) => {
  let dbuserfind = req.user
  const sunucu = req.params.ID;
  let getuser = dbuser.find({userıd:dbuserfind.sunucu});
  renderTemplate(res, req, "codes/index.ejs", {
  getuser
});
});






// HATA SAYFALARI //
app.get("/admin/err", checkAuth , async (req, res) => {
  let dbuserfind = req.user
  let getuser = await dbuser.findOne({userıd:dbuserfind.id});
  renderTemplate(res, req, "hata/adminerr.ejs", {
    getuser
  });
});




// POST İŞLEMLERİ //
app.post("/code/add", checkAuth, async (req, res) => {
  let dbuserfind = req.user
  let getuser = await dbuser.findOne({userıd:dbuserfind.id});
  var body  = req.body

 

  const Dbcodes = new dbcodes({
    ktp: body.dil,
    sahipID: body.sahip,
    kod:body.code,
    acıklama:body.longDesc,
    baslık:body.codename,
    altp: body.altyapı
 })
 Dbcodes.save()
.then((result) => {
  const History = new history({
    islemsahipName: req.user.username,
    islemsahipID:req.user.id,
    islem:`Sisteme kod ekledi Baslık: ${body.codename}`,
    adminkontrol:getuser.admin

 })
 History.save()
res.redirect("/admin/panel/codes");
});

});


app.use( ( req,res) =>{
    res.status(404).render('./404/404.ejs')
})


app.listen(3000, ()=>{
    console.log("Sunucu 3000 portunda çalıştırılıyor...");
   })
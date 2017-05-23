var http = require("http");
var express = require('express');
var fs = require('fs');
var app = express();
var _ = require('underscore');
var bodyParser = require('body-parser');
var path = require("path");
var urlencodedParser = bodyParser.urlencoded({
    extended: false
})

//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
    extended: true
}));


app.listen(process.env.PORT || 8000, function () {
    console.log('Aplikacija je hostovana na adresi: localhost:8000')
})

app.get('/css/style.css', function (req, res) {
    res.sendFile(__dirname + '/css/style.css')
})
app.get('/js/app.js', function (req, res) {
    res.sendFile(__dirname + '/js/app.js')
})
//default url
app.get('/', function (req, res) {
    RedirectHome(res);
})
app.get('/data', function (req, res) {
    res.send(SelectAll())
})
app.get('/edit/:id', function (req, res) {
    var ad = SelectByID(req.params.id);
    res.send(ad);
})
app.post('/save', function (req, res) {
    var ad = new Ad(
        req.body.adID || null,
        req.body.title || null,
        req.body.text || null,
        req.body.company || null,
        Date.now());
    Save(res, ad);
});


app.post('/delete', function (req, res) {
    var ads = SelectAll();
    newArr = [];
    for (var i = 0; i < ads.data.length; ++i) {
        if (ads.data[i]['adID'] != req.body.id) {
            newArr.push(ads.data[i]);
        } else {
            var title = ads.data[i]['title']
        }
    }
    ads.data = newArr;
    Write(ads);
    if (title)
        res.send('Uspesno obrisan oglas:' + title);
})

// error page
app.all('/*', function (req, res) {
    res.send('Pogresan url');
});

function SelectAll() {
    var obj = JSON.parse(fs.readFileSync('js/data.json', 'utf8'));
    return obj;
}

function SelectByID(id) {
    var obj = SelectAll();
    var ad = _.find(obj.data, function (item) {
        return item.adID == id;
    });
    return ad;
}

function Save(res, ad) {
    var ads = SelectAll();
    if (ad.adID == 0) {
        ad.adID = GenerateID();
        ads.data.push(ad);
    } else if (ad.adID > 0) {
        for (var i = 0; i < ads.data.length; ++i) {
            if (ads.data[i]['adID'] == ad.adID) {
                ads.data[i]['title'] = ad.title;
                ads.data[i]['text'] = ad.text
                ads.data[i]['company'] = ad.company
            }
        }
    }
    Write(ads);
    res.send('Uspešno ste sačuvali podatak!');
}

function Write(ads) {
    fs.writeFile('js/data.json', JSON.stringify(ads), 'utf-8', function (err) {
        if (err) throw err
    })
}

//constructor
function Ad(adID, title, text, company, date) {
    this.adID = adID;
    this.title = title;
    this.text = text;
    this.company = company;
    this.date = formatDate(new Date(date));
}

function formatDate(currentdate) {
    return currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + "-" + currentdate.getFullYear() + " " + currentdate.getHours() + ":" + currentdate.getMinutes();
}

//provides unique id for insert
function GenerateID() {
    var arr = SelectAll();
    var m = _.max(arr.data, function (o) {
        return o.adID;
    });
    var x = m.adID + 1;
    return x;
}

function RedirectHome(res) {
    res.sendFile(__dirname + '/index.html')
}
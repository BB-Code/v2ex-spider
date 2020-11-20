const express = require('express');
const fs = require('fs');
const path = require('path');
var exphbs = require('express-handlebars');
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

Sentry.init({
    dsn: "https://25813ad4752b447eba7fa24870254191@o427468.ingest.sentry.io/5525131",
    tracesSampleRate: 1.0,
});

const transaction = Sentry.startTransaction({
    op: "test",
    name: "My First Test Transaction",
});

setTimeout(() => {
    try {
        test();
    } catch (e) {
        Sentry.captureException(e);
    } finally {
        transaction.finish();
    }
}, 1000);

const app = express();


var hbs = exphbs.create({
    helpers: {
        compare: function (data1, data2, options) {
            if (data1 == data2) {
                return options.fn(this);
            }
            else {
                return options.inverse(this);
            }
        },
    },
    extname: '.hbs'
});
app.engine('.hbs', hbs.engine);
app.set('view engine', '.hbs');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'pubilc')));

app.get('/', function (req, res) {
    res.json({
        status: 200
    });
});


app.get('/list/:id', function (req, res) {
    console.log(req.params);
    const result = fs.readFileSync(path.join(__dirname, 'data') + `/info${req.params.id}.json`).toString();
    res.json({
        data: JSON.parse(result)
    });
});

app.get('/home/:page', function (req, res) {
    if (req.params.page == '30') {
        req.params.page = '29';
    }
    const result = fs.readFileSync(path.join(__dirname, 'data') + `/info${req.params.page}.json`).toString();
    return res.render('index', {
        articleList: JSON.parse(result),
        prev: req.params.page == 0 ? 1 : parseInt(req.params.page) - 1,
        next: parseInt(req.params.page) + 1
    });
});

app.listen(3000, () => {
    console.log(`Server is running at http://localhost:3000`);
});

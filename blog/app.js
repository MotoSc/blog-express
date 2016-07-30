var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var settings = require('./settings');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var flash = require('connect-flash');
// var users = require('./routes/users');

var app = express(); // 生成一个express实例app

// view engine setup
app.set('views', path.join(__dirname, 'views')); //设置views文件夹为存放视图文件
app.set('view engine', 'ejs'); //设置视图模板引擎为ejs

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(flash()); //加载flash模块
app.use(logger('dev')); //加载日志中间件
app.use(bodyParser.json()); //加载解析json的中间件
app.use(bodyParser.urlencoded({ extended: false })); //加载urlencoded请求体的中间件
app.use(cookieParser()); //加载解析cookie的中间件
app.use(express.static(path.join(__dirname, 'public'))); //设置public文件夹为存放静态文件的目录

app.use(session({
  secret: settings.cookieSecret,
  key: settings.db,
  cookie: {maxAge: 1000 * 60 * 60 * 24 * 30},
  store: new MongoStore({
    db: settings.db,
    host: settings.host,
    port: settings.port
  }),
  resave: true,
  saveUninitialized: true
}));
// app.use('/', routes); // 路由控制器
routes(app)
// app.use('/users', users); //路由控制器

module.exports = app;

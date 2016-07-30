var User = require('../models/user');
var Post = require('../models/post');
var crypto = require('crypto');


module.exports = function(app) {
  app.get('/', function(req, res) {

    Post.get(null, function(err, posts) {
      if (err) {
        posts = [];
      }
      res.render('index', {
        title: '主页',
        posts: posts,
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
      });
    });

    /*
    res.render 用来渲染模板，第一个参数是模板的名称，对应views目录下面模板文件名，扩展名.ejs可选。
    第二个参数试产递给模板的数据对象，用于模板翻译。
    */
  });

  app.get('/reg', checkNotLogin); //检测如果已登录重定向到返回
  app.get('/reg', function(req, res) {
    res.render('reg', {
      title: '注册',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
  app.post('/reg', checkNotLogin); //检测如果已登录重定向到返回
  app.post('/reg', function(req, res) {
    var name = req.body.name,
    password = req.body.password,
    password_re = req.body['password-repeat'];

    if (password != password_re) {
      console.log('flash error:两次输入的密码不一致！');
      req.flash('error', '两次输入的密码不一致！');
      return res.redirect('/reg');//返回注册页
    }

    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
      name: req.body.name,
      password: password,
      email: req.body.email
    });

// 查找用户是否已经存在
    User.get(newUser.name, function(err, user) {
      if (err) {
        console.log('查找 ' + newUser.name + '失败');
        req.flash('error', err);
        return res.redirect('/');
      }
      // 如果存在
      if (user) {
        console.log('查找 ' + user.email + '成功');
        req.flash('error', '用户已存在！');
        return res.redirect('/reg'); //返回注册页
      }

      // 如果不存在
      newUser.save(function(err, result) {
        if (err) {
          req.flash('error', err);
          return res.redirect('/reg'); //注册失败返回注册页
        }
        req.session.user = newUser; //用户信息存入session
        req.flash('success', '注册成功');
        res.redirect('/'); //注册成功后返回主页
      });
    });
  });

  app.get('/login', checkNotLogin); //get登录，如果已经登录，重定向到back
  app.get('/login', function(req, res) {
    console.log('login....');
    res.render('login', {
      title: '登录',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/login', checkNotLogin);
  app.post('/login', function(req, res) {
    // 生成密码的md5
    var md5 = crypto.createHash('md5'),
    password = md5.update(req.body.password).digest('hex');
    // 检查用户是否存在
    User.get(req.body.name, function(err, user) {
      // 如果不存在
      if (!user) {
        req.flash('error', '用户不存在！');
        return res.redirect('/login');
      }
      // 如果存在，检查密码是否一致
      if (user.password != password) {
        req.flash('error', '密码错误！');
        return res.redirect('/login')
      }
      req.session.user = user;
      req.flash('success', '登出成功！');
      res.redirect('/'); //登出后成功跳转到主页
    });
  });

  app.get('/post', checkLogin); //检测是否已经登录
  app.get('/post', function(req, res) {
    res.render('post', {
      title: '发表',
      user: req.session.user,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });

  app.post('/post', checkLogin);
  app.post('/post', function(req, res) {
    var currentUser = req.session.user,
    post = new Post(currentUser.name, req.body.title, req.body.post);
    post.save(function (err) {
      if (err) {
        req.flash('error', err);
        return res.redirect('/');
      }
      req.flash('success', '发布成功！');
      res.redirect('/');
    });
  });


  app.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', '登出成功！');
    res.redirect('/'); //登出成功后跳转主页
  });
};

function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', '未登录！');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', '已登录！');
    res.redirect('back');
  }
  next();
}

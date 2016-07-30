var mongodb = require('./db'),
markdown = require('markdown').markdown;

function Post(name, title, post) {
  this.name = name;
  this.title = title;
  this.post = post;
}

module.exports = Post;

Post.prototype.save = function (callback) {
  var date = new Date();
  var year = date.getFullYear(),
  month = date.getMonth() + 1,
  day = date.getDate(),
  hours = date.getHours(),
  minutes = date.getMinutes() < 10 ? '0' + date.getMinutes(): date.getMinutes(),
  seconds = date.getSeconds() < 10 ? '0' + date.getSeconds(): date.getSeconds();
  var time = {
    date: date,
    year: date.getFullYear(),
    month: date.getFullYear() + '-' + month,
    day: date.getFullYear() + '-' + month + '-' + day,
    minute: date.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds
  }
// 要存入数据库的文档
  var post = {
    name: this.name,
    time: time,
    title: this.title,
    post: this.post
  }

  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    //读取posts集合
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }

      collection.insert(post, {
        safe: true
      }, function(err) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        callback(null);
      });
    })
  });
};

Post.get = function(name, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      return callback(err);
    }
    // 读取posts集合
    db.collection('posts', function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err);
      }
      var query = {};
      if (name) {
        query.name = name;
      }
      collection.find(query).sort({
        time: -1
      }).toArray(function(err, docs) {
        mongodb.close();
        if (err) {
          return callback(err);
        }
        docs.forEach(function(doc) {
          doc.post = markdown.toHTML(doc.post);
        });
        callback(null, docs);
      })
    });
  });
}

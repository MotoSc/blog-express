var mongodb = require('./db');

function User(user) {
  this.name = user.name;
  this.password = user.password;
  this.email = user.email;
}

module.exports = User;

User.prototype.save = function(callback) {
  console.log('\n--- save ---\n');
    var user = {
      name: this.name,
      password: this.password,
      email: this.email
    };
    console.log('before open');
    mongodb.open(function(err, db) {
      console.log(err + ' db:' + db);
      if (err) {
        mongodb.close();
        return callback(err);
      }
      db.collection('users', function(err, collection) {
        if (err) {
          mongodb.close();
          return callback(err);
        }
        collection.insert(user, {
          safe: false
        }, function(err, user) {
          mongodb.close();
          if (err) {
            return callback(err);
          }
          callback(null, user);
        });
      });
    });
};

// 读取用户信息
User.get = function(name, callback) {
  // 打开数据库
  mongodb.open(function(err, db) {
    if (err) {
      mongodb.close();
      return callback(err); // 错误，返回err信息
    }
    // 读取users 集合
    db.collection('users',function(err, collection) {
      if (err) {
        mongodb.close();
        return callback(err); //错误，返回err信息
      }
      // 查找用户名（name键） 值为name 一个文档
      collection.findOne({
        name: name
      }, function(err, user){

        if (err) {
          mongodb.close();
          return callback(err); //失败，返回err信息
        }
        mongodb.close();
        callback(null, user); //成功！返回查询的用户信息
      });
    })
  });
}

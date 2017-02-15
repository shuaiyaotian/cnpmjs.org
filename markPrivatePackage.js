/**
 * Created by liyue@fenbi.com on 2/15/17.
 */
'use strict';

var Sqlite3 = require('sqlite3').verbose();

var packages = 'ape-common,grunt-fenbi-tasks,express-apiproxy,ape-web-static-common,frog,ape-cli,ape-web-comment,ape-web-daily,webview,web-common-sample,angular-commons-site,angular-sample,angular-common,ape-raven-transport,ape-logger,ape-express-wechat-jssdk,ape-frog,@fenbi/service,@fenbi/frog,@fenbi/keynote,@fenbi/webview,@fenbi/angular-common,@fenbi/common,plantower,@fenbi/express-wechat-jssdk,angular-ui-ace-builds,@fenbi/angular-ui-ace-builds,@fenbi/csi,@fenbi/rabbitmq-client,ape-web-image-annotation,ape-web-audio-record,@fenbi/web-ui,@fenbi/rc-paper,@fenbi/rc-grading,@fenbi/logger,performance,@fenbi/performance,market,@fenbi/error-log,@fenbi/koa-wechat-config,@fenbi/umeditor,@solar/common,@fenbi/ape-web-image-annotation,@fenbi/chart-js'
  .split(',').reduce(function (a, b) {
    a[b] = true;
    return a;
  }, {});

var db = new Sqlite3.Database('/home/shared/.cnpmjs.org/data.sqlite', Sqlite3.OPEN_READWRITE, function () {
  var updateCount = 0;
  var checkCount = 0;
  db.serialize(function () {
    db.each('select id, name, package from module', {}, function (err, row) {
      if (err) {
        return console.error('select error: ', err);
      }
      if (!packages[row.name]) {
        return;
      }
      try {
        var pack = JSON.parse(decodeURIComponent(row.package));
        pack._publish_on_cnpm = true;
        pack = encodeURIComponent(JSON.stringify(pack));
        updateCount++;
      } catch (e) {
        return console.error('JSON error ', e);
      }

      db.run('update module set package=? where id=?', pack, row.id, function (err) {
        if (err) {
          return console.error('update error: ', err, row.id, row.name);
        }
        console.log('update ', row.id, row.name);
      });
    });
    db.each('select id, name, package from module', {}, function (err, row) {
      if (err) {
        return console.error('select error: ', err);
      }
      if (!packages[row.name]) {
        return;
      }
      try {
        var pack = JSON.parse(decodeURIComponent(row.package));
        if (pack._publish_on_cnpm) {
          console.log(row.id, row.name, 'passed');
          checkCount++;
        }
      } catch (e) {
        return console.error('JSON error ', e);
      }
    });
    db.close(function (err) {
      if (err) {
        return console.log('db error ', err);
      }
      console.log('update count:', updateCount, 'check count:', checkCount);
      console.log('finished');
    });
  })
});

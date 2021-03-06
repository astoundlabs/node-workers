// Generated by CoffeeScript 1.3.3
(function() {
  var HEARTBEAT, Worker, file, options,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  HEARTBEAT = 1000;

  Worker = (function() {

    function Worker(file, options) {
      if (options == null) {
        options = {};
      }
      this.shutdown = __bind(this.shutdown, this);

      this.message = __bind(this.message, this);

      if (options.coffee) {
        require('coffee-script');
      }
      this.module = require(file);
      process.on('message', this.message);
      process.on('disconnect', this.shutdown);
      this.heartbeat();
    }

    Worker.prototype.heartbeat = function() {
      return setTimeout(function() {
        try {
          return process.send({
            name: 'alive?'
          });
        } catch (e) {
          console.log("Exiting");
          return process.exit(0);
        }
      }, 1000);
    };

    Worker.prototype.message = function(msg) {
      switch (msg.name) {
        case 'task':
          return this.perform(msg.payload);
      }
    };

    Worker.prototype.perform = function(task) {
      process.send({
        name: 'processing'
      });
      try {
        return this.module.work(task, function(e, result) {
          if (e) {
            return process.send({
              name: 'error',
              payload: {
                msg: e.toString(),
                stack: e.stack
              }
            });
          } else {
            return process.send({
              name: 'done',
              payload: result
            });
          }
        });
      } catch (e) {
        return process.send({
          name: 'error',
          payload: {
            msg: e.toString(),
            stack: e.stack
          }
        });
      }
    };

    Worker.prototype.shutdown = function() {
      return process.exit(0);
    };

    return Worker;

  })();

  file = process.argv[2];

  options = process.argv[3];

  if (options) {
    options = JSON.parse(options);
  }

  exports.worker = new Worker(file, options);

}).call(this);

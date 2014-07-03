[![Build Status](https://travis-ci.org/gaiajs/gaiajs-driver-mongoose.svg?branch=master)](https://travis-ci.org/gaiajs/gaiajs-driver-mongoose)
[![Dependency Status](https://gemnasium.com/gaiajs/gaiajs-driver-mongoose.svg)](https://gemnasium.com/gaiajs/gaiajs-driver-mongoose)
[![NPM version](https://badge.fury.io/js/gaiajs-driver-mongoose.svg)](http://badge.fury.io/js/gaiajs-driver-mongoose)
 > Mongoose driver for gaiajs

## Configuration
```js
{
  name: 'default', //name of persistence
  driver: 'gaiajs-driver-mongoose',//name or absolute path of driver
  connectionUri: "mongodb://localhost/test",//connection uri
  connection: {
    server: 'localhost', //server host
    user: '', //user - Optional
    password: '', //password - Optional
    database: 'timeline' // database name
  },

  options:{}
}
```
Driver use uri on priority then connection object.

To know the driver options, go to the [documentation mongoose](http://mongoosejs.com/docs/connections.html#options)

## Authors

  - [David Touzet](https://github.com/eyolas)

# License

  MIT

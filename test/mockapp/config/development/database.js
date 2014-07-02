exports.persistences = [{ 
  name: 'default',
  driver: __dirname + '/../../../../',
  connection: {
    server: 'localhost',
    user: '',
    password: '',
    database: 'test'
  },

  debug: true
  
}];
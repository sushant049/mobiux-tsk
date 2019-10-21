module.exports = (app) => {
  const operations = require('../controllers/operations.controllers.js');

  app.get('/GetDataSet', operations.DataSet);

  app.post('/AllCalculations', operations.AllCalculations);

}
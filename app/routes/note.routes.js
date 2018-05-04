module.exports = (app) => {
  const notes = require('../controllers/note.controller.js');
  // Create a new Note
  app.post('/notes', app.authenticate,  notes.create);
  
  // Retrieve all Notes
  app.get('/notes', app.authenticate, notes.findAll);
  
  // Retrieve a single Note with noteId
  app.get('/notes/:noteId', app.authenticate,   notes.findOne);

  // Update a Note with noteId
  app.put('/notes/:noteId', app.authenticate, notes.update);

  // Delete a Note with noteId
  app.delete('/notes/:noteId', app.authenticate,  notes.delete);

}
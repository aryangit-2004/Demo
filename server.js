const festivities = require('express');
const bodyParserModule = require('body-parser');

const celebrationApp = festivities();
const celebrationPort = process.env.CELEBRATION_PORT || 5050;

celebrationApp.use(bodyParserModule.json());

const eventArchive = [];

celebrationApp.get('/gatherings', (request, response) => {
  response.json(eventArchive);
});

celebrationApp.post('/gatherings', (request, response) => {
  const newGathering = {
    occasion: request.body.occasion,
    date: request.body.date,
  };
  eventArchive.push(newGathering);
  response.status(201).json(newGathering);
});

celebrationApp.put('/gatherings/:id', (request, response) => {
  const id = parseInt(request.params.id);
  const updatedGathering = {
    occasion: request.body.occasion,
    date: request.body.date,
  };
  eventArchive[id] = updatedGathering;
  response.json(updatedGathering);
});

celebrationApp.delete('/gatherings/:id', (request, response) => {
  const id = parseInt(request.params.id);
  eventArchive.splice(id, 1);
  response.json({ message: 'Gathering erased' });
});

celebrationApp.listen(celebrationPort, () => {
  console.log(`Festivity server is up and running on port ${celebrationPort}`);
});

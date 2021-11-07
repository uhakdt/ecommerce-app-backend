const app = require('./app');

const port = process.env.PORT || 9967;

app.get('/', (req, res) => {
  res.send("I am going to become the King of the Pirates. If this means I will die on the journey, so be it!");
});

app.listen(port, () => {
  console.log(`Server is running... Listening on port ${port}`);
});
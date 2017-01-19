// No need to edit this file

var path = require('path'),
    express = require('express'),
    sassMiddleware = require('node-sass-middleware'),
    ejs = require('ejs'),
    app = express();

app.use(sassMiddleware({
  /* Options */
  src: path.join(__dirname, 'public', 'css'),
  dest: path.join(__dirname, 'public', 'css'),
  debug: true,
  outputStyle: 'compressed',
  prefix:  '/css'
}));

app.use('/fonts', express.static(path.join(__dirname, '..', 'node_modules', 'font-awesome', 'fonts')));
app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules')));

app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', ejs.renderFile);

// routes
app.get('/', function (req, res) {
  res.render('index.html')
});

// start
app.listen(3000, function () {
  console.log('Please open http://localhost:3000 to start developing')
});

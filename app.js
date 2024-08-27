const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES
// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Set security HTTP headers
// app.use(helmet());
// const scriptSrcUrls = [
//   'https://unpkg.com/',
//   'https://tile.openstreetmap.org',
//   'https://*.cloudflare.com',
//   'https://*.stripe.com',
//   'https://*.mapbox.com',
//   'https://*.openstreetmap.com',
// ];
// const styleSrcUrls = [
//   'https://unpkg.com/',
//   'https://tile.openstreetmap.org',
//   'https://fonts.googleapis.com/',
// ];
// const connectSrcUrls = [
//   'https://unpkg.com',
//   'https://tile.openstreetmap.org',
//   'https://*.mapbox.com',
//   'https://checkout.stripe.com',
// ];
// const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];
 
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'", 'data:', 'blob:'],
//       baseUri: ["'self'"],
//       connectSrc: ["'self'", 'blob:', ...connectSrcUrls],
//       scriptSrc: [
//         "'self'",
//         'https:',
//         'http:',
//         'blob:',
//         'https://*.stripe.com',
//         ...scriptSrcUrls,
//       ],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", 'blob:'],
//       objectSrc: ["'none'"],
//       imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
//       fontSrc: ["'self'", ...fontSrcUrls],
//       frameSrc: ["'self'", 'https://*.stripe.com'],
//       childSrc: ["'self'", 'blob:'],
//     },
//   })
// );

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "blob:",
        "https://unpkg.com",
        "https://tile.openstreetmap.org",
        "https://*.mapbox.com",
        "https://checkout.stripe.com",
        "ws://localhost:55917"
      ],
      // other directives...
    },
  })
);


// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.cookies);
  next();
});

// 3) ROUTES
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

{/* <iframe width="425" height="350" src="https://www.openstreetmap.org/export/embed.html?bbox=3.316411972045899%2C7.132831196050154%2C3.3821582794189458%2C7.179159390611701&amp;layer=mapnik&amp;marker=7.155995881215424%2C3.349285125732422" style="border: 1px solid black"></iframe><br/><small><a href="https://www.openstreetmap.org/?mlat=7.15600&amp;mlon=3.34929#map=14/7.15600/3.34929">View Larger Map</a></small> */}
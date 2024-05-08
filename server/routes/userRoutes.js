import express from 'express';
import { createUser, loginUser ,forgotPassword, resetpassword, getpassword, verifypassword, logout} from '../controllers/user.js'; // Assuming your controller file is named userController.js

const router = express.Router();

// Routes prefixed with /api/users
router.post('/signup', createUser);
router.post('/login', loginUser);
router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword', resetpassword);
router.get('/getpassword', verifypassword, getpassword); 
router.get('/logout',logout); 
export default router;


// const router = express.Router(): This creates a new 
// instance of the Express Router class. This router 
// object can be used to define routes and associated 
// middleware for your application.


// req: This is an object representing the HTTP request. 
// It contains information about the request made by the 
// client, such as the URL, request headers, request
//  method (GET, POST, etc.), query parameters, body 
//  parameters (for POST requests), and more.

// res: This is an object representing the HTTP response 
// that the server will send back to the client. It 
// provides methods and properties for building and 
// sending the response, such as setting response headers,
//  setting the HTTP status code, and sending data back 
//  to the client.

// this code snippet is creating an API endpoint 
// (/signup) on your server application, and it's
//  defining the logic to handle POST requests to that
//   endpoint. It's not making an API call; rather, it's 
//   setting up the server-side functionality for 
//   handling incoming requests.


// In Express, regardless of the HTTP method being used
//  (POST, GET, PUT, PATCH, DELETE), the route definition
//   typically consists of two main components:

// Route: This is the URL path for which the middleware 
// function will be invoked. It specifies the endpoint 
// where the client can send requests.

// Callback function: This is the function that will be 
// executed when a request is made to the specified route.
//  It handles the incoming request and generates the 
//  appropriate response to send back to the client.
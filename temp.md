— -

**Title: Implementing Google Authentication with React JS and Node.js**

**Introduction:**

In this article, we will walk you through the process of setting up Google Authentication in a React JS frontend and a Node.js backend. Google Authentication is a secure and convenient way to allow users to log in to your web application using their Google accounts. We will provide step-by-step instructions and complete code examples to help you achieve this.

**Frontend: React JS**

1. **Install the Google Authentication Library:**

Start by installing the `@react-oauth/google` library using npm. This library provides the necessary components and methods for Google Authentication.

```bash
npm install @react-oauth/google@latest
```

For more details about this library, visit its [npm package page](https://www.npmjs.com/package/@react-oauth/google).

2. **Create a Google Authentication Component:**

Create a React component for Google Authentication. Use the following code as a template:

```jsx
import React from ‘react’;
import { GoogleLogin, GoogleOAuthProvider } from ‘@react-oauth/google’;

const GoogleAuth = () => {
const clientId = “Enter your client Id”;

return (
<GoogleOAuthProvider clientId={clientId}>
<GoogleLogin
onSuccess={credentialResponse => {
console.log(credentialResponse);
}}
onError={() => {
console.log(‘Login Failed’);
}}
/>
</GoogleOAuthProvider>
);
};

export default GoogleAuth;
```

3. **Using the Google Authentication Component:**

You can use the `GoogleAuth` component wherever you need Google Authentication in your application. It will return a response object like this on successful authentication:

```json
{
credential: “jwt token”,
clientId: “id of client from Google Cloud Console”,
selectBy: “btn”
}
```

4. **Call an API and Pass the Response:**

To complete the authentication process, you’ll need to call an API on your Node.js backend and pass the response object to it.

**Backend: Node.js**

1. **Install the Google Authentication Library:**

In your Node.js server, install the `google-auth-library` to handle Google Authentication.

```bash
npm install google-auth-library
```

2. **Create a Node.js Server:**

Create a `server.js` file and set up an Express.js server to handle the authentication requests. The following code snippet demonstrates this setup:

```javascript
const express = require(‘express’);
const { OAuth2Client } = require(‘google-auth-library’);
const client = new OAuth2Client();
const app = express();
const PORT = 5000;

// API for Google Authentication
app.post(“/google-auth”, async (req, res) => {
const { credential, client_id } = req.body;
try {
const ticket = await client.verifyIdToken({
idToken: credential,
audience: client_id,
});
const payload = ticket.getPayload();
const userid = payload[‘sub’];
res.status(200).json({ payload });
} catch (err) {
res.status(400).json({ err });
}
});

app.listen(PORT, () => console.log(`Server running on PORT : ${PORT}`));
```

3. **Configure Environment Variables:**

Manage your environment variables using the `dotenv` library. Create a `.env` file and add the necessary configuration, such as your MongoDB URI and JWT secret.

```bash
npm i dotenv
```

4. **Connect to MongoDB:**

To store user data, you can use MongoDB with Mongoose. Create a `dbConfig.js` file to connect to your MongoDB database.

```javascript
const mongoose = require(“mongoose”);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log(“Database connected”))
.catch((err) => console.log(err));
```

Import this configuration in your `server.js` file.

5. **Create a User Model:**

Create a `userModel.js` file in a “models” folder to define the user schema using Mongoose. This schema should include user information like email, name, and authentication source (Google or self-registration).

```javascript
const mongoose = require(“mongoose”);
const { Schema } = mongoose;

const userSchema = Schema({
email: {
required: true,
unique: true,
type: String,
},
name: {
required: true,
type: String
},
password: {
required: false,
type: String
},
authSource: {
enum: [“self”, “google”],
default: “self”
}
});

module.exports = mongoose.model(“user”, userSchema);
```

6. **Generate JWT Tokens:**

To handle user sessions, you can use JSON Web Tokens (JWT). Install the `jsonwebtoken` library:

```bash
npm i jsonwebtoken
```

In your `server.js` file, add the code to generate JWT tokens after successful Google Authentication. Store your JWT secret in your environment variables:

```javascript
const jwt = require(“jsonwebtoken”);

// jwt secret — store this JWT secret in your .env file
const JWT_SECRET = process.env.JWT_SECRET;

// API for Google Authentication
app.post(“/google-auth”, async (req, res) => {
// …

// Check if the user exists in your database
let user = await User.findOne({ email });
if (!user) {
// Create a user if they do not exist
user = await User.create({
email,
name: `${given_name} ${family_name}`,
authSource: ‘google’,
});
}

// Generate a JWT token
const token = jwt.sign({ user }, JWT_SECRET);
res.status(200).cookie(‘token’, token, { http: true }).json({ payload });
});

app.listen(PORT, () => console.log(`Server running on PORT : ${PORT}`));
```

**Conclusion:**

With these steps and complete code examples, you can successfully implement Google Authentication in your React JS and Node.js application. Users can log in with their Google accounts, and you can securely manage their authentication and user data in the Node.js backend. This setup provides a seamless and secure way for users to access your web application.

— -
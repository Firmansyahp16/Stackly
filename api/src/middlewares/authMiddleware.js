const pool = require("../configs/dbConfig");

// Check session
const isLoggedIn = (req, res, next) => {
  // If session is empty, send 401
  if (!req.session.user) {
    res.status(401).send("You have to login first");
    return;
  }

  // Go to next function
  next();
};

// POST /auth/login
const authLogin = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Store parameters from req body
  const { username, password } = req.body;

  try {
    // Check username and password from DB
    const user = await client.query(
      "SELECT * FROM users WHERE username=$1 AND password=$2",
      [username, password]
    );

    // If user is empty, send 404
    if (user.rowCount === 0) {
      res.status(404).send("Incorrect Username or Password");
      return;
    }

    // Get the present time
    const date = new Date();

    // Update user's lastLogin
    const updateLogin = await client.query(
      'UPDATE users SET "lastLogin"=$1 WHERE username=$2 returning *',
      [date, username]
    );

    // If updateLogin is empty, send
    if (updateLogin.rowCount === 0) {
      res.status(409).send("Failed to Update user's Last Login");
      return;
    }

    // updateLogin is not empty, store user's data to the session
    req.session.user = user.rows[0];
    // Send 200
    res.status(200).send("Login Successfully");
  } catch (error) {
    // Error handler
    res.status(500).send("Internal Server Error \n" + error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

// POST /auth/logout/:id
const authLogout = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter from session
  const id = req.session.user.userId;

  try {
    // Get the present time
    const date = new Date();

    // Update user's lastLogout
    const updateLogout = await client.query(
      'UPDATE users SET "lastLogout"=$1 WHERE "userId"=$2 returning *',
      [date, id]
    );

    // If updateLogout is empty, send 409
    if (updateLogout.rowCount === 0) {
      res.status(409).send("Failed to Update lastLogout");
      return;
    }

    // updateLogout is not empty, destroy session
    req.session.destroy();
    // Send 200
    res.status(200).send("Logout Successfully");
  } catch (error) {
    // Error handler
    res.status(500).send("Internal Server Error \n" + error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

const authRegister = async (req, res) => {
  const client = await pool.connect();
  const { username, password, fullname, email } = req.body;
  try {
    const checkUsername = await client.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (checkUsername.rowCount >= 1) {
      res.status(409).send("Username is already used");
      return;
    }
    const checkEmail = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (checkEmail.rowCount >= 1) {
      res.status(409).send("Email is already used");
      return;
    }
    const insertUser = await client.query(
      "INSERT INTO users (username, password, fullname, email) VALUES ($1, $2, $3, $4) returning *",
      [username, password, fullname, email]
    );
    if (insertUser.rowCount === 0) {
      res.status(409).send("Failed to Register");
      return;
    }
    res.status(200).send("Register Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error \n" + error.message);
  } finally {
    client.release();
  }
};

const authForgotPassword = async (req, res) => {
  const client = await pool.connect();
  const { username, email, password } = req.body;
  try {
    if (!username && !email) {
      res.status(409).send("Username or Email is required");
      return;
    }
    const checkUsernameEmail = await client.query(
      "SELECT * FROM users WHERE username = $1 AND email = $2",
      [username, email]
    );
    if (checkUsernameEmail.rowCount === 0) {
      res.status(409).send("Username or Email is not found");
      return;
    }
    const updatePassword = await client.query(
      "UPDATE users SET password = $1 WHERE username = $2 AND email = $3 RETURNING *",
      [password, username, email]
    );
    if (updatePassword.rowCount === 0) {
      res.status(409).send("Failed to Update Password");
      return;
    }
    res.status(200).send("Update Password Successfully");
  } catch (error) {
    res.status(500).send("Internal Server Error \n" + error.message);
  } finally {
    client.release();
  }
};

// Export all functions
module.exports = {
  isLoggedIn,
  authLogin,
  authLogout,
  authRegister,
  authForgotPassword,
};

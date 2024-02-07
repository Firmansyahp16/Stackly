const pool = require("../configs/dbConfig");

// GET /log
const getAllLogs = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create searchTerm variable to store query parameter
  const searchTerm = req.query.q;
  // Create result variable to store query result
  let result;

  try {
    // If searchTerm is empty, select all logs from productLogs tables join products table
    if (!searchTerm) {
      result = await client.query(
        "SELECT productsLog.*, products.productName, products.productSize, products.productWeight, products.productColor FROM productsLog INNER JOIN products ON productsLog.productId = products.productId"
      );
    }
    // searchTerm is not empty, select all logs with searchTerm filtering
    else {
      result = await client.query(
        "SELECT productsLog.*, products.productName, products.productSize, products.productWeight, products.productColor FROM productsLog INNER JOIN products ON productsLog.productId = products.productId WHERE productsLog.dateTime::TEXT LIKE $1 OR LOWER(productsLog.logType::TEXT) LIKE $2 OR LOWER(products.productName::TEXT) LIKE LOWER($3) OR LOWER(products.productSize::TEXT) LIKE LOWER($4) OR LOWER(products.productWeight::TEXT) LIKE LOWER($5) OR LOWER(products.productColor::TEXT) LIKE LOWER($6)",
        [
          `%${searchTerm}%`,
          `%${searchTerm}%`,
          `%${searchTerm}%`,
          `%${searchTerm}%`,
          `%${searchTerm}%`,
          `%${searchTerm}%`,
        ]
      );
    }

    // If result is empty, send 404 Not Found
    if (result.rowCount === 0) {
      res.sendStatus(404);
      return;
    }

    // result is not empty, send result
    res.send(result.rows);
  } catch (error) {
    // Error handler
    res.send(error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

// GEt /log/:id
const getOneLog = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter
  const id = req.params.id;

  try {
    // Select all from productsLog join products that have specified id
    const result = await client.query(
      "SELECT productsLog.*, products.productName, products.productSize, products.productWeight, products.productColor FROM productsLog INNER JOIN products ON productsLog.productId = products.productId WHERE productsLog.logId=$1",
      [id]
    );

    // If result is empty, send 404
    if (result.rowCount === 0) {
      res.sendStatus(404);
      return;
    }

    // result is not empty, send result
    res.send(result.rows);
  } catch (error) {
    // Error handler
    res.send(error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

// POST /log
const newLog = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Store parameters from req body
  const { productId, logType, quantity, dateTime } = req.body;

  try {
    // Insert new data to productsLog table
    const result = await client.query(
      "INSERT INTO productsLog (productId, logType, quantity, dateTime) VALUES ($1, $2, $3, $4) returning *",
      [productId, logType, quantity, dateTime]
    );

    // If result is empty, send 500
    if (result.rowCount === 0) {
      res.sendStatus(500);
      return;
    }

    // result is not empty, send 200
    res.send(result.rows);
  } catch (error) {
    // Error handler
    res.send(error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

// PUT /product/:id
const updateLog = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter
  const id = req.params.id;
  // Store parameters from req body
  const { productId, logType, quantity, dateTime } = req.body;

  try {
    // Select log with specified id
    const oldLog = await client.query(
      "SELECT * FROM productsLog WHERE logId=$1",
      [id]
    );

    // If oldLog is empty, send 404
    if (oldLog.rowCount === 0) {
      res.sendStatus(404);
      return;
    }

    // oldLog is not empty, update log's data
    const updated = await client.query(
      "UPDATE productsLog SET productId=$1, logType=$2, quantity=$3, dateTime=$4 WHERE logId=$5 returning *",
      [productId, logType, quantity, dateTime, id]
    );

    // If updated is empty, send 500
    if (updated.rowCount === 0) {
      res.sendStatus(500);
      return;
    }

    // updated is not empty, send updated
    res.send(updated.rows);
  } catch (error) {
    // Error handler
    res.send(error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

// DELETE /log/:id
const deleteLog = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter
  const id = req.params.id;

  try {
    // Select log with specified id
    const log = await client.query("SELECT * FROM productsLog WHERE logId=$1", [
      id,
    ]);

    // If log is empty, send 404
    if (log.rowCount === 0) {
      res.sendStatus(404);
      return;
    }

    // log is not empty, delete log's data
    const deleted = await client.query(
      "DELETE FROM productsLog WHERE logId=$1",
      [id]
    );

    // If deleted is empty, return 500
    if (deleted.rowCount === 0) {
      res.sendStatus(500);
      return;
    }

    // deleted is not empty, send 200
    res.sendStatus(200);
  } catch (error) {
    // Error handler
    res.send(error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

module.exports = {
  getAllLogs,
  getOneLog,
  newLog,
  updateLog,
  deleteLog,
};

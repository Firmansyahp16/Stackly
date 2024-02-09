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
    // Store the query and the params
    let query =
      "SELECT productsLog.*, products.productName, products.productSize, products.productWeight, products.productColor FROM productsLog INNER JOIN products ON productsLog.productId = products.productId";
    let params = [];

    // If searchTerm is not empty, update the query and the params
    if (searchTerm) {
      query +=
        "WHERE productsLog.dateTime::TEXT LIKE $1 OR LOWER(productsLog.logType::TEXT) LIKE $2 OR LOWER(products.productName::TEXT) LIKE LOWER($3) OR LOWER(products.productSize::TEXT) LIKE LOWER($4) OR LOWER(products.productWeight::TEXT) LIKE LOWER($5) OR LOWER(products.productColor::TEXT) LIKE LOWER($6)";
      params = [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
      ];
    }

    // Select all logs from productsLog table
    result = await client.query(query, params);

    // If result is empty, send 404 Not Found
    if (result.rowCount === 0) {
      res.status(404).send("Logs is Empty");
      return;
    }

    // result is not empty, send result
    res.status(200).send(result.rows);
  } catch (error) {
    // Error handler
    res.status(500).send("Internal Server Error \n" + error.message);
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

    // If result is empty, send 404 Not Found
    if (result.rowCount === 0) {
      res.status(404).send("Log Not Found");
      return;
    }

    // result is not empty, send result
    res.status(200).send(result.rows);
  } catch (error) {
    // Error handler
    res.status(500).send("Internal Server Error \n" + error.message);
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

    // If result is empty, send 409
    if (result.rowCount === 0) {
      res.status(409).send("Failed to Insert New Log");
      return;
    }

    // result is not empty, send result
    res.status(200).send(result.rows);
  } catch (error) {
    // Error handler
    res.status(500).send("Internal Server Error \n" + error.message);
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
    // Update log's data
    const updated = await client.query(
      "UPDATE productsLog SET productId=$1, logType=$2, quantity=$3, dateTime=$4 WHERE logId=$5 returning *",
      [productId, logType, quantity, dateTime, id]
    );

    // If updated is empty, send 409
    if (updated.rowCount === 0) {
      res.status(409).send("Failed to Update Log's Data");
      return;
    }

    // updated is not empty, send updated
    res.status(200).send(updated.rows);
  } catch (error) {
    // Error handler
    res.status(500).send("Internal Server Error \n" + error.message);
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
    // Delete log's data
    const deleted = await client.query(
      "DELETE FROM productsLog WHERE logId=$1 returning *",
      [id]
    );

    // If deleted is empty, send 404
    if (deleted.rowCount === 0) {
      res.status(404).send("Failed to Delete Log's, Log's Not Found");
      return;
    }

    // deleted is not empty, send 200
    res.sendStatus(200);
  } catch (error) {
    // Error handler
    res.status(500).send("Internal Server Error \n" + error.message);
  } finally {
    // Release the connection
    client.release();
  }
};

// Export all controllers
module.exports = {
  getAllLogs,
  getOneLog,
  newLog,
  updateLog,
  deleteLog,
};

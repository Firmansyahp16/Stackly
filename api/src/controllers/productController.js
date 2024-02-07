const pool = require("../configs/dbConfig");

// GET /product
const getAllProducts = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create searchTerm variable to store query parameter
  const searchTerm = req.query.q;
  // Create result variable to store query result
  let result;

  try {
    // If searchTerm is empty,  select all products from products table
    if (!searchTerm) {
      result = await client.query("SELECT * FROM products");
    }
    // searchTerm is not empty,  select all products with searchTerm filtering
    else {
      result = await client.query(
        "SELECT * FROM products WHERE LOWER(productName) LIKE LOWER($1) OR productWeight::TEXT LIKE $2 OR productColor::TEXT LIKE $3 OR productQuantity::TEXT LIKE $4",
        [
          `%${searchTerm}%`,
          `%${searchTerm}%`,
          `%${searchTerm}%`,
          `%${searchTerm}`,
        ]
      );
    }

    // If result is empty or result.rows.length is equal to 0,  send 404 Not Found
    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    // result is not empty,  send 200 with result
    res.status(200).send(result.rows);

    // Error handler
  } catch (error) {
    res.status(500).send(error.message);

    // Release the connection
  } finally {
    client.release();
  }
};

// GET /product/:id
const getOneProduct = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter
  const id = req.params.id;

  try {
    // Select product from products table that have productId is equal to id
    const result = await client.query(
      "SELECT * FROM products WHERE productId=$1",
      [id]
    );

    // If result is empty or result.rows.length is equal to 0,  send 404 Not Found
    if (result.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    // result is not empty,  send 200 with result
    res.status(200).send(result.rows[0]);

    // Error handler
  } catch (error) {
    res.status(500).send(error.message);

    // Release the connection
  } finally {
    client.release();
  }
};

// POST /product
const newProduct = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Store parameters from request body
  const {
    productName,
    productSize,
    productWeight,
    productColor,
    productQuantity,
  } = req.body;

  try {
    // Insert new data to products table
    const result = await client.query(
      "INSERT INTO products (productName, productSize, productWeight, productColor, productQuantity) VALUES ($1, $2, $3, $4, $5) returning *",
      [productName, productSize, productWeight, productColor, productQuantity]
    );

    // If result is empty or result.rows.length is equal to 0,  send 500 Failed to Insert New Product
    if (result.rows.length === 0) {
      res.status(500).send("Failed to Insert New Data");
      return;
    }

    // result is not empty,  send 200 with result
    res.status(200).send(result.rows[0]);

    // Error handler
  } catch (error) {
    res.status(500).send(error.message);

    // Release the connection
  } finally {
    client.release();
  }
};

// PUT /product/:id
const updateProduct = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter
  const id = req.params.id;
  // Store parameters from request body
  const {
    productName,
    productSize,
    productWeight,
    productColor,
    productQuantity,
  } = req.body;

  try {
    // Select product with specified Id
    const oldProduct = await client.query(
      "SELECT * FROM products WHERE productId=$1",
      [id]
    );

    // If oldProduct is empty or oldProduct.rows.length is equal to 0,  send 404 Not Found
    if (oldProduct.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    // oldProduct is not empty,  update product's data
    const updated = await client.query(
      "UPDATE products SET productName=$1, productSize=$2, productWeight=$3, productColor=$4, productQuantity=$5 WHERE productId=$6 returning *",
      [
        productName,
        productSize,
        productWeight,
        productColor,
        productQuantity,
        id,
      ]
    );

    // If updated is empty or updated.rows.length is equal to 0,  send 500 Failed to Update Product's Data
    if (updated.rows.length === 0) {
      res.status(500).send("Failed to Update Product's Data");
      return;
    }

    // updated is not empty,  send 200 with updated
    res.status(200).send(updated.rows);

    // Error handler
  } catch (error) {
    res.status(500).send(error.message);

    // Release the connection
  } finally {
    client.release();
  }
};

// DELETE /product/:id
const deleteProduct = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter
  const id = req.params.id;

  try {
    // Select product with specified Id
    const product = await client.query(
      "SELECT * FROM products WHERE productId=$1",
      [id]
    );

    // If product is empty or product.rows.length is equal to 0,  send 404 Product Not Found
    if (product.rows.length === 0) {
      res.sendStatus(404);
      return;
    }

    // product is not empty,  delete product from table
    const deleted = await client.query(
      "DELETE FROM products WHERE productId=$1 returning *",
      [id]
    );

    // If deleted.rowCount is equal to 0 or more than 1,  send 500
    if (deleted.rowCount === 0 || deleted.rowCount > 1) {
      res.sendStatus(500);
      return;
    }

    // deleted.rowCount is 1,  send 200
    res.status(200).send("Product Deleted Successfully");

    // Error handler
  } catch (error) {
    res.status(500).send(error.message);

    // Release the connection
  } finally {
    client.release();
  }
};

// Export all method
module.exports = {
  getAllProducts,
  getOneProduct,
  newProduct,
  updateProduct,
  deleteProduct,
};

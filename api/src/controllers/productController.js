const pool = require("../configs/dbConfig");

// GET /product
const getAllProducts = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create searchTerm variable to store query parameter
  const searchTerm = req.query.q;
  // Create category variable to store category parameter
  const category = req.query.category;
  // Create value variable to store value parameter and convert it to lowercase
  const value = req.query.value ? req.query.value.toLowerCase() : null;
  // Create sort variable to store sort parameter
  const sort = req.query.sort;
  // Create result variable to store query result
  let result;

  try {
    // Store the query and the params
    let query = `
      SELECT products.*, productsLog.dateTime 
      FROM products 
      LEFT JOIN productsLog ON products.productId = productsLog.productId
    `;
    let params = [];

    // If searchTerm is not empty, update the query and the params variable
    if (searchTerm) {
      query +=
        " WHERE LOWER(products.productName) LIKE LOWER($1) OR products.productWeight::TEXT LIKE $2 OR products.productColor::TEXT LIKE $3 OR products.productQuantity::TEXT LIKE $4";
      params = [
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
        `%${searchTerm}%`,
      ];
    }

    // If category and value are not empty, update the query and the params variable
    if (category && value) {
      if (params.length === 0) {
        query += " WHERE";
      } else {
        query += " AND";
      }

      // Construct the query to filter based on the specified category, allowing for case-insensitive comparison
      query += ` LOWER(product${
        category.charAt(0).toUpperCase() + category.slice(1)
      }) LIKE LOWER($${params.length + 1})`;

      // Push the parameter value to the params array, converting it to lowercase and adding wildcards for partial matching
      params.push(`%${value}%`);
    }

    // If sort parameter is provided and valid, and asc parameter is either "true" or "false", add sorting to the query
    if (
      sort &&
      ["stock", "time"].includes(sort) &&
      ["true", "false"].includes(req.query.asc)
    ) {
      // Construct the ORDER BY clause based on the sort and asc parameters
      query += ` ORDER BY ${
        sort === "stock" ? "products.productQuantity" : "productsLog.dateTime"
      } ${req.query.asc === "true" ? "asc" : "desc"}`;
    }

    // Select all products from products table
    result = await client.query(query, params);

    // If result is empty, send 404 Not Found
    if (result.rowCount === 0) {
      res.status(404).send("Products is Empty");
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

    // If result is empty, send 404 Not Found
    if (result.rowCount === 0) {
      res.status(404).send("Product Not Found");
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

    // If result is empty, send 409
    if (result.rowCount === 0) {
      res.status(409).send("Failed to Insert New Product");
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
    // Update product's data
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

    // If updated is empty, send 409
    if (updated.rowCount === 0) {
      res.status(409).send("Failed to Update Product's Data");
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

// DELETE /product/:id
const deleteProduct = async (req, res) => {
  // Create connection to DB
  const client = await pool.connect();
  // Create id variable to store id parameter
  const id = req.params.id;

  try {
    // Delete product from table
    const deleted = await client.query(
      "DELETE FROM products WHERE productId=$1 returning *",
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
  getAllProducts,
  getOneProduct,
  newProduct,
  updateProduct,
  deleteProduct,
};

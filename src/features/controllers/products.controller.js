import * as productsService from "../service/products.service.js";

const createProduct = async (req, res, next) => {
  try {
    const product = await productsService.createProduct(
      req.body,
      req.file?.buffer
    );
    res.status(201).json({
      status: 201,
      message: "Product created succesfuly",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const listOfProducts = async (req, res, next) => {
  try {
    const products = await productsService.listActiveProducts();
    res.status(200).json({
      status: 200,
      message: "These are all the products",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productsService.getProductById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      message: "Got the product",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productsService.updateProduct(
      req.params.id,
      req.body,
      req.file?.buffer
    );
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      message: `Updated product with id: ${req.params.id}`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProduct = async (req, res, next) => {
  try {
    const product = await productsService.deleteProduct(req.params.id);
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: "Product not found",
        data: null,
      });
    }
    res.status(200).json({
      status: 200,
      message: `Deleted product with id: ${req.params.id}`,
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export {
  createProduct,
  listOfProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};

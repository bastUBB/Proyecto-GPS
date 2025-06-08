import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error("Error fetching products:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const createProduct = async (req, res) => {
    const product = req.body;

    if (!product.name || !product.price || !product.image) {
        return res.status(400).json({ success: false, message: "Name, price, and image are required" });
    }

    const newProduct = new Product(product);

    try {
        await newProduct.save();
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        console.error("Error saving product:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

export const deleteProduct = async (req, res) => {
    const productId = req.params.id;

    if (mongoose.Types.ObjectId.isValid(productId) === false) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    try {
        await Product.findByIdAndDelete(productId);
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        res.status(404).json({ success: false, message: "Product not found" });
    }
}

export const updateProduct = async (req, res) => {
    const productId = req.params.id;
    const updatedProduct = req.body;

    if (mongoose.Types.ObjectId.isValid(productId) === false) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    if (!updatedProduct.name || !updatedProduct.price || !updatedProduct.image) {
        return res.status(400).json({ success: false, message: "Name, price, and image are required" });
    }

    try {
        const product = await Product.findByIdAndUpdate(productId, updatedProduct, { new: true });
        res.status(200).json({ success: true, data: product });
    } catch (error) {
        res.status(404).json({ success: false, message: "Product not found" });
    }
}
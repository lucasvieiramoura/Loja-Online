const { gql } = require('apollo-server-express');
const Product = require('../models/Product');

// 1. Definição dos Tipos
const typeDefs = gql`
    type Product {
        id: ID!
        name: String!
        description: String
        price: Float!
        stock: Int!
        category: String
        imageUrl: String
        createdAt: String
        updatedAt: String
    }
        
    type User {
        id: ID!
        name: String!
        email: String!
        role: String! ## ex: "admin", "customer"
        createdAt: String
    }

    type AuthPayload {
        token: String!
        user: User!
    }

        type Query {
        getProducts: [Product]
        getProduct(id: ID!): Product
        me: User!
    }

    type Mutation {
        createProduct(name: String!, description: String, price: Float!, stock: Int!, category: String, imageUrl: String): Product
        updateProduct(id: ID!, name: String, description: String, price: Float, stock: Int, category: String, imageUrl: String): Product
        deleteProduct(id: ID!): String!

        register(name: String!, email: String!, password: String!): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
    }
`;

// 2. Implementação dos Resolvers
const resolvers = {
    Query: {
        getProducts: async () => await Product.find(),
        getProduct: async (_, { id }) => await Product.findById(id),
    },
    Mutation: {
        createProduct: async (_, { id, ...updateData }) => {
            const product = new Product(updateData);
            return await product.save();
        },
        updateProduct: async (_, { id, ...updateData }) => {
            return await Product.findByIdAndUpdate(id, updateData, { new: true });
        },
        deleteProduct: async (_, { id }) => {
            await Product.findByIdAndDelete(id);
            return "Produto deletado com sucesso!";
            //return true;
        }
    }
};

module.exports = { typeDefs, resolvers };
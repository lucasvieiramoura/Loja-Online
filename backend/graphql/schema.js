const { gql } = require('apollo-server-express');
const Product = require('../models/Product');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

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

const authResolvers ={
    Mutation: {
        register: async (_, { name, email, password }, {models}) => {
            // 1. Verificar se o e-mail já exisite no banco
            const existingUser = await models.User.findOne({ email });
            if(existingUser) {
                throw new Error('E-mail já cadastrado!');
            }

            // 2. Criptografar a senha antes de salvar
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. Salvar no banco de dados 
            const newUser = await models.User.create(
                { 
                    name, 
                    email, 
                    password: hashedPassword, 
                    role: 'customer' // Padrão para novos usuários cadastrados
                }

            );

            // 4. Gerar token JWT
            const token = jwt.sign({ userId: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
            return { token, user: newUser };
        },

        login: async (_, { email, password }, { models }) => {
            // 1. Busca o usuário
            const user = await models.User.findOne({ email });
            if(!user) {
                throw new Error('E-mail ou senha inválidos!');
            }

            //2. Validar senha criptografada
            const isValid = await bcrypt.compare(password, user.password);
            if(!isValid) {
                throw new Error('E-mail ou senha inválidos!');
            }

            //3. Gerar token JWT
            const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
            return { token, user };
        }
    }
};



module.exports = { typeDefs, resolvers };
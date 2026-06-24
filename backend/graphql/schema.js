const { gql } = require('apollo-server-express');
const Product = require('../models/Product');
const User = require('../models/User');
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
        role: String!
        createdAt: String
    }

    type AuthPayload {
        token: String!
        user: User!
    }

        type Query {
        getProducts: [Product!]
        getProduct(id: ID!): Product
        me: User!
    }

    type OrderItem {
        productId: ID!
        quantity: Int!
        priceAtPurchase: Float!
    }

    type Order {
        id: ID!
        userId: ID!
        items: [OrderItem!]!
        total: Float!
        status: String!
        createdAt: String!
    }

    # Input usado para enviar a estrutura do carrinho de forma limpa
    input OrderItemInput {
        productId: ID!
        quantity: Int!
        priceAtPurchase: Float!
    }

    extend type Mutation {
        #Mutation que recebe o array de itens e calcula o checkout
        createOrder(items: [OrderItemInput!]!, total: FLoat!): Ordre!
    }

    type Mutation {
        createProduct(name: String!, description: String, price: Float!, stock: Int!, category: String, imageUrl: String): Product
        updateProduct(id: ID!, name: String, description: String, price: Float, stock: Int, category: String, imageUrl: String): Product
        deleteProduct(id: ID!): String!

        register(name: String!, email: String!, password: String!, createdAt: String): AuthPayload!
        login(email: String!, password: String!): AuthPayload!
    }
`;

// 2. Implementação dos Resolvers
const resolvers = {
    Query: {
        getProducts: async (_, __,{models}) => {
            try{;
            return await Product.find()
            } catch(error){
                throw new Error(`Erro ao buscar produtos: ${error.message}`);
            }
            
        },
        getProduct: async (_, { id }) => await Product.findById(id),
    },
    Mutation: {
        createProduct: async (_, { id, ...updateData },{models}) => {
            try {
                const newProduct = await models.Product.create({
                    name,
                    description,
                    price,
                    imageUrl,
                    category,
                    stock
                });
                return newProduct;
            }catch(error){
                throw new Error(`Erro ao criar produto: ${error.message}`);
            }
        },
        updateProduct: async (_, { id, ...updateData }) => {
            return await Product.findByIdAndUpdate(id, updateData, { new: true });
        },
        deleteProduct: async (_, { id }) => {
            await Product.findByIdAndDelete(id);
            return "Produto deletado com sucesso!";
            //return true;
        },       
        
        //Resolver de Users
        register: async (_, { name, email, password },{models}) => {
        try{
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
            // 💡 SEGURANÇA 1: Garanta que temos um ID válido em formato String
            const userIdStr = newUser._id ? newUser._id.toString() : newUser.id;

            // 4. Gerar token JWT
            const token = jwt.sign({ userId: userIdStr, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

            const resposta = 
             { token, 
                user: {
                    id: userIdStr, 
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            };
            

            return resposta;
            
            } catch (error) {
                // 🚨 ISSO AQUI VAI REVELAR O COIOTE:
                console.error("❌ ERRO INTERNO ENCONTRADO DENTRO DO CATCH:");
                console.error(error); 
                
                // Relança o erro para o GraphQL não tentar adivinhar a resposta
                throw new Error(`Falha no registro: ${error.message}`);
            }
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
        },

        createOrder: async (_, {items, total}, {models, req}) =>{
            // 💡 SEGURANÇA: Se você implementou o middleware de Auth ou passa o usuário via req.user:
            // const userId = req.user.id; 
            // Para fins de teste/desenvolvimento local, caso não tenha o middleware de contexto de Token ativo na requisição do Apollo:
            const userId = "65a1234567890123456789ab"; // Substitua pelo ID real do usuário dinâmico vindo do contexto do token se já configurado

            try{
                //1. Validar e atualizar o estoque físico de cada produto no MongoDB
                for( const item of items) {
                    const product = await models.Product.findById(item.productId);
                    if(!product) {
                        throw new Error(`Produto com ID ${item.productId} não foi localizado`);
                    }
                    if (product.stock < item.quantity) {
                        throw new Error(`Estoque insuficente para o produto: ${product.name}. Disponível: ${product.stock}`);
                    }

                    // Abata o estoque do produto decrementando a quantidade comprada
                    product.stock -= item.quantity;
                    await product.save();
                }

                //2. Grava a Ordem de Compra definitiva no banco
                const newOrder = await models.Order.create({
                    userId,
                    items,
                    total,
                    status: 'PENDING'
                });

                return newOrder;
            } catch (error) {
                throw new Error(`Falha ao processar checkout: ${error.message}`);
            }
        }

    }
};
/*
const authResolvers ={
    Mutation: {
        
        register: async (_, { name, email, password },{models}) => {
        try{
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
            // 💡 SEGURANÇA 1: Garanta que temos um ID válido em formato String
            const userIdStr = newUser._id ? newUser._id.toString() : newUser.id;

            // 4. Gerar token JWT
            const token = jwt.sign({ userId: userIdStr, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

            const testeResposta = {
            token: "token_de_teste_123",
            user: {
                id: "65a1234567890123456789ab", // Uma string de ID válida fictícia
                name: name,
                email: email,
                role: "customer"
            }
            };

            console.log("--> ENVIANDO DADOS DE TESTE:", testeResposta);
            return testeResposta;
           
            const resposta = 
             { token, 
                user: {
                    id: userIdStr, 
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role
                }
            };
            // Esse log vai nos mostrar no terminal exatamente o que o GraphQL vai receber
            console.log("➡️ Enviando para o GraphQL:", JSON.stringify(respostaFinal, null, 2));

            return resposta;
            ////
            } catch (error) {
                // 🚨 ISSO AQUI VAI REVELAR O COIOTE:
                console.error("❌ ERRO INTERNO ENCONTRADO DENTRO DO CATCH:");
                console.error(error); 
                
                // Relança o erro para o GraphQL não tentar adivinhar a resposta
                throw new Error(`Falha no registro: ${error.message}`);
            }
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
*/

module.exports = { typeDefs, resolvers };
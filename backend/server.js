require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const { typeDefs, resolvers } = require('./graphql/schema');
// 💡 IMPORTAÇÃO INDIVIDUAL DOS SEUS MODELOS:
const User = require('./models/User');
const Product = require('./models/Product');
const models = { User, Product };

async function startServer() {
    const app = express();
    app.use(cors());

    // Conexão Mongo DB 
    const monogoURI = process.env.MONGO_URI;
    await mongoose.connect(monogoURI);//, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB conectado com sucesso!');

    const server = new ApolloServer({ typeDefs, resolvers,
        context: ({ req }) => {
            return {
            req,
            models // <-- Garanta que ele está sendo passado aqui de forma limpa
            };
        },
        // Isso vai fazer o Apollo printar o erro real no terminal do VS Code em vez de mascarar
        /*
        formatError: (err) => {
            console.error("❌ ERRO CRÍTICO NO APOLLO SERVER:", err);
            return err;
        }
            */
    });
    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();
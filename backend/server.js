const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const { typeDefs, resolvers } = require('./graphql/schema');


async function startServer() {
    const app = express();
    app.use(cors());

    // Conexão Mongo DB 
    const monogoURI = process.env.MONGO_URI;
    await mongoose.connect(monogoURI);//, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB conectado com sucesso!');

    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    server.applyMiddleware({ app });

    const PORT = process.env.PORT || 4000;
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}${server.graphqlPath}`);
    });
}

startServer();
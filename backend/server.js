const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');
const { typeDefs, resolvers } = require('./graphql/schema');

async function startServer() {
    const app = express();
    app.use(cors());

    // Conexão Mongo DB 
    //MONGO_URI=mongodb://localhost:27017/todolist
    /*
      await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB coneteado com sucesso!');
    */
    const monogoURI = 'mongodb://localhost:27017/lojaOnline';
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
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import expressJwt from "express-jwt";
import jwt from "jsonwebtoken";
import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer, gql } from "apollo-server-core";
import fs from "fs";
import http from "http";
import { DataStore } from "notarealdb";

const store = new DataStore("./data");

async function startApolloServer(typeDefs, resolvers) {
  const jwtSecret = Buffer.from("Zn8Q5tyZ/G1MHltc4F/gTkVJMlrbKiZt", "base64");

  // Express
  const app = express();
  app.use(
    cors(),
    bodyParser.json(),
    expressJwt({
      secret: jwtSecret,
      credentialsRequired: false,
    })
  );

  app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const user = data.users.list().find((user) => user.email === email);
    if (!(user && user.password === password)) {
      res.sendStatus(401);
      return;
    }
    const token = jwt.sign({ sub: user.id }, jwtSecret);
    res.send({ token });
  });

  const httpServer = http.createServer(app);

  // Apollo
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({
      user: req.user && data.users.get(req.user.sub),
    }),
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql" });
  await new Promise((resolve) => httpServer.listen({ port: 9000 }, resolve));
  // await server.listen({port: 9000,});
  console.log(`🚀 Server ready at http://0.0.0.0${server.graphqlPath}`);
}

const typeDefs = gql(fs.readFileSync("./schema.graphql", { encoding: "utf8" }));

export const data = {
  companies: store.collection("companies"),
  jobs: store.collection("jobs"),
  users: store.collection("users"),
};

const resolvers = {
  Query: {
    company: (root, { id }) => data.companies.get(id),
    job: (root, args) => data.jobs.get(args.id),
    jobs: () => data.jobs.list(),
  },
  Mutation: {
    createJob: (root, { input }, {user}) => {
      // Check Auth
      if (!user) {
        throw new Error("Unauthorized");
      }
      const id = data.jobs.create({...input, companyId: user.companyId});
      return data.jobs.get(id);
    },
  },
  Company: {
    jobs: (company) => data.jobs.list().filter((job) => job.companyId === company.id),
  },

  Job: {
    company: (job) => data.companies.get(job.companyId),
  },
};

startApolloServer(typeDefs, resolvers);

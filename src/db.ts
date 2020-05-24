import { makeAugmentedSchema } from 'neo4j-graphql-js';
import neo4j  from 'neo4j-driver';
import { ApolloServer } from 'apollo-server';

import { dbUrl, dbUser, dbPass } from '../secrets.json';

const typeDefs = `
type Meme {
    text: String
	usedBy: [MemesUsed]
	creators: [User] @relation(name: "CREATED", direction: "IN")
	belongsTo: [MemeFamily] @relation(name: "BELONGS_TO", direction: "IN")
    created: DateTime
	context: Context
}
type Context {
	text: String
}
type MemeFamily {
	name: String
	memberMemes: [Meme] @relation(name: "BELONGS_TO", direction: "OUT")
}
type User {
    discordName: String
	alias: String
	memesUsed: [MemesUsed]
	created: [Meme] @relation(name: "CREATED", direction: "OUT")
}
type MemesUsed @relation(name: "USES") {
	from: User
	to: Meme
	count: Int
	lastUsed: DateTime
}
`;

const schema = makeAugmentedSchema({typeDefs});

const driver = neo4j.driver(
    dbUrl,
    neo4j.auth.basic(dbUser, dbPass)
);

const server = new ApolloServer({ schema, context: { driver } });

server.listen(3003, '0.0.0.0').then(({ url }) => {
  console.log(`GraphQL API ready at ${url}`);
});
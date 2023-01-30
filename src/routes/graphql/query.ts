import { FastifyInstance } from "fastify";
import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLObjectType } from "graphql";
import { GraphQLMemberType, GraphQLPost, GraphQLProfile, GraphQLUser } from "./types";

export const queryHandler = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      getUsers: {
        type: new GraphQLList(GraphQLUser),
        resolve: async (_, args: Array<String>, fastify: FastifyInstance) => {
          return fastify.db.users.findMany()
        },
      },
      getProfiles: {
        type: new GraphQLList(GraphQLProfile),
        resolve: async (_, args, fastify: FastifyInstance) => fastify.db.profiles.findMany(),
      },
      getPosts: {
        type: new GraphQLList(GraphQLPost),
        resolve: async (_, args, fastify: FastifyInstance) => fastify.db.posts.findMany(),
      },
      getMemberTypes: {
        type: new GraphQLList(GraphQLMemberType),
        resolve: async (_, args, fastify: FastifyInstance) => fastify.db.memberTypes.findMany(),
      },
      getUser: {
        type: GraphQLUser,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_, args, fastify: FastifyInstance) => {
          const user = fastify.db.users.findOne({
            key: "id",
            equals: args.id
          })
          if (!user) {
            throw fastify.httpErrors.notFound();
           }
           return user;
        },
      },
      getProfile: {
        type: GraphQLProfile,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_, args, fastify: FastifyInstance) => fastify.db.profiles.findOne({
          key: "id",
          equals: args.id
        }),
      },
      getPost: {
        type: GraphQLPost,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_, args, fastify: FastifyInstance) => fastify.db.posts.findOne({
          key: "id",
          equals: args.id
        }),
      },
      getMemberType: {
        type: GraphQLMemberType,
        args: {
          id: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_, args, fastify: FastifyInstance) => fastify.db.memberTypes.findOne({
          key: "id",
          equals: args.id
        }),
      },
    },
  });
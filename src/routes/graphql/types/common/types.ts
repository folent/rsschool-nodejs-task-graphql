import { FastifyInstance } from "fastify";
import { GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLOutputType, GraphQLString } from "graphql";

const GraphQLPost: GraphQLOutputType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        userId: { type: GraphQLID },

    })
})

const GraphQLMemberType: GraphQLOutputType = new GraphQLObjectType({
    name: 'MemberType',
    fields: () => ({
        id: { type: GraphQLID },
        discount: { type: GraphQLString },
        monthPostsLimit: { type: GraphQLString },
    })
})

const GraphQLProfile: GraphQLOutputType = new GraphQLObjectType({
    name: 'Profile',
    fields: () => ({
        id: { type: GraphQLID },
        avatar: { type: GraphQLString },
        sex: { type: GraphQLString },
        birthday: { type: GraphQLInt },
        country: { type: GraphQLString },
        street: { type: GraphQLString },
        city: { type: GraphQLString },
        memberTypeId: { type: GraphQLString },
        userId: { type: GraphQLID },
    })
})

const GraphQLUser: GraphQLOutputType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: { type: GraphQLID },
        firstName: { type: GraphQLString },
        lastName: { type: GraphQLString },
        email: { type: GraphQLString },
        subscribedToUserIds: { type: new GraphQLList(GraphQLString) },
        profile: {
            type: GraphQLProfile,
            resolve: async (parent, args, fastify: FastifyInstance) => fastify.db.profiles.findOne({
              key: 'userId',
              equals: parent.id,
            }),
          },
        posts: {
            type: new GraphQLList(GraphQLPost),
            resolve: async (parent, args, fastify: FastifyInstance) => fastify.db.posts.findMany({
                key: 'userId',
                equals: parent.id,
            }),
        },
        memberType: {
            type: GraphQLMemberType,
            resolve: async (parent, args, fastify: FastifyInstance) => {
                const profile = await fastify.db.profiles.findOne({ key: 'userId', equals: parent.id });

                if (!profile) {
                    return null;
                }

                return fastify.db.memberTypes.findOne({ key: 'id', equals: profile.memberTypeId });
            },
        },
        subscribedToUser: {
            type: new GraphQLList(GraphQLUser),
            resolve: async (parent, args: [], fastify: FastifyInstance) => Promise.all(
                parent.subscribedToUserIds.map(
                async (subscribedToUserId: string) => fastify.db.users.findOne({ key: 'id', equals: subscribedToUserId }),
                ),
            ),
        },
        userSubscribedTo: {
            type: new GraphQLList(GraphQLUser),
            resolve: async (parent, args: [], fastify: FastifyInstance) => fastify.db.users.findMany({
                key: 'subscribedToUserIds',
                inArray: parent.id,
            }),
        },
    })
})

export { GraphQLPost, GraphQLMemberType, GraphQLProfile, GraphQLUser }
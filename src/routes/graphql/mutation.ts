import { FastifyInstance } from "fastify";
import { GraphQLFloat, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { GraphQLMemberType, GraphQLPost, GraphQLProfile, GraphQLUser } from "./types";

const mutationHandler = new GraphQLObjectType({
    name: 'RootMutationType',
    fields: {
        addUser: {
            type: GraphQLUser,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                lastName: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                return fastify.db.users.create({ ...args })
            }
        },
        addProfile: {
            type: GraphQLProfile,
            args: {
                avatar: { type: new GraphQLNonNull(GraphQLString) },
                sex: { type: new GraphQLNonNull(GraphQLString) },
                birthday: { type: new GraphQLNonNull(GraphQLInt) },
                country: { type: new GraphQLNonNull(GraphQLString) },
                street: { type: new GraphQLNonNull(GraphQLString) },
                city: { type: new GraphQLNonNull(GraphQLString) },
                memberTypeId: { type: new GraphQLNonNull(GraphQLID) },
                userId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                return fastify.db.profiles.create({ ...args })
            }
        },
        addPost: {
            type: GraphQLPost,
            args: {
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) },
                userId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                return fastify.db.posts.create({ ...args })
            }
        },
        updateUser: {
            type: GraphQLUser,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                lastName: { type: new GraphQLNonNull(GraphQLString) },
                email: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                return fastify.db.users.change(args.id, { ...args })
            }
        },
        updateProfile: {
            type: GraphQLProfile,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                avatar: { type: new GraphQLNonNull(GraphQLString) },
                sex: { type: new GraphQLNonNull(GraphQLString) },
                birthday: { type: new GraphQLNonNull(GraphQLInt) },
                country: { type: new GraphQLNonNull(GraphQLString) },
                street: { type: new GraphQLNonNull(GraphQLString) },
                city: { type: new GraphQLNonNull(GraphQLString) },
                memberTypeId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                return fastify.db.profiles.change(args.id, { ...args })
            }
        },
        updatePost: {
            type: GraphQLPost,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                content: { type: new GraphQLNonNull(GraphQLString) }
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                return fastify.db.posts.change(args.id, { ...args })
            }
        },
        updateMemberType: {
            type: GraphQLMemberType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                discount: { type: new GraphQLNonNull(GraphQLFloat) },
                monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                return fastify.db.memberTypes.change(args.id, { ...args })
            }
        },
        subscribeTo: {
            type: GraphQLUser,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                subscribeToId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                if (args.id === args.subscribeToId) {
                    return fastify.httpErrors.badRequest("you can't subscribe to yourself");
                }

                const user = await fastify.db.users.findOne({
                    key: 'id',
                    equals: args.id
                })
                
                if (!user) {
                    return fastify.httpErrors.badRequest("user is not found");
                }

                const userForSubscribe = await fastify.db.users.findOne({
                    key: 'id',
                    equals: args.subscribeToId
                })

                if (!userForSubscribe) {
                    return fastify.httpErrors.badRequest("user is not found");
                }

                return fastify.db.users.change(args.id, {
                    subscribedToUserIds: [...user.subscribedToUserIds, args.subscribeToId]
                })
                
            }
        },
        unsubscribeFrom: {
            type: GraphQLUser,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                unsubscribeFromId: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: async (_, args, fastify: FastifyInstance) => {
                if (args.id === args.unsubscribeFromId) {
                    return fastify.httpErrors.badRequest("you can't unsubscribe from yourself");
                }

                const user = await fastify.db.users.findOne({
                    key: 'id',
                    equals: args.id
                })
                
                if (!user) {
                    return fastify.httpErrors.badRequest("user is not found");
                }

                const userForSubscribe = await fastify.db.users.findOne({
                    key: 'id',
                    equals: args.unsubscribeFromId
                })

                if (!userForSubscribe) {
                    return fastify.httpErrors.badRequest("user is not found");
                }

                return fastify.db.users.change(args.id, {
                    subscribedToUserIds: [...user.subscribedToUserIds.filter((id: string) => id !== args.unsubscribeFromId)]
                })
                
            }
        }
    }
})

export { mutationHandler }
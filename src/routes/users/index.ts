import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from './schemas';
import type { UserEntity } from '../../utils/DB/entities/DBUsers';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<UserEntity[]> {

    return fastify.db.users.findMany();
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
				key: 'id',
				equals: request.params.id,
			});

		if (!user) {
		 throw fastify.httpErrors.notFound();
		}
		return user;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const newUser = await fastify.db.users.create({ ...request.body });
    
	  return newUser;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
		const user = await fastify.db.users.findOne({ key: 'id', equals: request.params.id });

		if (user === null) {
		  throw fastify.httpErrors.badRequest();
		}
  
		const userPosts = await fastify.db.posts.findMany({ 
			key: 'userId',
		 	equals: request.params.id 
		});
  
		await Promise.all(
		  userPosts.map(async (post) => {
			await fastify.db.posts.delete(post.id);
		  }),
		);
  
		const userProfile = await fastify.db.profiles.findOne({ key: 'userId', equals: request.params.id });
  
		if (userProfile !== null) {
		  await fastify.db.profiles.delete(userProfile.id);
		}
  
		const subscribes = await fastify.db.users.findMany({ key: 'subscribedToUserIds', inArray: request.params.id });
  
		await Promise.all(
			subscribes.map(async (sub) => {
			const subIdx = sub.subscribedToUserIds.indexOf(request.params.id);
  
			sub.subscribedToUserIds.splice(subIdx, 1);
  
			await fastify.db.users.change(sub.id, { subscribedToUserIds: sub.subscribedToUserIds });
		  }),
		);

  
		return fastify.db.users.delete(request.params.id);
    }
  );

  fastify.post(
    '/:id/subscribeTo',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const subscribeToUser = await fastify.db.users.findOne({
			key: 'id',
			equals: request.params.id,
		});

		if (subscribeToUser === null) {
			throw fastify.httpErrors.badRequest();
		}

		const user = await fastify.db.users.findOne({
			key: 'id',
			equals: request.body.userId,
		});
		if (user === null) {
			throw fastify.httpErrors.badRequest();
		}

		if (user.subscribedToUserIds.includes(subscribeToUser.id)) {
			throw fastify.httpErrors.badRequest();
		}

		return fastify.db.users.change(request.body.userId, {
			subscribedToUserIds: [...user.subscribedToUserIds, subscribeToUser.id]
		});
    }
  );

  fastify.post(
    '/:id/unsubscribeFrom',
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
		const unsubscribeFromUser = await fastify.db.users.findOne({
			key: 'id',
			equals: request.params.id,
		});

		if (unsubscribeFromUser === null) {
			throw fastify.httpErrors.notFound();
		}
		const user = await fastify.db.users.findOne({
			key: 'id',
			equals: request.body.userId,
		});
		if (user === null) {
			throw fastify.httpErrors.badRequest();
		}

		if (!user.subscribedToUserIds.includes(unsubscribeFromUser.id)) {
			throw fastify.httpErrors.badRequest();
		}

		return fastify.db.users.change(user.id, {
			subscribedToUserIds: user.subscribedToUserIds.filter(
				(userId) => userId !== unsubscribeFromUser.id
			),
		});
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
			key: 'id',
			equals: request.params.id,
		});
		if (user === null) {
			throw fastify.httpErrors.badRequest();
		}

		return fastify.db.users.change(
			request.params.id,
			request.body
		);
    }
  );
};

export default plugin;

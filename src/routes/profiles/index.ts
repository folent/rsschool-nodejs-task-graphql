import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createProfileBodySchema, changeProfileBodySchema } from './schema';
import type { ProfileEntity } from '../../utils/DB/entities/DBProfiles';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<
    ProfileEntity[]
  > {
    return fastify.db.profiles.findMany()
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({
				key: 'id',
				equals: request.params.id,
			});
			if (profile === null) {
				throw fastify.httpErrors.notFound();
			}
			return profile;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.users.findOne({
				key: 'id',
				equals: request.body.userId,
			});
			if (profile === null) {
				throw fastify.httpErrors.badRequest();
			}
			const isExistsUser = await fastify.db.profiles.findOne({
				key: 'userId',
				equals: request.body.userId,
			});

			if (isExistsUser !== null) {
				throw fastify.httpErrors.badRequest();
			}

			const mType = await fastify.db.memberTypes.findOne({
				key: 'id',
				equals: request.body.memberTypeId,
			});

			if (mType === null) {
				throw fastify.httpErrors.badRequest();
			}

			return fastify.db.profiles.create({ ...request.body });
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({
				key: 'id',
				equals: request.params.id,
			});
			if (profile === null) {
				throw fastify.httpErrors.badRequest();
			}
			return fastify.db.profiles.delete(profile.id);
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({
				key: 'id',
				equals: request.params.id,
			});
			if (profile === null) {
				throw fastify.httpErrors.badRequest();
			}
			const result = await fastify.db.profiles.change(
				request.params.id,
				{ ...request.body }
			);
			return result;
    }
  );
};

export default plugin;

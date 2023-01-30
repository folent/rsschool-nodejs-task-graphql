import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphql, GraphQLSchema, parse, validate } from 'graphql';
import depthLimit = require('graphql-depth-limit');
import { mutationHandler } from './mutation';
import { queryHandler } from './query';
import { graphqlBodySchema } from './schema';

const DEPTH_LIMIT = 7

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      }
    },
    async function (request, reply) {
      const { query, variables } = request.body;

      if (!query) {
        throw fastify.httpErrors.badRequest('query is undefined');
      }

      const schema = new GraphQLSchema({
        query: queryHandler,
        mutation: mutationHandler,
      });
      const errors = validate(schema, parse(String(query)), [depthLimit(DEPTH_LIMIT)]);

      if (errors.length > 0) {
        const result = {
          errors: errors,
          data: 'Error, DEPTH LIMIT',
        };

        return result;
      }

      return await graphql({
        schema,
        source: String(query),
        variableValues: variables,
        contextValue: fastify
      });
    }
  );
};

export default plugin;

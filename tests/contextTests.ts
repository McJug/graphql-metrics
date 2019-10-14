import { GraphQLString, GraphQLObjectType, GraphQLSchema, graphqlSync } from "graphql";
import { expect, should } from "chai";
import { IGraphQLMetricEnabledContext, enableGraphGLMetrics } from "../src/index";

describe("Context Tests", () => {
  let gqlSchema: GraphQLSchema;

  before(() => {
    const queryType = new GraphQLObjectType({
      name: "Query",
      fields: {
        hello: {
          type: GraphQLString,
          resolve: () => {
            return "Hello, World!";
          },
        },
      },
    });
    gqlSchema = enableGraphGLMetrics( new GraphQLSchema({ query: queryType }) );
  });

  describe("Executing GraphQL Query", () => {
    it("Without context should not error", () => {
      const result = graphqlSync(gqlSchema, `
        query {
          hello
        }
      `);
      should().exist(result);
    });
    it("With context without implementing metrics interface should not error and give metrics", () => {
      const context = {} as IGraphQLMetricEnabledContext;
      const result = graphqlSync(gqlSchema, `
        query {
          hello
        }
      `, undefined, context);
      should().exist(result);
      should().exist(context.metrics);
      expect(context.metrics.length).to.be.greaterThan(0);
    });
    it("With context implementing metrics interface should not error and give metrics", () => {
      const context = {
        metrics: [],
      };
      const result = graphqlSync(gqlSchema, `
        query {
          hello
        }
      `, undefined, context);
      should().exist(result);
      should().exist(context.metrics);
      expect(context.metrics.length).to.be.greaterThan(0);
    });
  });
});

import { GraphQLString, GraphQLObjectType, GraphQLSchema, graphqlSync } from "graphql";
import { expect, should } from "chai";
import { IGraphQLMetricEnabledContext, enableGraphGLMetrics } from "../src/index";

describe("Error Tests", () => {
  let gqlSchema: GraphQLSchema;

  before(() => {
    const queryType = new GraphQLObjectType({
      name: "Query",
      fields: {
        hello: {
          type: GraphQLString,
          resolve: () => {
            throw new Error("Example Error");
          },
        },
      },
    });
    gqlSchema = enableGraphGLMetrics( new GraphQLSchema({ query: queryType }) );
  });

  describe("Executing GraphQL Query", () => {
    it("That throws error should still throw error", () => {
      const context = {} as IGraphQLMetricEnabledContext;
      const result = graphqlSync(gqlSchema, `
        query {
          hello
        }
      `, undefined, context);
      should().exist(result);
      should().exist(context.metrics);
      should().exist(result.errors);
      expect(result.errors.length).to.be.greaterThan(0);
    });
    it("That throws error should still record Metrics", () => {
      const context = {} as IGraphQLMetricEnabledContext;
      const result = graphqlSync(gqlSchema, `
        query {
          hello
        }
      `, undefined, context);
      should().exist(result);
      should().exist(context.metrics);
      should().exist(result.errors);
      expect(result.errors.length).to.be.greaterThan(0);
      expect(context.metrics.length).to.be.greaterThan(0);
    });
    it("That throws error should record error in Metric", () => {
      const context = {} as IGraphQLMetricEnabledContext;
      const result = graphqlSync(gqlSchema, `
        query {
          hello
        }
      `, undefined, context);
      should().exist(result);
      should().exist(context.metrics);
      should().exist(result.errors);
      expect(result.errors.length).to.be.greaterThan(0);
      expect(context.metrics.length).to.be.greaterThan(0);
      should().exist(context.metrics[0].error);
    });
  });
});

import { GraphQLSchema, GraphQLFieldMap, GraphQLResolveInfo } from "graphql";
import { performance } from "perf_hooks";
import { GraphQLMetricData } from "./graphqlMetricData";
import { Path } from "graphql/jsutils/Path";
import { IGraphQLMetricEnabledContext } from "./graphqlMetricEnabledContext";

export const enableGraphGLMetrics = (schema: GraphQLSchema): GraphQLSchema => {
    setMetricsOnAllSchemaTypes(schema);

    return schema;
};

const setMetricsOnGraphQLFieldMap = (fieldMap: GraphQLFieldMap<any, any>): void => {
    const queryTypeFieldKeys = Object.keys(fieldMap);

    queryTypeFieldKeys.forEach((queryTypeFieldKey: string) => {
        const queryTypeField = fieldMap[queryTypeFieldKey];

        const originalResolveMethod = queryTypeField.resolve;
        queryTypeField.resolve = (
            source: any,
            args: any,
            context: IGraphQLMetricEnabledContext,
            info: GraphQLResolveInfo) => {
            let originalResolveResult;
            let error;
            const timeBefore = performance.now();
            try {
                originalResolveResult = originalResolveMethod(source, args, context, info);
            } catch (ex) {
                error = ex;
            }

            const timeAfter = performance.now();
            const timeTakenForResolving = timeAfter - timeBefore;
            const metric = new GraphQLMetricData(
                extractResolverPath(info.path),
                error === undefined,
                timeTakenForResolving,
                error);

            addMetrics(context, metric);

            if (error) {
                throw error;
            }

            return originalResolveResult;
        };
    });
};

const extractResolverPath = (path: Path): string => {
    if (path.prev) {
        return `${extractResolverPath(path.prev)}/${path.key}`;
    }
    return `${path.key}`;
};

const addMetrics = (context: IGraphQLMetricEnabledContext, metric: GraphQLMetricData): void => {
    if (!context.metrics) {
        context.metrics = [];
    }
    context.metrics.push(metric);
};

const setMetricsOnAllSchemaTypes = (schema: GraphQLSchema): void => {
    const typeMap = schema.getTypeMap();
    const types = Object.keys(typeMap);
    types.forEach((type: string) => {
        const namedGraphType: any = schema.getType(type);
        if (namedGraphType.getFields) {
            const namedGraphTypeFieldMap = namedGraphType.getFields() as GraphQLFieldMap<any, any>;
            setMetricsOnGraphQLFieldMap(namedGraphTypeFieldMap);
        }
    });
};

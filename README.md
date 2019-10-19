# graphql-metrics

GraphQL Metrics modifies an existing GraphQLSchema to allow the developer to collect performance metrics of all GraphQL Resolver functions.
Metrics can be extracted from the GraphQL Context and logged anywhere the developer wishes.

## Installation

Installation is as easy as:

```
npm i graphql-metrics
```

graphql-metrics has a dependency on the graphql library.

graphql-metrics has been tested on graphql version 14.5.8.

## Usage

To start capturing metrics call enableGraphGLMetrics and pass it your GraphQLSchema:

```
const graphQlSchema: GraphQLSchema = enableGraphGLMetrics (
  new GraphQLSchema({
    ...,
  });
);
```

After execution GraphQL Metrics can be extracted from the GraphQL Context:

```
const gqlSchema: GraphQLSchema = enableGraphGLMetrics ( ... );
const context: IGraphQLMetricEnabledContext = {
  ...,
  metrics: [],
};

const result = await graphql(gqlSchema, ..., ..., context);

// context.metrics contains an array of Metrics from execution
```

If a resolver throws an error partial metrics can still be recovered including the error that was thrown:

```
const result = await graphql(gqlSchema, ..., ..., context);
// context.metrics[indexToFailedResolver].error contains the error thrown inside that resolver
```


## Example

Considering this Schema:

```
const queryType = new GraphQLObjectType({
  name: "Query",
  fields: {
    order: {
      type: orderType,
      args: {
        id: { type: GraphQLString },
      },
      resolve: (_, { id }) => {
        return someCodeToGetOrder(id);
      },
    },
  },
});

const orderType = new GraphQLObjectType({
  name: "Order",
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => getOrderId(),
    },
    retailerId: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => getRetailerId(),
    },
    orderLines: {
      type: new GraphQLNonNull(new GraphQLList(orderLineType)),
      resolve: (order) => getOrderLines(),
    },
  },
});

const orderLineType = new GraphQLObjectType({
  name: "OrderLine",
  fields: {
    productId: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (orderLine) => getProductId(),
    },
    quantity: {
      type: new GraphQLNonNull(GraphQLInt),
      resolve: (orderLine) => getQuantity(),
    },
  },
});
```

We could generate these example metrics:
(As orderLiens is an array the resolver path will show the index into the array of the item being resolved)

```
[
  GraphQLMetricData {
    resolverPath: 'order',
    success: true,
    durationMilliseconds: 0.05962499976158142,
    error: undefined },
  GraphQLMetricData {
    resolverPath: 'order/id',
    success: true,
    durationMilliseconds: 0.02204899489879608,
    error: undefined },
  GraphQLMetricData {
    resolverPath: 'order/orderLines',
    success: true,
    durationMilliseconds: 0.01929599791765213,
    error: undefined },
  GraphQLMetricData {
    resolverPath: 'order/orderLines/0/productId',
    success: true,
    durationMilliseconds: 0.033233001828193665,
    error: undefined },
  GraphQLMetricData {
    resolverPath: 'order/orderLines/0/quantity',
    success: true,
    durationMilliseconds: 0.01434200257062912,
    error: undefined },
  GraphQLMetricData {
    resolverPath: 'order/orderLines/1/productId',
    success: true,
    durationMilliseconds: 0.0017090067267417908,
    error: undefined },
  GraphQLMetricData {
    resolverPath: 'order/orderLines/1/quantity',
    success: true,
    durationMilliseconds: 0.0014280006289482117,
    error: undefined },
]
```

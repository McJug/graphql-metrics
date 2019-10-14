export class GraphQLMetricData {
    constructor(
        public resolverPath: string,
        public success: boolean,
        public durationMilliseconds: number,
        public error: any,
    ) {}
}

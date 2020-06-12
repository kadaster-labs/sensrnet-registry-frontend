export class sensorInfo {
    constructor(
        public name: string,
        public typeName: Array<string>,
        public active: boolean,
        public aim: string,
        public description: string,
        public manufacturer: string,
        public theme?: Array<string>,
        public typeDetails?: Array<object>,
        public dataStreams?: Array<any>,
    )
    {}
}

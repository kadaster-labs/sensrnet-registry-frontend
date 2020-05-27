export class Sensor {
    constructor(
        public name: string,
        public aim: string,
        public description: string,
        public manufacturer: string,
        public active: boolean,
        public documentation: URL,
        public dataStream: DataStream[],
        public location: Location
    ) { }
}

export class DataStream {
    constructor(
        public name: string,
        public description: string,
        public unitOfMeasurment: string,
        public isPublic: boolean,
        public isOpenData: boolean,
        public isReusable: boolean,
        public documentation: URL,
        public datalink: URL,
        public dataFrequency: number,
        public dataQuality: number
    ) { }
}

export class Location {
    constructor(
        public x: number,
        public y: number,
        public z: number,
    ) {}
}



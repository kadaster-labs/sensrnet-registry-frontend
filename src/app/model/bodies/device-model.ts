export interface IDatastream {
    _id: string;
    sensorId: string;
    name: string;
    description?: string;
    unitOfMeasurement?: Record<string, any>;
    observationArea?: Record<string, any>;
    theme?: string[];
    dataQuality?: string;
    isActive?: boolean;
    isPublic?: boolean;
    isOpenData?: boolean;
    containsPersonalInfoData?: boolean;
    isReusable?: boolean;
    documentation?: string;
    dataLink?: string;
    observationGoalIds?: string[];
}

export interface ISensor {
    _id: string;
    name: string;
    description?: string;
    type?: string;
    manufacturer?: string;
    supplier?: string;
    documentation?: string;
}

export interface ILocationDetails {
    _id?: string;
    name?: string;
    description?: string;
}

export interface IDevice {
    _id?: string;
    name: string;
    description?: string;
    category?: string;
    connectivity?: string;
    locationDetails?: ILocationDetails;
    location?: {
        type: string;
        coordinates: number[];
    };
    sensors?: ISensor[];
    datastreams?: IDatastream[];
    canEdit?: boolean;
}

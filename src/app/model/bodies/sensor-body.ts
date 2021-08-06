import { ISensorLocation } from './location';

export interface ISensor {
    _id: string;
    nodeId: string;
    organizations?: Array<Record<string, string>>;
    name?: string;
    location: ISensorLocation;
    baseObjectId?: string;
    datastreams?: Array<any>;
    aim?: string;
    description?: string;
    manufacturer?: string;
    active: boolean;
    observationArea?: Record<string, unknown>;
    documentationUrl?: string;
    theme?: Array<string>;
    category: string;
    typeName: string;
    typeDetails?: Record<string, any>;
}

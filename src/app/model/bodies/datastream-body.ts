export interface IDatastream {
    datastreamId?: string;
    name?: string;
    reason?: string;
    description?: string;
    observedProperty?: string;
    unitOfMeasurement?: string;
    isPublic?: boolean;
    isOpenData?: boolean;
    isReusable?: boolean;
    documentationUrl?: string;
    dataLink?: string;
    dataFrequency?: number;
    dataQuality?: number;
}

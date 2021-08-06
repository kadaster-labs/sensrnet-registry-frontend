export interface IContactDetails {
    _id?: string;
    name?: string;
    email?: string;
    phone?: string;
}

export interface ILegalEntity {
    _id?: string;
    name: string;
    website?: string;
    contactDetails?: IContactDetails[];
}

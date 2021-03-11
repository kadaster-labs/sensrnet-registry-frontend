export class LegalEntity {
  constructor(
    public id?: string,
    public website?: string,
    public contactName?: string,
    public contactEmail?: string,
    public contactPhone?: string,
  ) { }
}

export interface IContactDetails extends Document {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  isPublic: boolean;
}

export interface ILegalEntity {
  _id: string;
  name: string;
  website?: string;
  originSync?: string;
  contactDetails?: IContactDetails[];
}

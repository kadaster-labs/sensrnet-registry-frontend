import { Sensor } from './sensor';

export class Owner {
    constructor(
        public organisationName: string,
        public website: URL,
        public contactDetails: ContactDetails,
        public sensors: Sensor[],
        public users: User[]
    ) { }
}

export class ContactDetails {
    constructor(
        public name: string,
        public email: string,
        public phone: string,
    ) { }
}

export class User {
    constructor(
        public socialId: string,
        public username: string,
        public email: string,
        public role: string
    ){}
}

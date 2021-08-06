export class UserUpdateBody {
    constructor(public password?: string, public legalEntityId?: string, public leaveLegalEntity?: boolean) {}
}

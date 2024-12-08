import { Profile } from "passport"
import db from "../services/db"
import ApiError, { ApiErrorCode } from "../api-error"

export interface User {
    id: string,
    name: string,
    email: string,
    picture?: string
}

export default class UserService {

    private allowedEmails: string[] = process.env.ALLOWED_EMAILS?.split(',') ?? []

    public validateUserAllowed(profile: Profile) {
        const filtered = profile.emails
            ?.map(e => e.value)
            .filter(e => this.allowedEmails.includes(e))
            ?? []
        if (filtered?.length <= 0) {
            throw new ApiError(403, ApiErrorCode.NOT_ALLOWED, "You are logged in. But your email is not allowed. Please contact Abhay Jatin Doshi.")
        }
    }

    public async getUser(id: string): Promise<User | undefined> {
        return await db.fetchOne`select * from users where id = ${id}`
    }

    public async createUserIfNotExists(profile: Profile): Promise<User> {
        let user = await this.getUser(profile.id);
        if (user) return user;
        if (!profile.emails || profile.emails.length <= 0) {
            throw new Error('User not allowed without an email id.');
        }
        if (!profile.photos || profile.photos.length <= 0) {
            profile.photos = [{ value: '' }]
        }

        const rows = await db.execute`insert into users values (
            ${profile.id}, ${profile.displayName},
            ${profile.emails[0].value},
            ${profile.photos[0].value}
        )`

        if (rows != 1) {
            throw new Error('Failed to insert row.');
        }

        user = await this.getUser(profile.id);
        return user!;
    }
}
import { Profile } from "passport"
import db from "../services/db"
import ApiError, { ApiErrorCode } from "../api-error"
import { cryptoRandomId } from "../server-utils";

export interface User {
    id: string,
    user_id: string,
    name: string,
    email: string,
    picture?: string
}

export default new class UserService {

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

    public async getUser(emailId: string): Promise<User | undefined> {
        return await db.fetchOne`select * from users where email = ${emailId}`
    }

    public async createUserByEmailIfNotExists(email: string): Promise<User> {
        let user = await this.getUser(email);
        if (user) {
            return user;
        }

        const rows = await db.execute`insert into users (id, email) values (${cryptoRandomId()},${email})`

        if (rows != 1) {
            throw new Error('Failed to insert row.');
        }

        user = await this.getUser(email);
        return user!;
    }

    public async createUserIfNotExists(profile: Profile): Promise<User> {
        if (!profile.photos || profile.photos.length <= 0) {
            profile.photos = [{ value: '' }]
        }

        if (!profile.emails || profile.emails.length <= 0) {
            throw new Error('User not allowed without an email id.');
        }

        const emailId = profile.emails[0].value;
        let user = await this.createUserByEmailIfNotExists(emailId);
        if (user.user_id) return user;
        
        const rows = await db.execute`update users set 
            user_id = ${profile.id}, 
            name = ${profile.displayName}, 
            picture = ${profile.photos[0].value} 
            where email = ${emailId}`
        if (rows != 1) {
            throw new Error('Failed to update row.');
        }

        return await this.getUser(emailId) as User;
    }
}();
import { profileApiUrl, loginUrl } from "../constants";
import { User } from "./entities/User";

class UserService {

  async loadCurrentUser(): Promise<User | undefined> {
    const userResponse = await fetch(profileApiUrl).then(res => res.json());
    if ((userResponse as { code: string }).code === 'UNAUTHORIZED') {
      window.location.href = loginUrl;
      return;
    }
    return userResponse as User;
  }
}

const userService = new UserService();
export default userService;
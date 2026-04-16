import { axios, logger } from "@/utils";
import { APIResponse } from "@/utils/apiResponse";
import { SigninRequest, SignupRequest, User } from "./schema";

class AuthService {
  async signup(request: SignupRequest): Promise<APIResponse<null>> {
    try {
      logger.info("Signup flow started...");
      const response = await axios.post("/auth/signup", request);
      logger.info("Signup successful!");
      return response.data;
    } catch (error) {
      logger.error("Signup failed :: error :: ", error);
      throw error;
    }
  }
  async signin(request: SigninRequest): Promise<APIResponse<User>> {
    try {
      logger.info("Signin flow started...");
      const response = await axios.post("/auth/signin", request);
      logger.info("Signin successful!");
      return response.data.data;
    } catch (error) {
      logger.error("Signin failed :: error :: ", error);
      throw error;
    }
  }
  async signout(): Promise<APIResponse<null>> {
    try {
      logger.info("Signout flow started...");
      const response = await axios.post("/auth/signout");
      logger.info("Signout successful!");
      return response.data;
    } catch (error) {
      logger.error("Signout failed :: error :: ", error);
      throw error;
    }
  }
  async getCurrentUser(): Promise<APIResponse<User> | null> {
    try {
      logger.info("Get current user flow started...");
      const response = await axios.get("/auth/me");
      logger.info("Get current user successful!");
      return response.data;
    } catch (error) {
      logger.error("Get current user failed :: error :: ", error);
      return null;
    }
  }
  async deleteAccount() {
    try {
      logger.info("Delete account flow started...");
      const response = await axios.delete("/auth/delete");
      logger.info("Delete account successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete account failed :: error :: ", error);
      throw error;
    }
  }
}

const authService = new AuthService();

export default authService;

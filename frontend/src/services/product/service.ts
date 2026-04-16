import { axios, logger } from "@/utils";
import { APIResponse } from "@/utils/apiResponse";
import {
  ProductAddRequest,
  ProductModifyRequest,
  ProductResponse,
} from "./schema";

class ProductService {
  async addProduct(request: ProductAddRequest): Promise<APIResponse<null>> {
    try {
      logger.info("Add product flow started...");
      const response = await axios.post("/product/add", request);
      logger.info("Add product successful!");
      return response.data;
    } catch (error) {
      logger.error("Add product failed :: error :: ", error);
      throw error;
    }
  }
  async modifyProduct(
    request: ProductModifyRequest,
    productId: string,
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Modify product flow started...");
      const response = await axios.patch(
        `/product/modify/${productId}`,
        request,
      );
      logger.info("Modify product successful!");
      return response.data;
    } catch (error) {
      logger.error("Modify product failed :: error :: ", error);
      throw error;
    }
  }
  async deleteProduct(productId: string): Promise<APIResponse<null>> {
    try {
      logger.info("Delete product flow started...");
      const response = await axios.delete(`/product/delete/${productId}`);
      logger.info("Delete product successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete product failed :: error :: ", error);
      throw error;
    }
  }
  async getProduct(productId: string): Promise<APIResponse<ProductResponse>> {
    try {
      logger.info("Get product flow started...");
      const response = await axios.get(`/product/${productId}`);
      logger.info("Get product successful!");
      return response.data;
    } catch (error) {
      logger.error("Get product failed :: error :: ", error);
      throw error;
    }
  }
  async getProducts(): Promise<APIResponse<ProductResponse[]>> {
    try {
      logger.info("Get products flow started...");
      const response = await axios.get("/product");
      logger.info("Get products successful!");
      return response.data;
    } catch (error) {
      logger.error("Get products failed :: error :: ", error);
      throw error;
    }
  }
}

const productService = new ProductService();

export default productService;

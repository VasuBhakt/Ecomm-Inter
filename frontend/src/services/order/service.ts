import { axios, logger } from "@/utils";
import { APIResponse } from "@/utils/apiResponse";
import { OrderAddRequest, OrderModifyRequest, OrderResponse } from "./schema";

class OrderService {
  async addOrder(request: OrderAddRequest): Promise<APIResponse<null>> {
    try {
      logger.info("Add order flow started...");
      const response = await axios.post("/order/add", request);
      logger.info("Add order successful!");
      return response.data;
    } catch (error) {
      logger.error("Add order failed :: error :: ", error);
      throw error;
    }
  }
  async modifyOrder(
    request: OrderModifyRequest,
    orderId: string,
  ): Promise<APIResponse<null>> {
    try {
      logger.info("Modify order flow started...");
      const response = await axios.patch(`/order/modify/${orderId}`, request);
      logger.info("Modify order successful!");
      return response.data;
    } catch (error) {
      logger.error("Modify order failed :: error :: ", error);
      throw error;
    }
  }
  async deleteOrder(orderId: string): Promise<APIResponse<null>> {
    try {
      logger.info("Delete order flow started...");
      const response = await axios.delete(`/order/delete/${orderId}`);
      logger.info("Delete order successful!");
      return response.data;
    } catch (error) {
      logger.error("Delete order failed :: error :: ", error);
      throw error;
    }
  }
  async getOrder(orderId: string): Promise<APIResponse<OrderResponse>> {
    try {
      logger.info("Get order flow started...");
      const response = await axios.get(`/order/${orderId}`);
      logger.info("Get order successful!");
      return response.data;
    } catch (error) {
      logger.error("Get order failed :: error :: ", error);
      throw error;
    }
  }
  async getOrdersByBuyer(
    buyerId: string,
  ): Promise<APIResponse<OrderResponse[]>> {
    try {
      logger.info("Get orders by buyer flow started...");
      const response = await axios.get(`/order/buyer/${buyerId}`);
      logger.info("Get orders by buyer successful!");
      return response.data;
    } catch (error) {
      logger.error("Get orders by buyer failed :: error :: ", error);
      throw error;
    }
  }
}

const orderService = new OrderService();

export default orderService;

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// Extend Axios request configuration to include a _retry flag
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (originalRequest) {
      const skipUrls = ["/signin", "/signup", "/refresh-token"];

      const url = originalRequest.url || "";
      const shouldSkip = skipUrls.some((skipUrl) => url.includes(skipUrl));

      if (
        error.response?.status === 401 &&
        !shouldSkip &&
        !originalRequest._retry
      ) {
        originalRequest._retry = true;

        try {
          await axiosInstance.post("/auth/refresh-token");
          // Retry the original request with the new tokens/session
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          const err = new AxiosError(
            refreshError.response?.data?.message || refreshError.message
          );
          err.status = refreshError.response?.status;
          return Promise.reject(err);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;

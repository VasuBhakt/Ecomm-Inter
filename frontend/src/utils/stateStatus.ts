export interface StateStatus {
  type?: "success" | "error" | "warning" | "info" | "loading" | null;
  message?: string | null;
}

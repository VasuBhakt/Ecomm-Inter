class APIException(Exception) :
    def __init__(self, message: str, status: int = 400, error_code: str = "BAD_REQUEST"):
        self.message = message
        self.status = status
        self.error_code = error_code
        super().__init__(message)
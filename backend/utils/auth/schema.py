from pydantic import BaseModel


class UserDetails(BaseModel):
    username: str
    email: str
    id: str
    role: str

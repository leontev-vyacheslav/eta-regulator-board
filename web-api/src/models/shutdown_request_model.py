from pydantic import BaseModel


class ShutdownRequestModel(BaseModel):
    security_pass: str

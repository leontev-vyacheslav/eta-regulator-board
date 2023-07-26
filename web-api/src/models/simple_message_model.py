from pydantic import BaseModel


class SimpleMessageModel(BaseModel):
    message: str
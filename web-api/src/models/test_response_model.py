from pydantic import BaseModel


class TestResponseModel(BaseModel):
    id: int

    message: str

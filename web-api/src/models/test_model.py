from pydantic import BaseModel

class TestModel(BaseModel):
    id: int

    message: str

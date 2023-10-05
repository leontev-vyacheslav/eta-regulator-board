from pydantic import BaseModel


class SignInModel(BaseModel):
    pass_key: str

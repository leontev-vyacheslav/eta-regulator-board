from pydantic import BaseModel


class RegulatorOwnerModel(BaseModel):
    name: str

    phone_number: str

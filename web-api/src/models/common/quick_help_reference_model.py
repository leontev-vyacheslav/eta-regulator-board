from models.abstracts.app_base_model import AppBaseModel


class QuickHelpReferenceModel(AppBaseModel):
    key: str

    content: str

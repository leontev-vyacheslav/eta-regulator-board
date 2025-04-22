from http import HTTPStatus
from flask_pydantic import validate
import base64

from app import app
from models.common.message_model import MessageModel
from models.common.quick_help_reference_model import QuickHelpReferenceModel
from models.regulator.regulator_settings_model import RegulatorSettingsModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.api_route('/quick-help-references/<reference_key>', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_quick_help_reference(reference_key: str) -> RegulatorSettingsModel:
    data_path = app.app_root_path.joinpath(
        f'data/quick-help/{base64.b64decode(reference_key).decode("UTF-8")}.md'
    )

    if not data_path.exists():
        return JsonResponse(
            response=MessageModel(message='Не найден элемент справочной системы'),
            status=HTTPStatus.NOT_FOUND
        )

    with open(data_path, mode='r', encoding='UTF-8') as file:
        text = file.read()

    return QuickHelpReferenceModel(
        key=reference_key,
        content=text
    )

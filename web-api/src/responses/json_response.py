from typing import Optional, Union
from flask import Response, json

from models.abstracts.app_base_model import AppBaseModel


class JsonResponse(Response):

    def __init__(
        self,
        response: Union[AppBaseModel, object]=None,
        status=None,
        headers=None,
        mimetype='application/json',
        content_type=None
    ) -> None:
        json_response: Optional[str] = None

        if AppBaseModel in type(response).__bases__:
            json_response = response.json()
        else:
            json_response = json.dumps(response)

        super().__init__(
            response=json_response,
            status=status,
            headers=headers,
            mimetype=mimetype,
            content_type=content_type,
        )

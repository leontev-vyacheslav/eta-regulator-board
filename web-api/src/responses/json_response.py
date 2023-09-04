from flask import Response, json


class JsonResponse(Response):

    def __init__(
        self,
        response=None,
        status=None,
        headers=None,
        mimetype='application/json',
        content_type=None
    ) -> None:

        super().__init__(
            response=json.dumps(response),
            status=status,
            headers=headers,
            mimetype=mimetype,
            content_type=content_type,
        )

from http import HTTPStatus
import os
import signal
import subprocess
from flask import Response
from flask_pydantic import validate

from app import app
from models.common.message_model import MessageModel
from responses.json_response import JsonResponse
from utils.auth_helper import authorize


@app.api_route('/services/alive', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_is_alive_request():
    pid = os.getppid()

    return JsonResponse(
        response=MessageModel(message=f'The web server process {pid} is alive'),
        status=HTTPStatus.OK
    )


@app.api_route('/services/reboot', methods=['GET'])
@authorize()
@validate(response_by_alias=True)
def get_system_reboot_request():
    try:
        pid = os.getppid()
        os.kill(pid, signal.SIGTERM)
        subprocess.run(['/sbin/reboot'], check=True)
    except subprocess.CalledProcessError as e:
        return JsonResponse(
            response=MessageModel(message=f'Ошибка процесса перезапуска: {e}'),
            status=HTTPStatus.INTERNAL_SERVER_ERROR
        )

    except Exception as e:
        return JsonResponse(
            response=MessageModel(message=f'Ошибка в процессе обработки запроса перезапуска: {e}'),
            status=HTTPStatus.INTERNAL_SERVER_ERROR
        )

    return Response(
        status=HTTPStatus.ACCEPTED
    )

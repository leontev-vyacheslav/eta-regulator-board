# https://stackoverflow.com/questions/34587634/get-query-string-as-function-parameters-on-flask
# https://github.com/linsomniac/flask-publisher/blob/main/publisher.py
from flask import request
def validate(original_function):
    # Define additional code to be executed before and/or after the original function
    def wrapper_function(*args, **kwargs):
        # Additional code before the original function
        # ...
        items = original_function.__annotations__.items()
        result = original_function(*args, **kwargs)
        # Additional code after the original function
        # ...
        return result

    return wrapper_function
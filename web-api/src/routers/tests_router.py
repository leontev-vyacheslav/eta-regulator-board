from app import app
from models.test_model import TestModel

@app.get('/tests')
def get_tests():
    return {
        'data': [
            TestModel(id=1, message='Test 1'),
            TestModel(id=2, message='Test 2'),
            TestModel(id=3, message='Test 3')
        ]
    }
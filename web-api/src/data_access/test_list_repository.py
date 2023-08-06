import os
import pathlib
from typing import Optional

from models.test_list_model import TestListModel
from models.test_model import TestModel


class TestListRepository:

    def __init__(self) -> None:

        current_path = pathlib.Path(os.path.dirname(__file__)).parent
        self.data_path = os.path.join(current_path.__str__(), 'data/tests.json')

        with open(self.data_path, 'r') as file:
            json = file.read()
            self.test_list: TestListModel = TestListModel.parse_raw(json)


    def _dump(self) -> bool:
        with open(self.data_path, 'w') as file:
            json = self.test_list.json()
            dumped_bytes = file.write(json)

        return len(json) == dumped_bytes

    def get_list(self) -> TestListModel:

        return self.test_list


    def delete(self, id: int) -> Optional[TestModel]:
        test: Optional[TestModel] = next(
            (test for test in self.test_list.items if test.id == id),
            None
        )

        if test is not None:
            self.test_list.items.remove(test)
            self._dump()

            return test

        return None


    def get(self, id: int) -> Optional[TestModel]:

        test: Optional[TestModel] = next(
            (test for test in self.test_list.items if test.id == id),
            None
        )

        return test


    def append(self, test: TestModel) -> Optional[TestModel]:
        next_id = max((t.id for t in self.test_list.items)) + 1
        test.id = next_id

        self.test_list.items.append(test)
        self._dump()

        return test


    def update(self, test: TestModel) -> Optional[TestModel]:
        original_test_index = next(
            (index for index, t  in enumerate(self.test_list.items) if t.id == test.id),
            None
        )

        if original_test_index is not None:
            self.test_list.items[original_test_index] = test
            self._dump()

            return test

        return None

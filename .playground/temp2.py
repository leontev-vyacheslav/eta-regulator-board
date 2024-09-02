from dataclasses import dataclass

@dataclass
class A:
    f1: int


@dataclass
class B:
    f2: str


class C(A, B):
    pass

a = A(10)
b = B("Hi")

c = C(a.__dict_)

print(a, b, c)
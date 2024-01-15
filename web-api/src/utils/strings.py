def pascal_to_snake(string: str) -> str:
    result = [string[0].lower()]  # Convert the first character to lowercase
    for char in string[1:]:
        if char.isupper():
            result.extend(['_', char.lower()])
        else:
            result.append(char)
    return ''.join(result)


def snake_to_camel(string: str) -> str:
    string_split = string.split('_')

    return string_split[0] + ''.join(word.capitalize() for word in string_split[1:])

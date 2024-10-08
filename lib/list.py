import random


def shuffle_dict_keys(data: dict[str, any]) -> dict[str, any]:
    """
    Creates a new dictionary with the same key-value pairs but in a
    randomized key order.\

    :param data: The input dictionary.
    :type data: dict[str, any]

    :return: A new dictionary with shuffled keys.
    """
    keys = list(data.keys())
    random.shuffle(keys)
    return {key: data[key] for key in keys}

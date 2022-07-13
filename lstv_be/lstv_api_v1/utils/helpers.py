

def find_item(obj, key):
    """
    Finding an item by key, recursively within a dict
    """

    if key in obj: return obj[key]
    for k, v in obj.items():
        if isinstance(v, dict):
            item = find_item(v, key)
            if item is not None:
                return item

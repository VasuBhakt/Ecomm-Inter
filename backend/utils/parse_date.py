def parse_date(cls, date_str) -> str:
    if isinstance(date_str, str) and "T" in date_str:
        return date_str.split("T")[0]
    return date_str

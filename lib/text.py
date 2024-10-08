def optimize_text(text: str) -> str:
    """
    Optimize the text by removing extra spaces and new lines
    :param text: The text to optimize
    :return: Optimized text
    """

    # Remove extra spaces
    text = " ".join(text.split())

    # Remove new lines
    text = text.replace("\n", "")

    return text

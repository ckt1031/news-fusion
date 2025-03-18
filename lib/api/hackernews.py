import html
import re
import textwrap

import requests


def get_hn_comments(hn_url: str):
    """
    Parses the id from hn_url, fetches the algolia API, and returns a combined text with replies content, nested also, but no need to include usernames.

    Args:
        hn_url (str): The Hacker News URL (e.g., "https://news.ycombinator.com/item?id=12345").

    Returns:
        str: A combined string of all comments and replies, or an empty string if an error occurs.
    """
    try:
        # Extract the item ID from the URL
        match = re.search(r"item\?id=(\d+)", hn_url)
        if not match:
            return ""
        item_id = match.group(1)

        # Construct the Algolia API URL
        api_url = f"https://hn.algolia.com/api/v1/items/{item_id}"

        # Fetch the data from the API
        response = requests.get(api_url)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        data = response.json()

        # Function to recursively extract comments with indentation
        def extract_comments(item, level=0):
            text = item.get("text", "") or ""
            comment_text = textwrap.indent(html.unescape(text), "    " * level)
            comments = [comment_text]
            for child in item.get("children", []):
                comments.extend(extract_comments(child, level + 1))
            return comments

        # Extract all comments
        all_comments = extract_comments(data)

        # Combine all comments into a single string
        combined_text = "\n".join(all_comments)

        return combined_text

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Algolia API: {e}")
        return ""
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""

import html
import re

import requests


def get_lobsters_comments(lobsters_url: str):
    """
    Parses the id from lobste.rs URL, fetches the data, and returns combined text of description and comments with indentation.

    Args:
        lobsters_url (str): The Lobste.rs URL (e.g., "https://lobste.rs/s/r9oskz/is_there_api_documentation_for_lobsters").

    Returns:
        str: A combined string of the description and all comments, with indentation, or an empty string if an error occurs.
    """
    try:
        # Extract the short_id from the URL
        match = re.search(r"/s/([a-zA-Z0-9]+)", lobsters_url)
        if not match:
            return ""
        short_id = match.group(1)

        # Construct the API URL
        api_url = f"https://lobste.rs/s/{short_id}.json"

        # Fetch the data from the API
        response = requests.get(api_url)
        response.raise_for_status()
        data = response.json()

        # Extract the description (handle potential absence)
        description = data.get("description_plain", "")

        # Function to recursively extract comments with indentation
        def extract_comments(comments, level=0):
            all_comments = []
            for comment_data in comments:
                indent = "    " * level + " - "
                # Use comment_plain, and unescape HTML entities
                comment_text = html.unescape(comment_data.get("comment_plain", ""))
                comment_text = f"{indent}{comment_text}"
                all_comments.append(comment_text)

                # Recursively process child comments, using parent_comment to infer nesting.

            # Sort comments by created_at, and then create nested comments
            comment_dict = {}
            top_level_comments = []

            for comment_data in comments:
                comment_dict[comment_data["short_id"]] = comment_data
                if comment_data["parent_comment"] is None:
                    top_level_comments.append(comment_data["short_id"])

            def build_nested_comments(short_id, level):
                nested_comments = []
                comment_data = comment_dict[short_id]
                indent = "    " * level
                comment_text = html.unescape(comment_data.get("comment_plain", ""))
                comment_text = f"{indent}{comment_text}"
                nested_comments.append(comment_text)

                for comment_data_iter in comments:
                    if comment_data_iter["parent_comment"] == short_id:
                        nested_comments.extend(
                            build_nested_comments(
                                comment_data_iter["short_id"], level + 1
                            )
                        )

                return nested_comments

            sorted_comments = []
            for top_level_comment in top_level_comments:
                sorted_comments.extend(build_nested_comments(top_level_comment, 0))

            return sorted_comments

        # Extract all comments
        all_comments = extract_comments(data.get("comments", []))

        # Combine description and comments
        comment_text = "\n".join(all_comments)

        return f"=== BEGIN DESCRIPTION ===\n{description}\n=== ENDED DESCRIPTION ===\n\n{comment_text}"

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data from Lobsters API: {e}")
        return ""
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""

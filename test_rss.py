from lib.rss import get_all_rss_sources


def check_all_rss():
    all_sources = get_all_rss_sources()

    for d in all_sources:
        category_name = d[0]
        source = d[1]

        print(f"Category: {category_name}, source: {source}")

if __name__ == "__main__":
    check_all_rss()
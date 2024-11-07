package lib

type Notification struct {
	Discord *string `yaml:"discord,omitempty"`
}

type Category struct {
	Name         string        `yaml:"name"`
	Sources      []string      `yaml:"sources"`
	Notification *Notification `yaml:"notifications,omitempty"`
}

type Configuration struct {
	RSS []Category `yaml:"rss"`
}

type ArticleItemBody struct {
	Title       string
	Description string
	URL         string
	Image       *string
}

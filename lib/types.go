package lib

type Notification struct {
	Discord *string `yaml:"discord,omitempty"`
}

type Category struct {
	Name         string       `yaml:"name"`
	Sources      []string     `yaml:"sources"`
	Notification Notification `yaml:"notification"`
}

type Configuration struct {
	RSS []Category `yaml:"rss"`
}

type NotificationBody struct {
	Title       string
	Description string
	URL         string
	Image       *string
}

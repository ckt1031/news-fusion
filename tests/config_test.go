package tests

import (
	"testing"

	"github.com/ckt1031/news-fusion/lib"
	"github.com/stretchr/testify/assert"
)

func TestYouTubeSourceURLReverse(t *testing.T) {
	configURL := "yt://UCBJycsmduvYEL83R_U4JriQ"
	httpURL := "https://www.youtube.com/feeds/videos.xml?channel_id=UCBJycsmduvYEL83R_U4JriQ"

	parsedURL := lib.ParsePrefix(configURL)
	reversedURL := lib.ReversePrefix(httpURL)

	assert.Equal(t, httpURL, parsedURL)
	assert.Equal(t, configURL, reversedURL)
}

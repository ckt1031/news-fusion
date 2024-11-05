package api

import (
	"encoding/json"
	"io"
	"net/http"
	"regexp"
	"strings"

	"github.com/ckt1031/news-fusion/lib"
)

type PlayerCaptionsTracklistRenderer struct {
	CaptionTracks []CaptionTrack `json:"captionTracks"`
}

type CaptionTrack struct {
	BaseUrl string `json:"baseUrl"`
}

func GetYouTubeVideoTranscript(url string) (string, error) {
	client := &http.Client{}

	// Add headers to the request
	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return "", err
	}

	req.Header.Add("Accept-Language", "en-US,en;q=0.9")
	req.Header.Add("User-Agent", lib.USER_AGENT)

	// Fetch and get HTML content
	resp, err := client.Do(req)

	if err != nil {
		return "", err
	}

	defer resp.Body.Close()

	html, err := io.ReadAll(resp.Body)

	if err != nil {
		return "", err
	}

	htmlString := string(html)

	// Get the transcript
	splittedHTMl := strings.Split(htmlString, "\"captions\":")

	if len(splittedHTMl) <= 1 {
		return "", nil
	}

	splittedHTMl = strings.Split(splittedHTMl[1], ",\"videoDetails")

	if len(splittedHTMl) <= 1 {
		return "", nil
	}

	jsonData := strings.Replace(splittedHTMl[0], "\n", "", -1)

	var response struct {
		PlayerCaptionsTracklistRenderer PlayerCaptionsTracklistRenderer `json:"playerCaptionsTracklistRenderer"`
	}

	err = json.Unmarshal([]byte(jsonData), &response)

	if err != nil {
		return "", err
	}

	tracks, err := ParseYouTubeTrack(response.PlayerCaptionsTracklistRenderer.CaptionTracks[0].BaseUrl)

	if err != nil {
		return "", err
	}

	var transcript string

	for _, track := range tracks {
		transcript += track.Text + " "
	}

	return transcript, nil
}

type TranscriptTrack struct {
	Text string `json:"text"`
}

func ParseYouTubeTrack(url string) ([]TranscriptTrack, error) {
	client := &http.Client{}

	// Add headers to the request
	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		return []TranscriptTrack{}, err
	}

	req.Header.Add("Accept-Language", "en-US,en;q=0.9")
	req.Header.Add("User-Agent", lib.USER_AGENT)

	// Fetch and get HTML content
	resp, err := client.Do(req)

	if err != nil {
		return []TranscriptTrack{}, err
	}

	defer resp.Body.Close()

	html, err := io.ReadAll(resp.Body)

	if err != nil {
		return []TranscriptTrack{}, err
	}

	htmlString := string(html)

	// <text start="823.92" dur="5.24">with an S3 bucket and also write to or read from a database. So, let me  </text>
	// Into [1] = start, [2] = dur, [3] = text

	re := regexp.MustCompile(`<text start="([^"]*)" dur="([^"]*)">([^<]*)<\/text>`)

	matches := re.FindAllStringSubmatch(htmlString, -1)

	var result []TranscriptTrack

	for _, transcript := range matches {
		result = append(result, TranscriptTrack{
			Text: transcript[3],
		})
	}

	return result, nil
}

package lib

import (
	"bufio"
	"log"
	"os"
)

func ReadTxtFile(path string) string {
	file, err := os.Open(path)
	if err != nil {
		log.Fatal(err)
	}

	defer file.Close()

	scanner := bufio.NewScanner(file)

	var text string

	for scanner.Scan() {
		text += scanner.Text()
	}

	defer func() {
		if err := scanner.Err(); err != nil {
			log.Fatal(err)
		}
	}()

	return text
}

func GetShortSummaryPrompt() string {
	return ReadTxtFile("./prompts/short-summary.txt")
}

func GetImportancePrompt() string {
	return ReadTxtFile("./prompts/importance.txt")
}

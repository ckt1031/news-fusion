FROM golang:alpine AS build-stage

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w -extldflags '-static'" -o /output

RUN apk add upx
RUN upx --best /output

FROM alpine:latest AS production-stage

COPY --from=build-stage /output /output
COPY --from=build-stage /app/prompts /prompts

ENV GIN_MODE=release

ENTRYPOINT ["/output"]
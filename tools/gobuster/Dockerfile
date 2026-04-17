FROM golang:1.24-alpine AS build

RUN apk add --no-cache git
# Pin to a stable release.
RUN go install github.com/OJ/gobuster/v3@v3.7.0

FROM alpine:3.20
RUN apk add --no-cache ca-certificates
COPY --from=build /go/bin/gobuster /usr/local/bin/gobuster
ENTRYPOINT ["gobuster"]

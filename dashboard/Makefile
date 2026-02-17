.PHONY: help install start dev clean logs

help:
	@echo "Token Usage Dashboard - Available Commands"
	@echo "==========================================="
	@echo "make install  - Install dependencies"
	@echo "make start    - Start the dashboard server"
	@echo "make dev      - Run in development mode"
	@echo "make clean    - Remove node_modules"
	@echo "make logs     - Tail the token-logs.jsonl file"
	@echo "make help     - Show this help message"

install:
	npm install

start:
	npm start

dev:
	npm run dev

clean:
	rm -rf node_modules

logs:
	tail -f /root/.openclaw/workspace/token-logs.jsonl

.DEFAULT_GOAL := help

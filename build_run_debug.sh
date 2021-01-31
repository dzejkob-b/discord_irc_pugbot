#!/bin/bash

npm run build && CONFIG_FILE=config.json npm run debug -- --config config.json

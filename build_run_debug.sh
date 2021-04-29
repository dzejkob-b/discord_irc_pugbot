#!/bin/bash

npm run build && CONFIG_FILE=conf/config.json npm run debug -- --config conf/config.json

#!/bin/bash

if [ -f "log.txt" ]; then
    if [ ! -d "logs" ]; then
        mkdir "logs"
    fi

    mv "log.txt" "logs/log_"$(date +"%Y_%m_%d_%H_%M_%S")".txt"
fi

npm run build &> log.txt && CONFIG_FILE=config.json npm run start -- --config config.json &> log.txt

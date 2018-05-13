#!/bin/bash
npm run build &> log.txt && npm run start -- --config config.json &> log.txt 


#!/bin/bash

# Deploy frontend
cd frontend
npm install
npm run build  # or any other build command
cd ..

# Deploy backend
cd backend
npm install
npm run start  # or any other start command
cd ..

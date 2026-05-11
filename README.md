# Whisk-It | Bakery POS System

Whisk-It is a modern, full-stack Point of Sale (POS) system designed specifically for bakeries. It streamlines order management, inventory tracking, and checkout processes.

## Tech Stack
- Frontend: React (Vite), Lucide-React (Icons)
- Backend: Node.js, Express.js
- Database: MongoDB
- Styling: CSS Modules

## Getting Started
Prerequisites
- Node.js (v18 or higher)
- npm

## Installation (Terminal/ Powershell)
Clone the repository:
1. git clone https://github.com/YolandaMashaba/Whisk-It.git
2. cd Whisk-It

## Set up the Backend (Terminal/ Powershell):
1. cd server
2. npm install

## Set up the Backend (Terminal/ Powershell):
1. cd ../client
2. npm install

## Running the Project
To run the full-stack application, you will need two terminal instances:
### 1. Start the Server (backend)
Environment Variables:
Each developer needs a local .env file. We have provided a template.
- cd server
- change the .env.example file to .env
- npm run dev

The API will be available at http://localhost:5001

### 2. Start the client (frontend)
- cd client
- npm run dev

The frontend will be available at http://localhost:5174

### !Important: We use **nodemon** for the backend to allow for hot-reloading.

*   **Start Backend:** `cd server && npm run dev` (Runs on port 5001)
*   **Start Frontend:** `cd client && npm run dev` (Runs on port 5173)

## Project Structure
1. Main Project: Whisk-It
2. Frontend: client
3. Backend: server

## Branching Strategy
We follow a feature-branch workflow:
1. main: Stable, production-ready code.
2. develop: The main integration branch for active development.
3. feature branches: feature-name: Create these for specific tasks

## Contributing
1. Create a branch from develop.
2. Commit your changes with clear messages.





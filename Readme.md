# Quick Notes Project

A modern note-taking application with AI assistant capabilities built using React.js and Node.js.

## Features

### Note Management

- Create, read, update, and delete notes
- Real-time status updates (Pending/Completed)
- Drag-and-drop note cards
- Copy note content to clipboard
- Unique ID tracking for each note
- Rich text formatting support

### AI Assistant

- Built-in AI assistant powered by Google's Gemini AI
- Natural language note creation and management
- Smart search capabilities
- Context-aware responses
- Interactive chat interface

### User Interface

- Modern, responsive design
- Animated transitions using Framer Motion
- Dark theme optimized for readability
- Toast notifications for user feedback
- Modal-based interactions
- Drag-and-drop functionality

## Tech Stack

### Frontend

- React.js with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Axios for API requests
- React Icons
- React Toastify for notifications

### Backend

- Node.js with Express
- MongoDB with Mongoose
- Google Generative AI (Gemini)
- CORS for cross-origin requests
- dotenv for environment variables

## Getting Started

### Prerequisites

- Node.js >= 14
- MongoDB Atlas account
- Google AI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/quick-notes.git
```

2. Install Backend dependencies:

```bash
cd Backend
npm install
```

3. Install Frontend dependencies:

```bash
cd ../Quick-Notes
npm install
```

4. Configure Environment variables: Create .env file in Backend folder:

```bash
MONGO_URI=your_mongodb_uri
PORT=your_port_no_
GOOGLE_API_KEY=your_google_api_key
NODE_ENV=development
DEBUG=true

```

### Running the Application

1. Start the backend server:

```bash
cd Backend
npm start
```

2. Start the frontend development server

```bash
cd Quick-Notes
npm run dev
```

### API Endpoints

#### Notes

    - GET /quick-notes - Get all notes
    - GET /quick-notes/get-note/:id - Get note by ID
    - POST /quick-notes/create - Create new note
    - PUT /quick-notes/update/:id - Update note
    - PUT /quick-notes/update-status/:id - Update note status
    - DELETE /quick-notes/delete/:id - Delete note

#### AI Assistant

    - POST /quick-notes/assistant - Interact with AI assistant

### Contributing

- Fork the repository
- Create your feature branch (git checkout -b feature/amazing-feature)
- Commit your changes (git commit -m 'Add some amazing feature')
- Push to the branch (git push origin feature/amazing-feature)
- Open a Pull Request

### License

- This project is licensed under the ISC License.

### Acknowledgments

- Built with React + Vite
- Styled with Tailwind CSS
- AI capabilities powered by Google's Gemini
- Database hosted on MongoDB Atlas

### Build by Toshak Parmar with Details...

- Email: toshakparmar2000@gmail.com
- Portfolio: https://codesmachers.netlify.app/
- Dev-Soft-Ai: https://dev-soft-ai.netlify.app/
- Linkdin: https://www.linkedin.com/in/toshak-parmar-codesmachers-673968263/

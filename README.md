# Politico - Iceland Politics Monitoring Platform

A comprehensive platform for monitoring parliamentary proceedings in Iceland, tracking political party activities, and engaging citizens in the democratic process.

## Key Features

- **Parliamentary Monitoring**: Track bills, discussions, and amendments
- **MP Profiles**: Access detailed information about Members of Parliament
- **Voting Records**: Analyze voting patterns at individual and party levels
- **Citizen Engagement**: Discussion forums and whistleblowing mechanisms
- **Real-time Alerts**: Stay updated on key parliamentary developments

## Technology Stack

- **Backend**: Django, Django REST Framework
- **Frontend**: React.js, Material-UI
- **Database**: PostgreSQL
- **Data Processing**: Python (Pandas, NLTK)
- **Authentication**: JWT-based authentication

## Setup Instructions

### Backend Setup

1. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add necessary environment variables (see `.env.example`)

4. Run migrations:
   ```
   cd backend
   python manage.py migrate
   ```

5. Start the development server:
   ```
   python manage.py runserver
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## Data Collection

The platform collects data from:

- Alþingi (Icelandic Parliament) Website
- Government agencies
- News websites
- Political party websites and social media

## Contributing

Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
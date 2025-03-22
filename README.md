# Sparq Connection

A progressive web app designed to help couples strengthen their relationships through prompts, analytics, and gamification.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js/Express backend API
- `sanity/` - Sanity.io CMS for content management
- `docs/` - Project documentation and specifications

## Documentation

All project documentation can be found in the `docs/` directory:

- [Product Requirements Document](docs/PRD_SparqConnection.md)
- [API Specification](docs/APISpec_SparqConnection.md)
- [Technical Architecture](docs/TechArchitecture_SparqConnection.md)
- [UX/UI Guidelines](docs/UXUI_SparqConnection.md)
- [Data Model](docs/DataModel_SparqConnection.md)
- [Psychological Modalities](docs/PsychologicalModalities_SparqConnection.md)

## Getting Started

### Prerequisites

- Node.js (version specified in `.nvmrc`)
- npm or yarn
- MongoDB
- Sanity.io account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KrisWemet/SparqConnection_FullDocs.git
   cd SparqConnection_FullDocs
   ```

2. Install dependencies for all components:
   ```bash
   # Install root dependencies
   npm install

   # Install client dependencies
   cd client && npm install

   # Install server dependencies
   cd ../server && npm install

   # Install Sanity dependencies
   cd ../sanity && npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy environment templates
   cp .env.template .env
   cd client && cp .env.template .env
   cd ../server && cp .env.template .env
   ```

4. Start the development servers:
   ```bash
   # In separate terminals:
   
   # Start client
   cd client && npm start

   # Start server
   cd server && npm run dev

   # Start Sanity studio
   cd sanity && npm run dev
   ```

## Contributing

Please read our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
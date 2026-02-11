# EduBlock - Educational Document Management System

A modern, secure blockchain-based educational document management platform built with React, Vite, and Tailwind CSS.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Support for Individual, Employer, Verifier, and Admin roles
- **Secure Authentication**: JWT-based authentication with MFA support for admins
- **Document Management**: Upload, view, and manage educational documents
- **Consent Management**: Request and approve document access with blockchain verification
- **Responsive Design**: Mobile-first design with modern UI components
- **Real-time Updates**: Dynamic dashboards with live statistics

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Authentication**: JWT with jwt-decode

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Backend API server running (default: http://localhost:8081)

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ni3salunkhe/Edu-Block-UI.git
   cd Edu-Block-UI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the API URL:
   ```env
   VITE_API_URL=http://localhost:8081/api
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 🏗️ Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## 📦 Project Structure

```
src/
├── auth/                 # Authentication logic and protected routes
├── components/           # Reusable UI components
│   └── ui/              # UI-specific components (ErrorBoundary, LoadingOverlay)
├── context/             # React context providers
├── layouts/             # Layout components (AppLayout)
├── pages/               # Page components organized by role
│   ├── admin/          # Admin dashboard and management
│   ├── employer/       # Employer features
│   ├── individual/     # Individual user features
│   └── verifier/       # Document verification features
├── services/            # API services and utilities
└── App.jsx             # Main application component
```

## 🔐 User Roles

### Individual
- Upload and manage educational documents
- View consent requests
- Approve/reject access requests

### Employer
- Search for individuals
- Request document access
- View approved documents

### Verifier
- Review pending documents
- Approve/reject verification requests
- Manage verification queue

### Admin
- User management
- Create verifier accounts
- View audit logs
- System configuration

## 🌐 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 🔧 Configuration

### API Configuration
Update the API base URL in `.env`:
```env
VITE_API_URL=https://your-api-domain.com/api
```

### Tailwind Configuration
Customize colors and theme in `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: "#0F172A",
      accent: "#2563EB",
      muted: "#F1F5F9"
    }
  }
}
```

## 🚢 Deployment

### Vercel/Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variable `VITE_API_URL` in your hosting platform

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Nitin Salunkhe** - [ni3salunkhe](https://github.com/ni3salunkhe)

## 🙏 Acknowledgments

- React Team for the amazing framework
- Vite for the blazing-fast build tool
- Tailwind CSS for the utility-first CSS framework

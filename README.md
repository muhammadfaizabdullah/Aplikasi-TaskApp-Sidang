# TaskApp - Task Management Application

A modern, responsive task management application built with Next.js, NextAuth, and Prisma.

## ✨ Features

### 🎨 Enhanced UI/UX

- **Collapsible Sidebar**: Click the chevron icon to collapse/expand the sidebar for more screen space
- **Enhanced Card Design**: Dashboard cards with borders, shadows, and hover effects
- **Smooth Animations**: Subtle transitions and hover effects
- **Responsive Design**: Optimized for desktop and mobile

### 🔐 Authentication

- NextAuth.js integration
- Username setup flow
- Session management
- Optional OAuth (Google, GitHub) and Email magic link

### 📊 Dashboard

- **Stats Overview Cards**: Projects, Tasks, Team Members, Progress
- **Quick Actions**: Create projects/tasks and invite members
- **Recent Projects**: Latest projects with progress

### 🚀 Project Management

- Create and manage projects
- Task assignment and tracking
- Team member management
- Project status tracking

### 👥 Team Collaboration

- Invite team members
- Role-based access control
- Team member search
- Project invitations

### 📈 Analytics

- Project status overview
- Task priority distribution
- Progress tracking and performance metrics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **ORM**: Prisma
- **Database**: SQLite (development) / PostgreSQL (production)
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd TaskApp
```

1. Install dependencies

```bash
npm install
```

1. Set up environment variables (single template)

```bash
cp env.example .env.local
```

1. Configure your environment variables in `.env.local`.

- Required: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`.
- Optional: Google/GitHub or Email SMTP. Leave them empty if unused.
- Quick check: visit `/api/debug/auth-config` to see which providers are detected.

1. Set up the database

```bash
npx prisma generate
npx prisma db push
```

1. Run the development server

```bash
npm run dev
```

1. Open `http://localhost:3000` in your browser

## 🎯 Key Features Implementation

### Collapsible Sidebar

- Toggle via the chevron icon in the greeting section
- 300ms ease-in-out animations
- Responsive layout adjustments

### Enhanced Card Design

- 2px colored borders matching card themes
- Shadows with hover animations
- Scale and shadow transitions on hover

### Performance Optimizations

- Lazy loaded components
- Efficient database queries
- CSS transitions for smooth interactions
- Optimized image loading

## 📱 Responsive Design

- Mobile-first layout
- Tablet grid adjustments
- Desktop enhancements
- Touch-friendly interactions

## 🔧 Customization

### Colors

- Primary: Green (#16A34A)
- Secondary: Blue (#3B82F6)
- Accent: Purple (#8B5CF6)
- Warning: Yellow (#EAB308)

### Styling

- Border radius: 8px
- Transitions: 200–300ms
- Typography: Inter

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Other Platforms

- Ensure Node.js 18+ support
- Set environment variables
- Run build: `npm run build && npm start`

## 🤝 Contributingg

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the code examples

---

**TaskApp** — Making team collaboration simple and efficient! 🚀

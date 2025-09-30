# Velora Backend

> A robust and feature-rich backend service for the Velora personal finance management application.

## Features

### 🔐 Authentication

- User registration and login
- JWT-based authentication
- Secure password handling
- Session management

### 💰 Budget Management

- Create and manage budgets
- Track budget allocations
- Set budget limits
- Monitor budget utilization

### 📊 Transaction Management

- Record income and expenses
- Categorize transactions
- Track transaction history
- Support for multiple transaction types

### 🎯 Goal Management

- Set financial goals
- Track goal progress
- Goal deadline management
- Goal achievement monitoring

### 📁 Categories

- Custom category creation
- Category hierarchy
- Transaction categorization
- Category-based reporting

### 📈 Dashboard & Analytics

- Financial overview
- Spending patterns
- Budget vs actual analysis
- Goal progress tracking

### 📊 Reports

- Generate financial reports
- Export data in multiple formats (CSV, Excel, PDF)
- Custom date range reporting
- Category-wise analysis

### 🔄 Import/Export

- Data backup functionality
- Import transactions
- Export financial data
- Support for multiple file formats

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB (implied from project structure)
- **Authentication**: JWT
- **File Handling**: Multer, Cloudinary
- **Documentation**: OpenAPI/Swagger (recommended)

## Project Structure

\`\`\`
backend/
├── src/
│ ├── app.ts # Application entry point
│ ├── server.ts # Server configuration
│ ├── config/ # Configuration files
│ │ ├── cloudinary.ts # Cloudinary setup
│ │ ├── database.ts # Database configuration
│ │ └── multer.ts # File upload configuration
│ ├── controllers/ # Request handlers
│ │ ├── AuthController.ts
│ │ ├── BudgetController.ts
│ │ ├── CategoryController.ts
│ │ ├── DashboardController.ts
│ │ ├── GoalController.ts
│ │ ├── ImportExportController.ts
│ │ ├── ReportController.ts
│ │ └── TransactionController.ts
│ ├── middleware/ # Custom middleware
│ │ ├── auth.ts # Authentication middleware
│ │ ├── error.ts # Error handling
│ │ └── upload.ts # File upload middleware
│ ├── models/ # Data models
│ │ ├── Auth.ts
│ │ ├── Budget.ts
│ │ ├── Category.ts
│ │ ├── Goal.ts
│ │ └── Transaction.ts
│ ├── routes/ # API routes
│ │ ├── AuthRouter.ts
│ │ ├── budgetRoutes.ts
│ │ ├── categoryRoutes.ts
│ │ ├── dashboardRoutes.ts
│ │ ├── goalRoutes.ts
│ │ ├── importExportRoutes.ts
│ │ ├── reportRoutes.ts
│ │ └── transactionRoutes.ts
│ ├── services/ # Business logic
│ │ ├── backup.service.ts
│ │ └── export.service.ts
│ ├── types/ # TypeScript type definitions
│ │ ├── auth.types.ts
│ │ ├── budget.types.ts
│ │ ├── category.types.ts
│ │ ├── goal.types.ts
│ │ └── transaction.types.ts
│ └── utils/ # Utility functions
│ ├── response.ts
│ └── wrap.ts
├── .env # Environment variables
├── .gitignore # Git ignore file
├── package.json # Project dependencies
├── tsconfig.json # TypeScript configuration
└── vercel.json # Vercel deployment configuration
\`\`\`

## API Endpoints

### Authentication

- \`POST /api/auth/register\` - Register new user
- \`POST /api/auth/login\` - User login
- \`POST /api/auth/logout\` - User logout

### Budgets

- \`GET /api/budgets\` - Get all budgets
- \`POST /api/budgets\` - Create new budget
- \`PUT /api/budgets/:id\` - Update budget
- \`DELETE /api/budgets/:id\` - Delete budget

### Transactions

- \`GET /api/transactions\` - Get all transactions
- \`POST /api/transactions\` - Create new transaction
- \`PUT /api/transactions/:id\` - Update transaction
- \`DELETE /api/transactions/:id\` - Delete transaction

### Categories

- \`GET /api/categories\` - Get all categories
- \`POST /api/categories\` - Create new category
- \`PUT /api/categories/:id\` - Update category
- \`DELETE /api/categories/:id\` - Delete category

### Goals

- \`GET /api/goals\` - Get all goals
- \`POST /api/goals\` - Create new goal
- \`PUT /api/goals/:id\` - Update goal
- \`DELETE /api/goals/:id\` - Delete goal

### Reports

- \`GET /api/reports/summary\` - Get financial summary
- \`GET /api/reports/export\` - Export reports

### Dashboard

- \`GET /api/dashboard/overview\` - Get dashboard overview
- \`GET /api/dashboard/statistics\` - Get financial statistics

## Setup and Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/MuliaAndiki/Velora-Backend.git
   cd Velora-Backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**
   Create a \`.env\` file in the root directory and add the following:
   \`\`\`env
   PORT=3000
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   \`\`\`

4. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

**Mulia Andiki** - [GitHub Profile](https://github.com/MuliaAndiki)

---

Made with ❤️ by Mulia Andiki

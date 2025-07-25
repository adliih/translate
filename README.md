# AI Translator - Powered by Gemini AI

A modern, fast, and intelligent translation service built with Next.js and Google's Gemini AI. Translate text and JSON objects instantly with support for 20+ languages.

## 🌐 Live Demo

**[https://translate.adliih.com](https://translate.adliih.com)**

## ✨ Features

- **Text Translation**: Translate any text between 20+ supported languages
- **Object Translation**: Translate JSON objects while preserving structure
- **Real-time Processing**: Instant translations powered by Gemini AI
- **Modern UI**: Clean, responsive interface built with shadcn/ui
- **API Endpoints**: Public REST API for integration into other applications
- **Language Detection**: Automatic language detection and smart suggestions
- **Mobile Responsive**: Works seamlessly on all devices

## 🚀 Supported Languages

English, Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Turkish, Polish, Dutch, Swedish, Danish, Norwegian, Finnish, Czech, and more.

## 🛠️ Technology Stack

- **Framework**: Next.js 15 with App Router
- **AI Model**: Google Gemini 2.0 Flash
- **AI SDK**: Vercel AI SDK
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Deployment**: Vercel

## 📖 API Documentation

### Text Translation

\`\`\`bash
POST /api/translate/text
Content-Type: application/json

{
  "text": "Hello World",
  "source": "en",
  "target": "es"
}
\`\`\`

**Response:**
\`\`\`json
{
  "translatedText": "Hola Mundo"
}
\`\`\`

### Object Translation

\`\`\`bash
POST /api/translate/object
Content-Type: application/json

{
  "object": {
    "title": "Welcome",
    "description": "This is a sample text"
  },
  "source": "en",
  "target": "es"
}
\`\`\`

**Response:**
\`\`\`json
{
  "translatedObject": {
    "title": "Bienvenido",
    "description": "Este es un texto de muestra"
  }
}
\`\`\`

## 🏃‍♂️ Quick Start

### Prerequisites

- Node.js 18+ 
- Google Generative AI API Key

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/adliih/translate.git
   cd translate
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Add your Google Generative AI API key:
   \`\`\`env
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   \`\`\`

4. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Getting a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

## 🌟 Usage Examples

### Using the Web Interface

1. Visit [https://translate.adliih.com](https://translate.adliih.com)
2. Select your source and target languages
3. Choose between text or object translation
4. Enter your content and click translate

### Using the API

\`\`\`javascript
// Text translation
const response = await fetch('https://translate.adliih.com/api/translate/text', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: 'Hello, how are you?',
    source: 'en',
    target: 'fr'
  })
});

const data = await response.json();
console.log(data.translatedText); // "Bonjour, comment allez-vous ?"
\`\`\`

## 🔧 Configuration

The application supports various configuration options through environment variables:

- `GOOGLE_GENERATIVE_AI_API_KEY`: Your Gemini API key (required)
- `NEXT_PUBLIC_APP_URL`: Your app's public URL (optional)

## 📁 Project Structure

\`\`\`
translate/
├── app/
│   ├── api/translate/
│   │   ├── text/route.ts
│   │   └── object/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/ui/
├── hooks/
├── lib/
└── public/
\`\`\`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (\`git checkout -b feature/AmazingFeature\`)
3. Commit your changes (\`git commit -m 'Add some AmazingFeature'\`)
4. Push to the branch (\`git push origin feature/AmazingFeature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Google Gemini AI](https://ai.google.dev/)** - For providing the powerful AI translation capabilities
- **[Vercel AI SDK](https://sdk.vercel.ai/)** - For the excellent AI integration tools
- **[shadcn/ui](https://ui.shadcn.com/)** - For the beautiful UI components
- **[Next.js](https://nextjs.org/)** - For the amazing React framework

---

## 🔗 Links

- **Live Application**: [https://translate.adliih.com](https://translate.adliih.com)
- **Built with v0.dev**: [https://v0.dev/chat/projects/50HL1FXe5HI](https://v0.dev/chat/projects/50HL1FXe5HI)
- **Deployed on Vercel**: [https://vercel.com/adliihs-projects/v0-next-js-gemini-app](https://vercel.com/adliihs-projects/v0-next-js-gemini-app)

*This project was initially created and developed using [v0.dev](https://v0.dev) - Vercel's AI-powered development platform.*

[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/50HL1FXe5HI)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://translate.adliih.com)
[![Powered by Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-blue?style=for-the-badge)](https://ai.google.dev/)

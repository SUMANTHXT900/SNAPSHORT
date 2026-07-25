# ⚡ SNAPSHORT

> **The local-first, zero-trimming LLM context packager built for developers using web-based AI assistants.**

[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](https://github.com/SUMANTHXT900/SNAPSHORT/releases/tag/v1.0.0)
[![Built with Tauri](https://img.shields.io/badge/Built_with-Tauri_2.0-24c8db?logo=tauri&logoColor=white)](https://tauri.app/)
[![Powered by Rust](https://img.shields.io/badge/Powered_by-Rust-000000?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React 18](https://img.shields.io/badge/Frontend-React_18_%7C_Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)

---

## 📥 Download & Installation (Windows)

Get started with Snapshort immediately without compiling source code or installing developer toolchains. Download the pre-built, digitally signed Windows setup installer below:

[![Download for Windows](https://img.shields.io/badge/Download_for_Windows-v1.0.0_(.msi)-10B981?style=flat&logo=windows&logoColor=white&labelColor=0F172A)](https://github.com/SUMANTHXT900/SNAPSHORT/releases/latest/download/Snapshort_1.0.0_x64_en-US.msi) [![View Release Notes](https://img.shields.io/badge/Release_Notes-v1.0.0-6366F1?style=flat&logo=github&logoColor=white&labelColor=0F172A)](https://github.com/SUMANTHXT900/SNAPSHORT/releases/tag/v1.0.0)

#### 💡 Why Install the Official Release?
- **⚡ Zero-Configuration Setup**: Double-click the ultra-lightweight setup file (`~3.2 MB`) to deploy Snapshort cleanly into your Windows Start Menu and Desktop.
- **🛡️ Cryptographic Authenticity**: Every official release build is digitally certified with Ed25519 tamper-proof encryption keys to guarantee secure, verified software.
- **🔄 Built-In Automatic Updater**: Once installed, Snapshort performs silent background checks for new releases and lets you update directly inside the app!

---

## 🎯 Why Snapshort? (The Killer Use Case)

Let’s be candid: **Snapshort is not designed for every single coding workflow.**

If you build inside an IDE with integrated AI copilots (like VS Code Cursor, GitHub Copilot, or Cline) or CLI autonomous agents that already possess live read/write access to your local computer's filesystem, you do not need to manually generate snapshots of your codebase.

### 🌐 When Snapshort Becomes Indispensable:
When you want to analyze, audit, debug, or discuss your **entire codebase** using **Web-based AI Chats** (such as **Claude.ai, ChatGPT Web, Gemini Web, DeepSeek, or Google AI Studio**) or remote cloud sandboxes that **do not have direct access to your local filesystem**.

Instead of tediously copy-pasting dozens of individual source code files one-by-one, or uploading disorganized ZIP folders that confuse AI tokenizers, Snapshort traverses your repository in milliseconds and compiles your entire project into a single, clean, token-optimized context document (Markdown or XML). 

Simply generate your snapshot and drop it straight into your browser chat window!

---

## ✨ Key Features

- **⚡ Blazing-Fast Rust Engine**: Built on **Tauri 2.0** and powered by multi-threaded parallel file scanning via Rust's **Rayon**, compiling tens of thousands of lines of code in sub-second time.
- **📦 "Zero Trimming" Philosophy**: Never lose critical project context to arbitrary truncation or hidden trimming rules.
- **🧠 LLM-Optimized Output Formats**: Export structured **Markdown (`.md`)** with fenced code blocks or syntax-tagged **XML (`.xml`)** tailored specifically for frontier AI parsing.
- **🚫 Intelligent Noise Filtering**: Automatically respects your `.gitignore`, strips out `node_modules`, debug logs, build bundles, and binary files so you never pay token penalties for junk data.
- **🌐 Global Ignore Manager**: Set persistent file extension and folder exclusion rules once across all your engineering workspaces.
- **✂️ Automated Context Chunking**: Working with massive repositories that exceed an AI UI's single-file upload size or token limit? Enable splitting to automatically partition your codebase into sequentially numbered multi-part archives without corrupting file syntax.
- **🖤 OLED Black Aesthetics**: Crafted with visual excellence—featuring true **OLED Black (`#000000`)** glassmorphism, micro-animations, and responsive interaction design.

---

## 🛠️ Technology Stack

- **Desktop Framework**: [Tauri v2](https://tauri.app/) (Rust-powered local backend & native OS integration)
- **Frontend Core**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite 5](https://vitejs.dev/)
- **Styling & Design System**: Vanilla CSS + Tailwind design tokens + OLED Black UI refinements
- **Animations & UI UX**: [Framer Motion](https://motion.dev/) & [Lucide Icons](https://lucide.dev/)
- **State Management**: [Zustand](https://docs.pmnd.rs/zustand)

---

## 🚀 Getting Started & Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended) & `npm`
- [Rust & Cargo](https://www.rust-lang.org/tools/install) (required for native Tauri compilation)
- Build essentials for your operating system (Windows C++ build tools / macOS Xcode Command Line Tools / Linux basic dependencies)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SUMANTHXT900/SNAPSHORT.git
   cd SNAPSHORT
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Run in native desktop development mode:**
   This launches the live Vite development server alongside the native Rust desktop application window:
   ```bash
   npm run tauri dev
   ```

4. **Build for production:**
   Compile a blazing-fast, lightweight native desktop installer for your platform:
   ```bash
   npm run build && npm run tauri build
   ```

---

## 🗺️ Roadmap (Coming in Version 2.0)

We are committed to continuously advancing Snapshort's capabilities. Here is what is actively in development for **v2**:

- **🔄 Changes Snapshot (Incremental Git Diffs):** Generate targeted snapshots containing solely files that have changed since your last reference baseline or Git commit. Perfect for ongoing iterative development sessions in web chats without re-uploading unchanged files! *(Note: Currently disabled in v1 to ensure absolute precision upon v2 release).*
- **📊 Advanced Token Count Estimations:** Real-time token counter approximations customized for specific model families (Claude 3.5 Sonnet, GPT-4o, Gemini 1.5 Pro, DeepSeek V3).

---

## 🤝 Contributing

Contributions, feature requests, and bug reports are welcome! 
Feel free to check out the [Issues page](https://github.com/SUMANTHXT900/SNAPSHORT/issues) or open a pull request to help make Snapshort even better.

---

## 📄 License

This project is open-source and available under the terms of the **MIT License**.
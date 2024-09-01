# 🤖 Prompt AGI

Prompt AGI is a rapid prompt engineering tool.

## ✨ Features

- Enhance your prompt

## 🛠️ Installation

1. Clone this repository:

   ```
   git clone https://github.com/adiletD/promptagi.git
   cd promptagi
   ```

2. Install the required dependencies:

   ```
   cd backend
   pip install -r requirements.txt
   ```

3. Set up your environment variables:

   - Create a `.env` file in the project root directory
   - Add the following environment variables:
     ```
     GROQ_API_KEY=groq_api_key
     ```

4. Set up the virtual environment for code execution:
   Engineer will create a virtual environment to run code the first time it executes a piece of code.
   This is just for you if you want to run the main script in a virtual environment rather than in your default one.
   ```
   python -m venv myvenv
   source myvenv/bin/activate  # On Windows, use: myvenv\Scripts\activate
   pip install -r requirements.txt
   deactivate
   ```

## 🔧 Virtual Environment Setup

Prompt AGI uses a dedicated virtual environment for code execution to ensure isolation and security. The virtual environment is automatically created the first time you run a piece of code. However, if you want to set it up manually or customize it, follow these steps:

1. Create the virtual environment:

   ```
   python -m venv myvenv
   ```

2. Activate the virtual environment:

   - On Windows:
     ```
     myvenv\Scripts\activate
     ```
   - On macOS and Linux:
     ```
     source myvenv/bin/activate
     ```

3. Install the required dependencies:

   ```
   pip install -r requirements.txt
   ```

4. Deactivate the virtual environment when you're done:
   ```
   deactivate
   ```

The myvenv virtual environment will be used for all code execution tasks, ensuring a consistent and isolated environment for running user code.

## 🚀 Usage

Run the main script to start the promptAGI server:

```
cd backend
python main.py
```

Run the UI:

```
cd front
npm install
npm run dev
```
